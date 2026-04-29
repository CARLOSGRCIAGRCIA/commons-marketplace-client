import { apiClient, API_ENDPOINTS } from './client';
import type { Product, ProductFilters } from '@/types';

export const productApi = {
  getAll: (filters?: ProductFilters) =>
    apiClient.get<unknown>(API_ENDPOINTS.products.list, filters as Record<string, unknown>),

  getById: (id: string) => apiClient.get<Product>(API_ENDPOINTS.products.get(id)),

  getByStore: (storeId: string, filters?: { page?: number; limit?: number }) =>
    apiClient.get<unknown>(
      API_ENDPOINTS.products.byStore(storeId),
      filters as Record<string, unknown>
    ),

  create: (data: FormData) => apiClient.post<Product>(API_ENDPOINTS.products.create, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  update: (id: string, data: FormData) =>
    apiClient.put<Product>(API_ENDPOINTS.products.update(id), data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) => apiClient.delete(API_ENDPOINTS.products.delete(id)),
};