'use client';

import { useState, useEffect } from 'react';
import { productApi } from '@/lib/api';
import { ProductCard } from '@/app/products/product-card';
import type { Product } from '@/types';
import { Skeleton } from '@/components/ui';

interface StoreProductsProps {
  storeId: string;
}

function ProductSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-black/[0.06] bg-white">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
        <Skeleton className="h-5 w-1/3 rounded-md mt-3" />
      </div>
    </div>
  );
}

export function StoreProducts({ storeId }: StoreProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productApi.getByStore(storeId, { limit: 20 }) as {
          products?: Product[];
          data?: Product[];
        };
        if (response?.products && Array.isArray(response.products)) {
          setProducts(response.products);
        } else if (response?.data && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar productos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [storeId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center border border-black/[0.05] rounded-2xl bg-neutral-50">
        <p className="text-sm text-neutral-400">Esta tienda no tiene productos todavía.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product, index) => (
        <ProductCard
          key={product._id || `product-${index}`}
          product={product}
          showWishlist={false}
        />
      ))}
    </div>
  );
}