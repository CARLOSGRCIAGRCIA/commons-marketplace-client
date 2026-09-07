import { apiClient, API_ENDPOINTS } from './client';
import type { Review } from '@/types';
import type { ReviewListResponse } from '@/types/api';

export type { ReviewListResponse };

export const reviewApi = {
  getAll: (filters?: { productId?: string; page?: number; limit?: number }) =>
    apiClient.get<ReviewListResponse>(API_ENDPOINTS.reviews.list, filters as Record<string, unknown>),

  getById: (id: string) => apiClient.get<Review>(API_ENDPOINTS.reviews.get(id)),

  create: (data: {
    userId: string;
    type: 'product' | 'store';
    productId?: string;
    storeId?: string;
    score: number;
    commentary?: string;
  }) => apiClient.post<Review>(API_ENDPOINTS.reviews.create, data),

  update: (id: string, data: { score?: number; commentary?: string }) =>
    apiClient.put<Review>(API_ENDPOINTS.reviews.update(id), data),

  delete: (id: string) => apiClient.delete(API_ENDPOINTS.reviews.delete(id)),
};