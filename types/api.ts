import type { StoreStatus } from './index';

export interface RefreshResponse {
  message: string;
  token: string;
  expiresAt?: number;
}

export interface StoreFilters {
  status?: StoreStatus | string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface ReviewListResponse {
  message: string;
  reviews: import('./index').Review[];
  count: number;
}

export interface AdminStats {
  totalUsers: number;
  totalStores: number;
  totalProducts: number;
  totalReviews: number;
  pendingStores: number;
  pendingSellerRequests: number;
}

export interface StoreSummary {
  _id: string;
  storeName?: string;
  description?: string;
  status?: string;
}

export interface UserSummary {
  _id: string;
}
