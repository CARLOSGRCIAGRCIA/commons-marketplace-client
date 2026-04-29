'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCategories } from '@/hooks/use-categories';
import { Skeleton } from '@/components/ui';

function CategoriesSkeleton() {
  return (
    <div className="bg-surface rounded-lg border-2 border-gray-200 p-4">
      <div className="h-6 w-24 bg-gray-200 rounded mb-4 animate-pulse" />
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-full bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function CategoriesSidebar() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  const { categories, isLoading, error } = useCategories();

  if (isLoading || !categories) {
    return <CategoriesSkeleton />;
  }

  if (error) {
    return <p className="text-red-500 text-sm p-4">{error}</p>;
  }

  return (
    <div className="bg-surface rounded-lg border-2 border-gray-200 p-4">
      <h3 className="font-semibold text-foreground mb-4">Categorías</h3>
      <div className="space-y-1">
        <Link
          href="/products"
          className={`block px-3 py-2 rounded-lg transition-colors text-sm ${
            !currentCategory
              ? 'bg-primary-ghost text-primary font-medium'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Todas las categorías
        </Link>
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/products?category=${category._id}`}
            className={`block px-3 py-2 rounded-lg transition-colors text-sm ${
              currentCategory === category._id
                ? 'bg-primary-ghost text-primary font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}