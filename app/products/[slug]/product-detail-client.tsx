'use client';

import { useState, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProduct } from '@/hooks/use-products';
import { useAuth } from '@/hooks/use-auth';
import { Button, Badge, Spinner, Skeleton } from '@/components/ui';
import { ReviewsSection } from './reviews-list';

interface ProductDetailClientProps {
  productId: string;
}

export function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const { product, isLoading, error } = useProduct(productId);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (product?.sellerId) {
      window.dispatchEvent(new CustomEvent('open-chat', { detail: { sellerId: product.sellerId } }));
    }
  };

  const allImages = !isLoading && product
    ? [product.mainImageUrl, ...(product.imageUrls || [])].filter(Boolean)
    : [];

  const goTo = useCallback((index: number) => {
    if (index < 0) setSelectedImage(allImages.length - 1);
    else if (index >= allImages.length) setSelectedImage(0);
    else setSelectedImage(index);
  }, [allImages.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(selectedImage + (diff > 0 ? 1 : -1));
    setTouchStart(null);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <Skeleton className="h-96 w-full rounded-none" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-none" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link href="/products" className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-wider hover:text-primary mb-6 transition-colors duration-200">
        <span>←</span>
        <span>Volver a productos</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-4">
          <div
            className="relative h-96 bg-gray-100 border-2 border-gray-200 overflow-hidden rounded-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={allImages[selectedImage]}
              alt={product.name}
              className="w-full h-full object-contain p-8"
            />

            {/* Navigation arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); goTo(selectedImage - 1); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-surface/90 border-2 border-gray-200 hover:border-primary transition-all duration-200 font-mono text-lg"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); goTo(selectedImage + 1); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-surface/90 border-2 border-gray-200 hover:border-primary transition-all duration-200 font-mono text-lg"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-all duration-200 ${
                    idx === selectedImage ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6 bg-surface p-6 border-2 border-gray-200">
          <div>
            <h1 className="h2 text-2xl md:text-3xl text-foreground mb-3">{product.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
              <Badge variant={product.status === 'active' ? 'success' : 'warning'} className="text-[10px]">
                {product.status}
              </Badge>
            </div>
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed font-body">{product.description}</p>
          )}

          <div className="text-xs font-mono text-gray-500 uppercase tracking-wider space-y-1 pt-4 border-t-2 border-gray-100">
            <p>Stock disponible: {product.stock}</p>
            {product.category && (
              <p>
                Categoría:{' '}
                <Link href={`/products?category=${product.category._id}`} className="text-primary hover:underline font-semibold">
                  {product.category.name}
                </Link>
              </p>
            )}
            {product.store && (
              <p>
                Tienda:{' '}
                <Link href={`/stores/${product.store.slug || product.store._id}`} className="text-primary hover:underline font-semibold">
                  {product.store.storeName}
                </Link>
              </p>
            )}
          </div>

          {isAuthenticated && user && (
            <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
              {user._id !== product.sellerId && (
                <Button variant="outline" onClick={handleContactSeller} className="flex-1 font-mono uppercase text-xs">
                  Contactar Vendedor
                </Button>
              )}
              <Button className="flex-1 font-mono uppercase text-xs">
                Agregar al Carrito
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 pt-8 border-t-2 border-gray-200">
        <h2 className="h2 text-xl mb-6">Reseñas</h2>
        <ReviewsSection productId={product._id || product.id} />
      </div>
    </div>
  );
}
