import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoryApi } from '@/lib/api/categories';
import { API_ENDPOINTS } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  API_ENDPOINTS: {
    categories: {
      list: '/api/v1/categories',
      get: (id: string) => `/api/v1/categories/${id}`,
      create: '/api/v1/categories',
      update: (id: string) => `/api/v1/categories/${id}`,
      delete: (id: string) => `/api/v1/categories/${id}`,
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

describe('categoryApi', () => {
  it('getAll should fetch all categories', async () => {
    mockGet.mockResolvedValue({ data: [{ id: '1', name: 'Tech' }] } as any);
    const result = await categoryApi.getAll();
    expect(mockGet).toHaveBeenCalledWith('/api/v1/categories');
    expect(result.data).toEqual([{ id: '1', name: 'Tech' }]);
  });

  it('getById should fetch single category', async () => {
    mockGet.mockResolvedValue({ data: { id: '1', name: 'Tech' } } as any);
    await categoryApi.getById('1');
    expect(mockGet).toHaveBeenCalledWith('/api/v1/categories/1');
  });

  it('create should POST category data', async () => {
    const data = { name: 'New', slug: 'new' };
    mockPost.mockResolvedValue({ data: { id: '2', ...data } } as any);
    await categoryApi.create(data);
    expect(mockPost).toHaveBeenCalledWith('/api/v1/categories', data);
  });

  it('update should PUT category data', async () => {
    const data = { name: 'Updated', slug: 'updated' };
    mockPut.mockResolvedValue({ data: { id: '1', ...data } } as any);
    await categoryApi.update('1', data);
    expect(mockPut).toHaveBeenCalledWith('/api/v1/categories/1', data);
  });

  it('delete should DELETE category by id', async () => {
    mockDelete.mockResolvedValue({} as any);
    await categoryApi.delete('1');
    expect(mockDelete).toHaveBeenCalledWith('/api/v1/categories/1');
  });
});
