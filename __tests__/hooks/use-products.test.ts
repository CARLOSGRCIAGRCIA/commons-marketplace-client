import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('useProducts', () => {
  it('should fetch products on mount', async () => {
    vi.doMock('@/lib/api', () => ({
      productApi: {
        getAll: vi.fn().mockResolvedValue({
          products: [{ id: '1', name: 'Widget' }],
          pagination: { totalItems: 1, currentPage: 1, totalPages: 1 },
        }),
        getById: vi.fn().mockResolvedValue({ id: '1', name: 'Widget' }),
      },
    }));
    const { useProducts } = await import('@/hooks/use-products');
    const { result } = renderHook(() => useProducts());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.products).toHaveLength(1);
    expect(result.current.total).toBe(1);
    expect(result.current.page).toBe(1);
  });

  it('should handle data format with data array', async () => {
    vi.doMock('@/lib/api', () => ({
      productApi: {
        getAll: vi.fn().mockResolvedValue({
          data: [{ id: '1', name: 'Widget' }],
          total: 5,
          page: 2,
          totalPages: 3,
        }),
        getById: vi.fn(),
      },
    }));
    const { useProducts } = await import('@/hooks/use-products');
    const { result } = renderHook(() => useProducts({ page: 2 }));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.products).toHaveLength(1);
    expect(result.current.total).toBe(5);
  });

  it('should handle error', async () => {
    vi.doMock('@/lib/api', () => ({
      productApi: {
        getAll: vi.fn().mockRejectedValue(new Error('Network error')),
        getById: vi.fn(),
      },
    }));
    const { useProducts } = await import('@/hooks/use-products');
    const { result } = renderHook(() => useProducts());
    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });
  });

  it('should handle non-Error thrown value', async () => {
    vi.doMock('@/lib/api', () => ({
      productApi: {
        getAll: vi.fn().mockRejectedValue('string error'),
        getById: vi.fn(),
      },
    }));
    const { useProducts } = await import('@/hooks/use-products');
    const { result } = renderHook(() => useProducts());
    await waitFor(() => {
      expect(result.current.error).toBe('Error al cargar productos');
    });
  });

  it('should return empty products for null response', async () => {
    vi.doMock('@/lib/api', () => ({
      productApi: {
        getAll: vi.fn().mockResolvedValue(null),
        getById: vi.fn(),
      },
    }));
    const { useProducts } = await import('@/hooks/use-products');
    const { result } = renderHook(() => useProducts());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.products).toEqual([]);
  });

  it('should return cached products on second call', async () => {
    const getAll = vi.fn().mockResolvedValue({
      products: [{ id: '1', name: 'Widget' }],
      pagination: { totalItems: 1, currentPage: 1, totalPages: 1 },
    });
    vi.doMock('@/lib/api', () => ({
      productApi: { getAll, getById: vi.fn() },
    }));
    const { useProducts } = await import('@/hooks/use-products');

    const { result: result1 } = renderHook(() => useProducts());
    await waitFor(() => expect(result1.current.isLoading).toBe(false));

    const { result: result2 } = renderHook(() => useProducts());
    await waitFor(() => expect(result2.current.isLoading).toBe(false));

    expect(getAll).toHaveBeenCalledTimes(1);
    expect(result2.current.products).toHaveLength(1);
  });

  it('should use refetch to reload products', async () => {
    const getAll = vi.fn()
      .mockResolvedValueOnce({
        products: [{ id: '1' }],
        pagination: { totalItems: 1, currentPage: 1, totalPages: 1 },
      })
      .mockResolvedValueOnce({
        products: [{ id: '1' }, { id: '2' }],
        pagination: { totalItems: 2, currentPage: 1, totalPages: 1 },
      });
    vi.doMock('@/lib/api', () => ({
      productApi: { getAll, getById: vi.fn() },
    }));
    const { useProducts } = await import('@/hooks/use-products');
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.products).toHaveLength(1);

    const realDateNow = Date.now;
    Date.now = vi.fn(() => realDateNow() + 120_000);
    result.current.refetch();
    await waitFor(() => expect(result.current.products).toHaveLength(2));
    Date.now = realDateNow;
  });
});

describe('useProduct', () => {
  it('should fetch product by id', async () => {
    vi.doMock('@/lib/api', () => ({
      productApi: {
        getAll: vi.fn(),
        getById: vi.fn().mockResolvedValue({ id: '1', name: 'Widget' }),
      },
    }));
    const { useProduct } = await import('@/hooks/use-products');
    const { result } = renderHook(() => useProduct('1'));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.product?.name).toBe('Widget');
  });

  it('should handle error', async () => {
    vi.doMock('@/lib/api', () => ({
      productApi: {
        getAll: vi.fn(),
        getById: vi.fn().mockRejectedValue(new Error('Not found')),
      },
    }));
    const { useProduct } = await import('@/hooks/use-products');
    const { result } = renderHook(() => useProduct('999'));
    await waitFor(() => {
      expect(result.current.error).toBe('Not found');
    });
  });

  it('should handle non-Error thrown value', async () => {
    vi.doMock('@/lib/api', () => ({
      productApi: {
        getAll: vi.fn(),
        getById: vi.fn().mockRejectedValue('string error'),
      },
    }));
    const { useProduct } = await import('@/hooks/use-products');
    const { result } = renderHook(() => useProduct('1'));
    await waitFor(() => {
      expect(result.current.error).toBe('Error al cargar producto');
    });
  });

  it('should return cached product on second call', async () => {
    const getById = vi.fn().mockResolvedValue({ id: '1', name: 'Cached Widget' });
    vi.doMock('@/lib/api', () => ({
      productApi: { getAll: vi.fn(), getById },
    }));
    const { useProduct } = await import('@/hooks/use-products');

    const { result: result1 } = renderHook(() => useProduct('1'));
    await waitFor(() => expect(result1.current.isLoading).toBe(false));

    const { result: result2 } = renderHook(() => useProduct('1'));
    await waitFor(() => expect(result2.current.isLoading).toBe(false));

    expect(getById).toHaveBeenCalledTimes(1);
    expect(result2.current.product?.name).toBe('Cached Widget');
  });

  it('should not fetch when id is empty', async () => {
    const getById = vi.fn();
    vi.doMock('@/lib/api', () => ({
      productApi: { getAll: vi.fn(), getById },
    }));
    const { useProduct } = await import('@/hooks/use-products');
    const { result } = renderHook(() => useProduct(''));
    await new Promise((r) => setTimeout(r, 50));
    expect(result.current.product).toBeNull();
    expect(getById).not.toHaveBeenCalled();
  });
});
