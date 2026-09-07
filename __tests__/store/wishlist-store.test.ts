import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWishlistStore } from '@/store/wishlist-store';

vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
  API_ENDPOINTS: {
    wishlist: {
      list: '/api/v1/wishlist',
      add: '/api/v1/wishlist',
      remove: (id: string) => `/api/v1/wishlist/${id}`,
      check: (id: string) => `/api/v1/wishlist/check/${id}`,
      clear: '/api/v1/wishlist',
    },
  },
}));

import { apiClient } from '@/lib/api';

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockDelete = vi.mocked(apiClient.delete);

beforeEach(() => {
  vi.clearAllMocks();
  useWishlistStore.setState({ items: [], isLoading: false });
});

describe('useWishlistStore', () => {
  describe('fetchWishlist', () => {
    it('should fetch and set items', async () => {
      mockGet.mockResolvedValue({
        data: { items: [{ _id: '1', productId: { _id: 'p1' } }] },
      } as any);
      await useWishlistStore.getState().fetchWishlist();
      expect(useWishlistStore.getState().items).toHaveLength(1);
    });

    it('should handle empty response', async () => {
      mockGet.mockResolvedValue({ data: null } as any);
      await useWishlistStore.getState().fetchWishlist();
      expect(useWishlistStore.getState().items).toEqual([]);
    });

    it('should handle error', async () => {
      mockGet.mockRejectedValue(new Error('fail'));
      await useWishlistStore.getState().fetchWishlist();
      expect(useWishlistStore.getState().items).toEqual([]);
    });
  });

  describe('addToWishlist', () => {
    it('should add item to wishlist', async () => {
      mockPost.mockResolvedValue({} as any);
      await useWishlistStore.getState().addToWishlist('p1');
      expect(useWishlistStore.getState().items).toHaveLength(1);
      expect(useWishlistStore.getState().items[0].productId._id).toBe('p1');
    });

    it('should handle error', async () => {
      mockPost.mockRejectedValue(new Error('fail'));
      await useWishlistStore.getState().addToWishlist('p1');
      expect(useWishlistStore.getState().items).toHaveLength(0);
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove item from wishlist', async () => {
      useWishlistStore.setState({
        items: [
          { _id: '1', productId: { _id: 'p1' } as any },
          { _id: '2', productId: { _id: 'p2' } as any },
        ],
      });
      mockDelete.mockResolvedValue({} as any);
      await useWishlistStore.getState().removeFromWishlist('p1');
      expect(useWishlistStore.getState().items).toHaveLength(1);
      expect(useWishlistStore.getState().items[0].productId._id).toBe('p2');
    });

    it('should handle error', async () => {
      useWishlistStore.setState({
        items: [{ _id: '1', productId: { _id: 'p1' } as any }],
      });
      mockDelete.mockRejectedValue(new Error('fail'));
      await useWishlistStore.getState().removeFromWishlist('p1');
      expect(useWishlistStore.getState().items).toHaveLength(1);
    });
  });

  describe('checkWishlist', () => {
    it('should return true if in wishlist', async () => {
      mockGet.mockResolvedValue({
        data: { isInWishlist: true },
      } as any);
      const result = await useWishlistStore.getState().checkWishlist('p1');
      expect(result).toBe(true);
    });

    it('should return false if not in wishlist', async () => {
      mockGet.mockResolvedValue({
        data: { isInWishlist: false },
      } as any);
      const result = await useWishlistStore.getState().checkWishlist('p1');
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockGet.mockRejectedValue(new Error('fail'));
      const result = await useWishlistStore.getState().checkWishlist('p1');
      expect(result).toBe(false);
    });

    it('should handle null data', async () => {
      mockGet.mockResolvedValue({ data: null } as any);
      const result = await useWishlistStore.getState().checkWishlist('p1');
      expect(result).toBe(false);
    });
  });

  describe('clearWishlist', () => {
    it('should clear all items', async () => {
      useWishlistStore.setState({
        items: [{ _id: '1', productId: { _id: 'p1' } as any }],
      });
      mockDelete.mockResolvedValue({} as any);
      await useWishlistStore.getState().clearWishlist();
      expect(useWishlistStore.getState().items).toEqual([]);
    });

    it('should handle error', async () => {
      useWishlistStore.setState({
        items: [{ _id: '1', productId: { _id: 'p1' } as any }],
      });
      mockDelete.mockRejectedValue(new Error('fail'));
      await useWishlistStore.getState().clearWishlist();
      expect(useWishlistStore.getState().items).toHaveLength(1);
    });
  });

  describe('isInWishlist', () => {
    it('should return true if item exists', () => {
      useWishlistStore.setState({
        items: [{ _id: '1', productId: { _id: 'p1' } as any }],
      });
      expect(useWishlistStore.getState().isInWishlist('p1')).toBe(true);
    });

    it('should return false if item does not exist', () => {
      useWishlistStore.setState({ items: [] });
      expect(useWishlistStore.getState().isInWishlist('p1')).toBe(false);
    });
  });
});
