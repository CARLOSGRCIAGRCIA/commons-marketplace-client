import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStoreById, getStores } from '@/lib/api/server-stores';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getStoreById', () => {
  it('should return store data on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1', name: 'Test Store' }),
    });
    const result = await getStoreById('1');
    expect(result).toEqual({ id: '1', name: 'Test Store' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/stores/1'),
      expect.objectContaining({ cache: 'no-store' })
    );
  });

  it('should return null on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });
    const result = await getStoreById('999');
    expect(result).toBeNull();
  });

  it('should return null on fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const result = await getStoreById('1');
    expect(result).toBeNull();
  });
});

describe('getStores', () => {
  it('should return array of stores', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: '1' }, { id: '2' }]),
    });
    const result = await getStores();
    expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/stores'),
      expect.anything()
    );
  });

  it('should append status filter when provided', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    await getStores('approved');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('status=approved'),
      expect.anything()
    );
  });

  it('should unwrap data.data response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ id: '1' }] }),
    });
    const result = await getStores();
    expect(result).toEqual([{ id: '1' }]);
  });

  it('should return empty array on error', async () => {
    mockFetch.mockRejectedValue(new Error('fail'));
    const result = await getStores();
    expect(result).toEqual([]);
  });

  it('should return empty array on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    const result = await getStores();
    expect(result).toEqual([]);
  });

  it('should handle non-array non-data response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve('unexpected'),
    });
    const result = await getStores();
    expect(result).toEqual([]);
  });
});
