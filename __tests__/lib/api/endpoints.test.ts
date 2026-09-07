import { describe, it, expect } from 'vitest';
import { API_ENDPOINTS, API_URL } from '@/lib/api/endpoints';

describe('API_URL', () => {
  it('should default to empty string', () => {
    expect(API_URL).toBe(process.env.NEXT_PUBLIC_API_URL || '');
  });
});

describe('API_ENDPOINTS', () => {
  describe('auth', () => {
    it('should have all auth endpoints', () => {
      expect(API_ENDPOINTS.auth.register).toBe('/api/v1/auth/register');
      expect(API_ENDPOINTS.auth.login).toBe('/api/v1/auth/login');
      expect(API_ENDPOINTS.auth.logout).toBe('/api/v1/auth/logout');
      expect(API_ENDPOINTS.auth.refresh).toBe('/api/v1/auth/refresh');
    });
  });

  describe('users', () => {
    it('should have list and me endpoints', () => {
      expect(API_ENDPOINTS.users.list).toBe('/api/v1/users');
      expect(API_ENDPOINTS.users.me).toBe('/api/v1/users/me');
    });

    it('should generate correct URL for user id', () => {
      expect(API_ENDPOINTS.users.get('abc123')).toBe('/api/v1/users/abc123');
      expect(API_ENDPOINTS.users.update('abc123')).toBe('/api/v1/users/abc123');
    });
  });

  describe('categories', () => {
    it('should have all category endpoints', () => {
      expect(API_ENDPOINTS.categories.list).toBe('/api/v1/categories');
      expect(API_ENDPOINTS.categories.create).toBe('/api/v1/categories');
    });

    it('should generate correct URL for category id', () => {
      expect(API_ENDPOINTS.categories.get('cat1')).toBe('/api/v1/categories/cat1');
      expect(API_ENDPOINTS.categories.update('cat1')).toBe('/api/v1/categories/cat1');
      expect(API_ENDPOINTS.categories.delete('cat1')).toBe('/api/v1/categories/cat1');
    });
  });

  describe('stores', () => {
    it('should have all store endpoints', () => {
      expect(API_ENDPOINTS.stores.list).toBe('/api/v1/stores');
      expect(API_ENDPOINTS.stores.me).toBe('/api/v1/stores/me');
      expect(API_ENDPOINTS.stores.create).toBe('/api/v1/stores');
      expect(API_ENDPOINTS.stores.pending).toBe('/api/v1/stores/admin/pending');
    });

    it('should generate correct URL for store id', () => {
      expect(API_ENDPOINTS.stores.get('store1')).toBe('/api/v1/stores/store1');
      expect(API_ENDPOINTS.stores.update('store1')).toBe('/api/v1/stores/store1');
      expect(API_ENDPOINTS.stores.delete('store1')).toBe('/api/v1/stores/store1');
      expect(API_ENDPOINTS.stores.updateStatus('store1')).toBe('/api/v1/stores/admin/store1/status');
    });
  });

  describe('products', () => {
    it('should have all product endpoints', () => {
      expect(API_ENDPOINTS.products.list).toBe('/api/v1/products');
      expect(API_ENDPOINTS.products.create).toBe('/api/v1/products');
    });

    it('should generate correct URL for product id', () => {
      expect(API_ENDPOINTS.products.get('prod1')).toBe('/api/v1/products/prod1');
      expect(API_ENDPOINTS.products.update('prod1')).toBe('/api/v1/products/prod1');
      expect(API_ENDPOINTS.products.delete('prod1')).toBe('/api/v1/products/prod1');
      expect(API_ENDPOINTS.products.byStore('store1')).toBe('/api/v1/products/store/store1');
    });
  });

  describe('reviews', () => {
    it('should have all review endpoints', () => {
      expect(API_ENDPOINTS.reviews.list).toBe('/api/v1/reviews');
      expect(API_ENDPOINTS.reviews.create).toBe('/api/v1/reviews');
    });

    it('should generate correct URL for review id', () => {
      expect(API_ENDPOINTS.reviews.get('rev1')).toBe('/api/v1/reviews/rev1');
      expect(API_ENDPOINTS.reviews.update('rev1')).toBe('/api/v1/reviews/rev1');
      expect(API_ENDPOINTS.reviews.delete('rev1')).toBe('/api/v1/reviews/rev1');
    });
  });

  describe('chat', () => {
    it('should have chat endpoints', () => {
      expect(API_ENDPOINTS.chat.token).toBe('/api/v1/chat/token');
      expect(API_ENDPOINTS.chat.conversations).toBe('/api/v1/chat/conversations');
      expect(API_ENDPOINTS.chat.sendMessage).toBe('/api/v1/chat/messages');
    });

    it('should generate correct URL for chat messages', () => {
      expect(API_ENDPOINTS.chat.messages('conv1')).toBe('/api/v1/chat/conversations/conv1/messages');
      expect(API_ENDPOINTS.chat.getOrCreateConversation('user1')).toBe('/api/v1/chat/conversations/user/user1');
    });
  });

  describe('wishlist', () => {
    it('should have wishlist endpoints', () => {
      expect(API_ENDPOINTS.wishlist.list).toBe('/api/v1/wishlist');
      expect(API_ENDPOINTS.wishlist.add).toBe('/api/v1/wishlist');
      expect(API_ENDPOINTS.wishlist.clear).toBe('/api/v1/wishlist');
    });

    it('should generate correct URL for wishlist operations', () => {
      expect(API_ENDPOINTS.wishlist.remove('prod1')).toBe('/api/v1/wishlist/prod1');
      expect(API_ENDPOINTS.wishlist.check('prod1')).toBe('/api/v1/wishlist/check/prod1');
    });
  });

  describe('sellerRequests', () => {
    it('should have seller request endpoints', () => {
      expect(API_ENDPOINTS.sellerRequests.list).toBe('/api/v1/seller-requests');
      expect(API_ENDPOINTS.sellerRequests.create).toBe('/api/v1/seller-requests');
    });

    it('should generate correct URL for status update', () => {
      expect(API_ENDPOINTS.sellerRequests.updateStatus('req1')).toBe('/api/v1/seller-requests/req1/status');
    });
  });

  describe('admin', () => {
    it('should have admin endpoints', () => {
      expect(API_ENDPOINTS.admin.stats).toBe('/api/v1/admin/stats');
    });

    it('should generate correct URL for admin product delete', () => {
      expect(API_ENDPOINTS.admin.products.delete('prod1')).toBe('/api/v1/admin/products/prod1');
    });
  });
});
