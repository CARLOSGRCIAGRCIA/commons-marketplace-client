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

  it('should return cached stores on second call', async () => {
    const getAll = vi.fn().mockResolvedValue({
      data: [{ id: '1', name: 'Cached Store' }],
      total: 1,
      page: 1,
      totalPages: 1,
    });
    vi.doMock('@/lib/api', () => ({
      storeApi: { getAll, getById: vi.fn() },
    }));
    const { useStores } = await import('@/hooks/use-stores');

    const { result: result1 } = renderHook(() => useStores());
    await waitFor(() => expect(result1.current.isLoading).toBe(false));

    const { result: result2 } = renderHook(() => useStores());
    await waitFor(() => expect(result2.current.isLoading).toBe(false));

    expect(getAll).toHaveBeenCalledTimes(1);
    expect(result2.current.stores).toHaveLength(1);
  });

  it('should use refetch to reload stores', async () => {
    const getAll = vi.fn()
      .mockResolvedValueOnce({ data: [{ id: '1' }], total: 1, page: 1, totalPages: 1 })
      .mockResolvedValueOnce({ data: [{ id: '1' }, { id: '2' }], total: 2, page: 1, totalPages: 1 });
    vi.doMock('@/lib/api', () => ({
      storeApi: { getAll, getById: vi.fn() },
    }));
    const { useStores } = await import('@/hooks/use-stores');
    const { result } = renderHook(() => useStores());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.stores).toHaveLength(1);

    const realDateNow = Date.now;
    Date.now = vi.fn(() => realDateNow() + 120_000);
    result.current.refetch();
    await waitFor(() => expect(result.current.stores).toHaveLength(2));
    Date.now = realDateNow;
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

  it('should return cached store on second call', async () => {
    const getById = vi.fn().mockResolvedValue({ id: '1', name: 'Cached' });
    vi.doMock('@/lib/api', () => ({
      storeApi: { getAll: vi.fn(), getById },
    }));
    const { useStore } = await import('@/hooks/use-stores');

    const { result: result1 } = renderHook(() => useStore('1'));
    await waitFor(() => expect(result1.current.isLoading).toBe(false));

    const { result: result2 } = renderHook(() => useStore('1'));
    await waitFor(() => expect(result2.current.isLoading).toBe(false));

    expect(getById).toHaveBeenCalledTimes(1);
    expect(result2.current.store?.name).toBe('Cached');
  });

  it('should not fetch when id is empty', async () => {
    const getById = vi.fn();
    vi.doMock('@/lib/api', () => ({
      storeApi: { getAll: vi.fn(), getById },
    }));
    const { useStore } = await import('@/hooks/use-stores');
    const { result } = renderHook(() => useStore(''));
    await new Promise((r) => setTimeout(r, 50));
    expect(result.current.store).toBeNull();
    expect(getById).not.toHaveBeenCalled();
  });
});
