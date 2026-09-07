import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storeApi } from '@/lib/api/stores';
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
    stores: {
      list: '/api/v1/stores',
      get: (id: string) => `/api/v1/stores/${id}`,
      me: '/api/v1/stores/me',
      create: '/api/v1/stores',
      update: (id: string) => `/api/v1/stores/${id}`,
      delete: (id: string) => `/api/v1/stores/${id}`,
      pending: '/api/v1/stores/admin/pending',
      updateStatus: (id: string) => `/api/v1/stores/admin/${id}/status`,
    },
  },
}));

import { apiClient } from '@/lib/api/client';

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);
const mockDelete = vi.mocked(apiClient.delete);
const mockPatch = vi.mocked(apiClient.patch);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('storeApi', () => {
  it('getAll should fetch stores', async () => {
    mockGet.mockResolvedValue({ data: [{ id: '1' }] } as any);
    await storeApi.getAll();
    expect(mockGet).toHaveBeenCalledWith('/api/v1/stores', undefined);
  });

  it('getAll should pass filters', async () => {
    mockGet.mockResolvedValue({ data: [] } as any);
    await storeApi.getAll({ status: 'approved', search: 'test' });
    expect(mockGet).toHaveBeenCalledWith('/api/v1/stores', { status: 'approved', search: 'test' });
  });

  it('getById should fetch single store', async () => {
    mockGet.mockResolvedValue({ data: { id: '1', name: 'Store' } } as any);
    await storeApi.getById('1');
    expect(mockGet).toHaveBeenCalledWith('/api/v1/stores/1');
  });

  it('getMyStores should fetch user stores', async () => {
    mockGet.mockResolvedValue({ data: [] } as any);
    await storeApi.getMyStores();
    expect(mockGet).toHaveBeenCalledWith('/api/v1/stores/me');
  });

  it('create should POST with FormData', async () => {
    const formData = new FormData();
    mockPost.mockResolvedValue({ data: { id: '1' } } as any);
    await storeApi.create(formData);
    expect(mockPost).toHaveBeenCalledWith('/api/v1/stores', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });

  it('update should PUT with FormData', async () => {
    const formData = new FormData();
    mockPut.mockResolvedValue({ data: { id: '1' } } as any);
    await storeApi.update('1', formData);
    expect(mockPut).toHaveBeenCalledWith('/api/v1/stores/1', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });

  it('delete should DELETE store by id', async () => {
    mockDelete.mockResolvedValue({} as any);
    await storeApi.delete('1');
    expect(mockDelete).toHaveBeenCalledWith('/api/v1/stores/1');
  });

  it('getPending should fetch pending stores', async () => {
    mockGet.mockResolvedValue({ data: [] } as any);
    await storeApi.getPending();
    expect(mockGet).toHaveBeenCalledWith('/api/v1/stores/admin/pending');
  });

  it('updateStatus should PATCH status', async () => {
    mockPatch.mockResolvedValue({} as any);
    await storeApi.updateStatus('1', 'approved' as any);
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/stores/admin/1/status', { status: 'approved' });
  });
});
