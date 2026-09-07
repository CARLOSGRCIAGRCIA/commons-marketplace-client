import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productApi } from '@/lib/api/products';
import { API_ENDPOINTS } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  API_ENDPOINTS: {
    products: {
      list: '/api/v1/products',
      get: (id: string) => `/api/v1/products/${id}`,
      byStore: (storeId: string) => `/api/v1/products/store/${storeId}`,
      create: '/api/v1/products',
      update: (id: string) => `/api/v1/products/${id}`,
      delete: (id: string) => `/api/v1/products/${id}`,
    },
  },
}));

import { apiClient } from '@/lib/api/client';

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);
const mockDelete = vi.mocked(apiClient.delete);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('productApi', () => {
  it('getAll should fetch products', async () => {
    mockGet.mockResolvedValue({ data: { products: [] } } as any);
    await productApi.getAll();
    expect(mockGet).toHaveBeenCalledWith('/api/v1/products', undefined);
  });

  it('getAll should pass filters', async () => {
    mockGet.mockResolvedValue({ data: { products: [] } } as any);
    await productApi.getAll({ search: 'test', categoryId: 'cat1' });
    expect(mockGet).toHaveBeenCalledWith('/api/v1/products', { search: 'test', categoryId: 'cat1' });
  });

  it('getById should fetch single product', async () => {
    mockGet.mockResolvedValue({ data: { id: '1' } } as any);
    await productApi.getById('1');
    expect(mockGet).toHaveBeenCalledWith('/api/v1/products/1');
  });

  it('getByStore should fetch products by store', async () => {
    mockGet.mockResolvedValue({ data: { products: [] } } as any);
    await productApi.getByStore('store1');
    expect(mockGet).toHaveBeenCalledWith('/api/v1/products/store/store1', undefined);
  });

  it('getByStore should pass pagination filters', async () => {
    mockGet.mockResolvedValue({ data: { products: [] } } as any);
    await productApi.getByStore('store1', { page: 2, limit: 10 });
    expect(mockGet).toHaveBeenCalledWith('/api/v1/products/store/store1', { page: 2, limit: 10 });
  });

  it('create should POST with FormData', async () => {
    const formData = new FormData();
    mockPost.mockResolvedValue({ data: { id: '1' } } as any);
    await productApi.create(formData);
    expect(mockPost).toHaveBeenCalledWith('/api/v1/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });

  it('update should PUT with FormData', async () => {
    const formData = new FormData();
    mockPut.mockResolvedValue({ data: { id: '1' } } as any);
    await productApi.update('1', formData);
    expect(mockPut).toHaveBeenCalledWith('/api/v1/products/1', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });

  it('delete should DELETE product by id', async () => {
    mockDelete.mockResolvedValue({} as any);
    await productApi.delete('1');
    expect(mockDelete).toHaveBeenCalledWith('/api/v1/products/1');
  });
});
