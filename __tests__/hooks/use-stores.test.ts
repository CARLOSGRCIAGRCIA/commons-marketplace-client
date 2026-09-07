import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('useStores', () => {
  it('should fetch stores on mount', async () => {
    vi.doMock('@/lib/api', () => ({
      storeApi: {
        getAll: vi.fn().mockResolvedValue({
          data: [{ id: '1', name: 'Store' }],
          total: 1,
          page: 1,
          totalPages: 1,
        }),
        getById: vi.fn(),
      },
    }));
    const { useStores } = await import('@/hooks/use-stores');
    const { result } = renderHook(() => useStores());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.stores).toHaveLength(1);
    expect(result.current.total).toBe(1);
  });

  it('should handle array response', async () => {
    vi.doMock('@/lib/api', () => ({
      storeApi: {
        getAll: vi.fn().mockResolvedValue([{ id: '1', name: 'Store' }]),
        getById: vi.fn(),
      },
    }));
    const { useStores } = await import('@/hooks/use-stores');
    const { result } = renderHook(() => useStores());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.stores).toHaveLength(1);
  });

  it('should handle error', async () => {
    vi.doMock('@/lib/api', () => ({
      storeApi: {
        getAll: vi.fn().mockRejectedValue(new Error('Network error')),
        getById: vi.fn(),
      },
    }));
    const { useStores } = await import('@/hooks/use-stores');
    const { result } = renderHook(() => useStores());
    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });
  });

  it('should handle non-Error thrown value', async () => {
    vi.doMock('@/lib/api', () => ({
      storeApi: {
        getAll: vi.fn().mockRejectedValue('string error'),
        getById: vi.fn(),
      },
    }));
    const { useStores } = await import('@/hooks/use-stores');
    const { result } = renderHook(() => useStores());
    await waitFor(() => {
      expect(result.current.error).toBe('Error al cargar tiendas');
    });
  });

  it('should handle empty response', async () => {
    vi.doMock('@/lib/api', () => ({
      storeApi: {
        getAll: vi.fn().mockResolvedValue({}),
        getById: vi.fn(),
      },
    }));
    const { useStores } = await import('@/hooks/use-stores');
    const { result } = renderHook(() => useStores());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.stores).toEqual([]);
  });
});

describe('useStore', () => {
  it('should fetch store by id', async () => {
    vi.doMock('@/lib/api', () => ({
      storeApi: {
        getAll: vi.fn(),
        getById: vi.fn().mockResolvedValue({ id: '1', name: 'Store' }),
      },
    }));
    const { useStore } = await import('@/hooks/use-stores');
    const { result } = renderHook(() => useStore('1'));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.store?.name).toBe('Store');
  });

  it('should handle error', async () => {
    vi.doMock('@/lib/api', () => ({
      storeApi: {
        getAll: vi.fn(),
        getById: vi.fn().mockRejectedValue(new Error('Not found')),
      },
    }));
    const { useStore } = await import('@/hooks/use-stores');
    const { result } = renderHook(() => useStore('999'));
    await waitFor(() => {
      expect(result.current.error).toBe('Not found');
    });
  });

  it('should handle non-Error thrown value', async () => {
    vi.doMock('@/lib/api', () => ({
      storeApi: {
        getAll: vi.fn(),
        getById: vi.fn().mockRejectedValue('string error'),
      },
    }));
    const { useStore } = await import('@/hooks/use-stores');
    const { result } = renderHook(() => useStore('1'));
    await waitFor(() => {
      expect(result.current.error).toBe('Error al cargar tienda');
    });
  });
});
