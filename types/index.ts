export type UserRole = 'buyer' | 'seller' | 'admin';

export type ProductStatus = 'Active' | 'Inactive' | 'OutOfStock' | 'Deleted';

export type StoreStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended';

export type SellerRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface User {
  _id: string;
  id?: string;
  name: string;
  lastName?: string;
  email: string;
  role: UserRole;
  profilePicUrl?: string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  storeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  _id: string;
  id: string;
  userId: string;
  storeName: string;
  slug?: string;
  description?: string;
  logo?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  status: StoreStatus;
  categoryIds: string[];
  productCount?: number;
  createdAt: string;
  updatedAt: string;
  owner?: User;
}

export interface Product {
  _id: string;
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  sellerId: string;
  storeId: string;
  mainImageUrl?: string;
  imageUrls: string[];
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  store?: Store;
  category?: Category;
  seller?: User;
}

export function getProductId(product: Product): string {
  return product._id || product.id || '';
}

export function getProductSlug(product: Product): string {
  return product.slug || product._id || product.id || '';
}

export function getStoreId(store: Store): string {
  return store._id || store.id || '';
}

export function getStoreSlug(store: Store): string {
  return store.slug || store._id || store.id || '';
}

export interface Review {
  id: string;
  userId: string;
  type: 'product' | 'store';
  productId?: string;
  storeId?: string;
  score: 1 | 2 | 3 | 4 | 5;
  commentary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  id?: string;
  participants: User[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readBy: string[];
  createdAt: string;
}

export interface SellerRequest {
  _id: string;
  userId: string;
  status: SellerRequestStatus;
  message?: string;
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface AuthResponse {
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: User;
  needsEmailConfirmation?: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface ProductFilters {
  categoryId?: string;
  storeId?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: ProductStatus;
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalProducts: number;
  totalReviews: number;
  pendingStores: number;
  pendingSellerRequests: number;
}