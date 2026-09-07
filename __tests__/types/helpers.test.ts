import { describe, it, expect } from 'vitest';
import { getProductId, getProductSlug, getStoreId, getStoreSlug } from '@/types';
import type { Product, Store } from '@/types';

describe('Product type helpers', () => {
  const baseProduct = {
    _id: 'abc123',
    id: 'def456',
    name: 'Test Product',
    price: 100,
    stock: 10,
    categoryId: 'cat1',
    sellerId: 'seller1',
    storeId: 'store1',
    imageUrls: [],
    status: 'Active' as const,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  it('getProductId should return _id', () => {
    expect(getProductId(baseProduct as Product)).toBe('abc123');
  });

  it('getProductId should fallback to id', () => {
    const product = { ...baseProduct, _id: '' };
    expect(getProductId(product as Product)).toBe('def456');
  });

  it('getProductSlug should return slug', () => {
    const product = { ...baseProduct, slug: 'my-product' };
    expect(getProductSlug(product as Product)).toBe('my-product');
  });

  it('getProductSlug should fallback to _id', () => {
    expect(getProductSlug(baseProduct as Product)).toBe('abc123');
  });
});

describe('Store type helpers', () => {
  const baseStore = {
    _id: 'store1',
    id: 'store2',
    userId: 'user1',
    storeName: 'Test Store',
    status: 'Approved' as const,
    categoryIds: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  it('getStoreId should return _id', () => {
    expect(getStoreId(baseStore as Store)).toBe('store1');
  });

  it('getStoreId should fallback to id', () => {
    const store = { ...baseStore, _id: '' };
    expect(getStoreId(store as Store)).toBe('store2');
  });

  it('getStoreSlug should return slug', () => {
    const store = { ...baseStore, slug: 'my-store' };
    expect(getStoreSlug(store as Store)).toBe('my-store');
  });

  it('getStoreSlug should fallback to _id', () => {
    expect(getStoreSlug(baseStore as Store)).toBe('store1');
  });
});
