import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProductById, getProducts } from '@/lib/api/server-products';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getProductById', () => {
  it('should return product data on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1', name: 'Widget' }),
    });
    const result = await getProductById('1');
    expect(result).toEqual({ id: '1', name: 'Widget' });
  });

  it('should return null on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });
    const result = await getProductById('999');
    expect(result).toBeNull();
  });

  it('should return null on fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const result = await getProductById('1');
    expect(result).toBeNull();
  });
});

describe('getProducts', () => {
  it('should return array of products', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ products: [{ id: '1' }, { id: '2' }] }),
    });
    const result = await getProducts();
    expect(result).toEqual([{ id: '1' }, { id: '2' }]);
  });

  it('should unwrap data.data response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ id: '1' }] }),
    });
    const result = await getProducts();
    expect(result).toEqual([{ id: '1' }]);
  });

  it('should build query params from filters', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ products: [] }),
    });
    await getProducts({ search: 'test', categoryId: 'cat1', minPrice: 10 });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('search=test');
    expect(url).toContain('categoryId=cat1');
    expect(url).toContain('minPrice=10');
  });

  it('should skip null/undefined filter values', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ products: [] }),
    });
    await getProducts({ search: 'test', categoryId: null, minPrice: undefined });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('search=test');
    expect(url).not.toContain('categoryId');
    expect(url).not.toContain('minPrice');
  });

  it('should return empty array on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    const result = await getProducts();
    expect(result).toEqual([]);
  });

  it('should return empty array on error', async () => {
    mockFetch.mockRejectedValue(new Error('fail'));
    const result = await getProducts();
    expect(result).toEqual([]);
  });

  it('should return empty array when data has no products or data key', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve('unexpected'),
    });
    const result = await getProducts();
    expect(result).toEqual([]);
  });
});
