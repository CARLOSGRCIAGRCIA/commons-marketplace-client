'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/hooks/use-stores';
import { productApi } from '@/lib/api';
import { ProductCard } from '@/app/products/product-card';
import { getProductId } from '@/types';
import type { Product } from '@/types';
import { Button, Card, CardContent, Spinner } from '@/components/ui';

export default function StoreProductsPage() {
  const params = useParams();
  const storeSlug = params.slug as string;

  const { store, isLoading: storeLoading } = useStore(storeSlug);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeSlug) return;

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productApi.getByStore(storeSlug) as { products?: Product[]; data?: Product[] };
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
  }, [storeSlug]);

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productApi.delete(productId);
      setProducts(prev => prev.filter(p => getProductId(p) !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar producto');
    }
  };

  if (storeLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Productos de {store?.storeName}
          </h1>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-primary mt-2 inline-block">
            ← Volver al dashboard
          </Link>
        </div>
        <Link href={`/dashboard/my-store/${storeSlug}/products/new`}>
          <Button>Nuevo Producto</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      {products.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">
              No tienes productos todavía
            </h2>
            <p className="mt-2 text-gray-600">
              Agrega tu primer producto para comenzar a vender
            </p>
            <Link href={`/dashboard/my-store/${storeSlug}/products/new`}>
              <Button className="mt-4">Agregar Producto</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const productId = getProductId(product) || `product-${index}`;
            return (
              <ProductCard
                key={productId}
                product={product}
                showWishlist={false}
                showEdit={true}
                showDelete={true}
                editHref={`/dashboard/my-store/${storeSlug}/products/${productId}/edit`}
                onDelete={handleDeleteProduct}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}