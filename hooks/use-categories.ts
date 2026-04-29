import { useState, useEffect, useRef } from 'react';
import type { Category } from '@/types';
import { categoryApi } from '@/lib/api';

const categoriesCache = {
  data: null as Category[] | null,
  timestamp: 0,
  ttl: 1000 * 60 * 10, 
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (categoriesCache.data && Date.now() - categoriesCache.timestamp < categoriesCache.ttl) {
          setCategories(categoriesCache.data);
          setIsLoading(false);
          return;
        }
        const data = await categoryApi.getAll();
        categoriesCache.data = data || [];
        categoriesCache.timestamp = Date.now();
        setCategories(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar categorías');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}