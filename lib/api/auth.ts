import { apiClient, API_ENDPOINTS } from './client';
import type { AuthResponse, User } from '@/types';

export const authApi = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, data),

  logout: () => apiClient.post(API_ENDPOINTS.auth.logout),
};

export const userApi = {
  getMe: () => apiClient.get<User>(API_ENDPOINTS.users.me),

  update: (id: string, data: FormData) =>
    apiClient.put<User>(API_ENDPOINTS.users.update(id), data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};