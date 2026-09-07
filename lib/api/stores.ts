import { apiClient, API_ENDPOINTS } from './client';
import type { Store, StoreStatus } from '@/types';
import type { StoreFilters } from '@/types/api';

export const storeApi = {
  getAll: (filters?: StoreFilters) =>
    apiClient.get<unknown>(API_ENDPOINTS.stores.list, filters as Record<string, unknown>),

  getById: (id: string) => apiClient.get<Store>(API_ENDPOINTS.stores.get(id)),

  getMyStores: () => apiClient.get<Store[]>(API_ENDPOINTS.stores.me),

  create: (data: FormData) =>
    apiClient.post<Store>(API_ENDPOINTS.stores.create, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: FormData) =>
    apiClient.put<Store>(API_ENDPOINTS.stores.update(id), data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) => apiClient.delete(API_ENDPOINTS.stores.delete(id)),

  getPending: () => apiClient.get<Store[]>(API_ENDPOINTS.stores.pending),

  updateStatus: (id: string, status: StoreStatus) =>
    apiClient.patch(API_ENDPOINTS.stores.updateStatus(id), { status }),
};