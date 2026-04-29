import { apiClient, API_ENDPOINTS } from './client';
import type { Category } from '@/types';

export const categoryApi = {
  getAll: () => apiClient.get<Category[]>(API_ENDPOINTS.categories.list),

  getById: (id: string) => apiClient.get<Category>(API_ENDPOINTS.categories.get(id)),

  create: (data: { name: string; description?: string; slug: string }) =>
    apiClient.post<Category>(API_ENDPOINTS.categories.create, data),

  update: (id: string, data: { name: string; description?: string; slug: string }) =>
    apiClient.put<Category>(API_ENDPOINTS.categories.update(id), data),

  delete: (id: string) => apiClient.delete(API_ENDPOINTS.categories.delete(id)),
};