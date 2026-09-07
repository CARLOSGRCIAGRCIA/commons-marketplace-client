import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useReviews } from '@/hooks/use-reviews';

vi.mock('@/lib/api', () => ({
  reviewApi: {
    getAll: vi.fn(),
  },
}));

import { reviewApi } from '@/lib/api';

const mockGetAll = vi.mocked(reviewApi.getAll);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useReviews', () => {
  it('should fetch reviews on mount', async () => {
    mockGetAll.mockResolvedValue({
      reviews: [
        { id: '1', score: 5, commentary: 'Great' },
        { id: '2', score: 3, commentary: 'Ok' },
      ],
    } as any);
    const { result } = renderHook(() => useReviews('product1'));
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.reviews).toHaveLength(2);
    expect(result.current.avgScore).toBe(4);
    expect(result.current.reviewCount).toBe(2);
  });

  it('should handle empty reviews', async () => {
    mockGetAll.mockResolvedValue({ reviews: [] } as any);
    const { result } = renderHook(() => useReviews('product1'));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.reviews).toHaveLength(0);
    expect(result.current.avgScore).toBe(0);
    expect(result.current.reviewCount).toBe(0);
  });

  it('should handle null reviews response', async () => {
    mockGetAll.mockResolvedValue(null as any);
    const { result } = renderHook(() => useReviews('product1'));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.reviews).toEqual([]);
  });

  it('should handle error', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useReviews('product1'));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).toBe('Network error');
  });

  it('should handle non-Error thrown value', async () => {
    mockGetAll.mockRejectedValue('string error');
    const { result } = renderHook(() => useReviews('product1'));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).toBe('Error al cargar reseñas');
  });
});
