import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_URL, API_ENDPOINTS } from './endpoints';
import { sanitizeFormData } from '@/lib/sanitize';

interface RefreshResponse {
  message: string;
  token: string;
  expiresAt?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string | null) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (config.data instanceof FormData) {
          config.data = sanitizeFormData(config.data);
        }

        if (typeof window !== 'undefined') {
          try {
            const authData = localStorage.getItem('auth-storage');
            if (authData) {
              const parsed = JSON.parse(authData);
              const token = parsed?.state?.token;
              if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
              }
            }
          } catch (e) {
            console.error('[API] Error reading token:', e);
          }
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise<string | null>((resolve) => {
              this.refreshSubscribers.push(resolve);
            }).then((token) => {
              if (!token) {
                return Promise.reject(error);
              }
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const token = await this.refreshToken();

            if (token) {
              this.refreshSubscribers.forEach((resolve) => resolve(token));
              this.refreshSubscribers = [];

              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            } else {
              this.refreshSubscribers.forEach((resolve) => resolve(null));
              this.refreshSubscribers = [];
              this.handleLogout();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            this.refreshSubscribers.forEach((resolve) => resolve(null));
            this.refreshSubscribers = [];
            this.handleLogout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const authData = localStorage.getItem('auth-storage');
      if (!authData) return null;
      
      const parsed = JSON.parse(authData);
      const refreshToken = parsed?.state?.refreshToken;
      if (!refreshToken) return null;

      const response = await this.client.post<RefreshResponse>(
        API_ENDPOINTS.auth.refresh,
        { refreshToken }
      );

      const newToken = response.data.token;
      if (newToken) {
        const newAuthData = {
          ...parsed,
          state: {
            ...parsed.state,
            token: newToken,
            expiresAt: response.data.expiresAt,
          },
        };
        localStorage.setItem('auth-storage', JSON.stringify(newAuthData));
        return newToken;
      }
      
      return null;
    } catch (error) {
      console.error('[API] Token refresh failed:', error);
      return null;
    }
  }

  private handleLogout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
      window.location.href = '/';
    }
  }

  get<T>(url: string, params?: Record<string, unknown>) {
    return this.client.get<T>(url, { params }).then((res) => res.data);
  }

  post<T>(url: string, data?: unknown, config?: unknown) {
    return this.client.post<T>(url, data, config as InternalAxiosRequestConfig).then((res) => res.data);
  }

  put<T>(url: string, data?: unknown, config?: unknown) {
    return this.client.put<T>(url, data, config as InternalAxiosRequestConfig).then((res) => res.data);
  }

  patch<T>(url: string, data?: unknown) {
    return this.client.patch<T>(url, data).then((res) => res.data);
  }

  delete<T>(url: string) {
    return this.client.delete<T>(url).then((res) => res.data);
  }
}

export const apiClient = new ApiClient();

export { API_ENDPOINTS };