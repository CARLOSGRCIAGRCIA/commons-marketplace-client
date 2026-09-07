import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('useCategories', () => {
  it('should fetch categories on mount', async () => {
    vi.doMock('@/lib/api', () => ({
      categoryApi: {
        getAll: vi.fn().mockResolvedValue([
          { id: '1', name: 'Tech', slug: 'tech' },
          { id: '2', name: 'Food', slug: 'food' },
        ]),
      },
    }));
    const { useCategories } = await import('@/hooks/use-categories');
    const { result } = renderHook(() => useCategories());
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.categories).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('should handle empty categories', async () => {
    vi.doMock('@/lib/api', () => ({
      categoryApi: {
        getAll: vi.fn().mockResolvedValue([]),
      },
    }));
    const { useCategories } = await import('@/hooks/use-categories');
    const { result } = renderHook(() => useCategories());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.categories).toEqual([]);
  });

  it('should handle null response', async () => {
    vi.doMock('@/lib/api', () => ({
      categoryApi: {
        getAll: vi.fn().mockResolvedValue(null),
      },
    }));
    const { useCategories } = await import('@/hooks/use-categories');
    const { result } = renderHook(() => useCategories());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.categories).toEqual([]);
  });

  it('should handle error', async () => {
    vi.doMock('@/lib/api', () => ({
      categoryApi: {
        getAll: vi.fn().mockRejectedValue(new Error('API error')),
      },
    }));
    const { useCategories } = await import('@/hooks/use-categories');
    const { result } = renderHook(() => useCategories());
    await waitFor(() => {
      expect(result.current.error).toBe('API error');
    });
  });

  it('should handle non-Error thrown value', async () => {
    vi.doMock('@/lib/api', () => ({
      categoryApi: {
        getAll: vi.fn().mockRejectedValue('string error'),
      },
    }));
    const { useCategories } = await import('@/hooks/use-categories');
    const { result } = renderHook(() => useCategories());
    await waitFor(() => {
      expect(result.current.error).toBe('Error al cargar categorías');
    });
  });
});
