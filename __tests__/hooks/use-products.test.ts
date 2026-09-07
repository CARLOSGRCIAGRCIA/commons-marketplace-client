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
});
