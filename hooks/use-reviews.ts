import { useState, useEffect } from 'react';
import { reviewApi } from '@/lib/api';
import type { Review } from '@/types';

export function useReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const response = await reviewApi.getAll({ productId, limit: 10 });
        setReviews(Array.isArray(response?.reviews) ? response.reviews : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar reseñas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const avgScore =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length
      : 0;

  return { reviews, isLoading, error, avgScore, reviewCount: reviews.length };
}
