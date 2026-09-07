import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi, userApi } from '@/lib/api/auth';
import { API_ENDPOINTS } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
  API_ENDPOINTS: {
    auth: {
      register: '/api/v1/auth/register',
      login: '/api/v1/auth/login',
      logout: '/api/v1/auth/logout',
    },
    users: {
      me: '/api/v1/users/me',
      update: (id: string) => `/api/v1/users/${id}`,
    },
  },
}));

import { apiClient } from '@/lib/api/client';

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authApi', () => {
  describe('register', () => {
    it('should call POST with correct data', async () => {
      const data = { name: 'John', email: 'john@test.com', password: '123', role: 'buyer' };
      mockPost.mockResolvedValue({ data: { token: 'abc', user: { id: '1' } } } as any);
      await authApi.register(data);
      expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.auth.register, data);
    });
  });

  describe('login', () => {
    it('should call POST with email and password', async () => {
      const data = { email: 'john@test.com', password: '123' };
      mockPost.mockResolvedValue({ data: { token: 'abc' } } as any);
      await authApi.login(data);
      expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.auth.login, data);
    });
  });

  describe('logout', () => {
    it('should call POST to logout endpoint', async () => {
      mockPost.mockResolvedValue({} as any);
      await authApi.logout();
      expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.auth.logout);
    });
  });
});

describe('userApi', () => {
  describe('getMe', () => {
    it('should call GET on users/me', async () => {
      mockGet.mockResolvedValue({ data: { id: '1', name: 'John' } } as any);
      await userApi.getMe();
      expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.users.me);
    });
  });

  describe('update', () => {
    it('should call PUT with FormData and multipart header', async () => {
      const formData = new FormData();
      formData.append('name', 'Jane');
      mockPut.mockResolvedValue({ data: { id: '1' } } as any);
      await userApi.update('1', formData);
      expect(mockPut).toHaveBeenCalledWith(
        API_ENDPOINTS.users.update('1'),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    });
  });
});
