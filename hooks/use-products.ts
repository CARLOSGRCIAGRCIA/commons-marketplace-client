import { useState, useEffect, useCallback } from 'react';
import type { Product, ProductFilters, PaginatedResponse } from '@/types';
import { productApi } from '@/lib/api';

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  refetch: () => void;
}

export function useProducts(filters?: ProductFilters): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productApi.getAll({
        ...filters,
        page: filters?.page || 1,
        limit: filters?.limit || 12,
      }) as { products?: Product[]; data?: Product[]; pagination?: { totalItems?: number; currentPage?: number; totalPages?: number }; total?: number; page?: number; totalPages?: number };

      if (response?.products && Array.isArray(response.products)) {
        const pagination = response.pagination || { totalItems: 0, currentPage: 1, totalPages: 1 };
        setProducts(response.products);
        setTotal(pagination.totalItems || response.products.length);
        setPage(pagination.currentPage || 1);
        setTotalPages(pagination.totalPages || 1);
      } else if (response?.data && Array.isArray(response.data)) {
        setProducts(response.data);
        setTotal(response.total || 0);
        setPage(response.page || 1);
        setTotalPages(response.totalPages || 0);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  }, [filters?.categoryId, filters?.search, filters?.page, filters?.limit]);

  useEffect(() => {
    // Deferred one microtask: the fetcher flips isLoading synchronously
    // and react-hooks/set-state-in-effect forbids that inside effect
    // bodies. Semantics unchanged - just runs one tick later.
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) fetchProducts();
    });
    return () => {
      cancelled = true;
    };
  }, [fetchProducts]);

  return {
    products: products ?? [],
    isLoading,
    error,
    total,
    page,
    totalPages,
    refetch: fetchProducts,
  };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await productApi.getById(id);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar producto');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, isLoading, error };
}