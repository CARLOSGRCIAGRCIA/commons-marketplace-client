import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reviewApi } from '@/lib/api/reviews';
import { API_ENDPOINTS } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  API_ENDPOINTS: {
    reviews: {
      list: '/api/v1/reviews',
      get: (id: string) => `/api/v1/reviews/${id}`,
      create: '/api/v1/reviews',
      update: (id: string) => `/api/v1/reviews/${id}`,
      delete: (id: string) => `/api/v1/reviews/${id}`,
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

describe('reviewApi', () => {
  it('getAll should fetch reviews', async () => {
    mockGet.mockResolvedValue({ data: { data: [], total: 0 } } as any);
    await reviewApi.getAll();
    expect(mockGet).toHaveBeenCalledWith('/api/v1/reviews', undefined);
  });

  it('getAll should pass filters', async () => {
    mockGet.mockResolvedValue({ data: { data: [] } } as any);
    await reviewApi.getAll({ productId: 'p1', page: 1, limit: 5 });
    expect(mockGet).toHaveBeenCalledWith('/api/v1/reviews', { productId: 'p1', page: 1, limit: 5 });
  });

  it('getById should fetch single review', async () => {
    mockGet.mockResolvedValue({ data: { id: '1' } } as any);
    await reviewApi.getById('1');
    expect(mockGet).toHaveBeenCalledWith('/api/v1/reviews/1');
  });

  it('create should POST review data', async () => {
    const data = { userId: 'u1', type: 'product' as const, score: 5, productId: 'p1' };
    mockPost.mockResolvedValue({ data: { id: '1', ...data } } as any);
    await reviewApi.create(data);
    expect(mockPost).toHaveBeenCalledWith('/api/v1/reviews', data);
  });

  it('update should PUT review data', async () => {
    const data = { score: 4, commentary: 'Good' };
    mockPut.mockResolvedValue({ data: { id: '1', ...data } } as any);
    await reviewApi.update('1', data);
    expect(mockPut).toHaveBeenCalledWith('/api/v1/reviews/1', data);
  });

  it('delete should DELETE review by id', async () => {
    mockDelete.mockResolvedValue({} as any);
    await reviewApi.delete('1');
    expect(mockDelete).toHaveBeenCalledWith('/api/v1/reviews/1');
  });
});
