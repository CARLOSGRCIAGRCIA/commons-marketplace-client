'use client';
import { useEffect, useState } from 'react';
import { useRequireRole } from '@/hooks/use-auth';
import { productApi } from '@/lib/api/products';
import { storeApi } from '@/lib/api/stores';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button, Input, Spinner } from '@/components/ui';
import type { Product, Store } from '@/types';
import Link from 'next/link';

export default function AdminProductsPage() {
  const { user, isAuthenticated, isLoading: roleLoading } = useRequireRole(['admin']);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Map<string, Store>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    (async () => {
      setIsLoading(true);
      try {
        const [productsData, storesData] = await Promise.all([
          productApi.getAll({ page, limit: 20, search: search || undefined }),
          storeApi.getAll(),
        ]);
        const storesMap = new Map<string, Store>();
        (storesData as Store[]).forEach((s: Store) => storesMap.set(s._id, s));
        setStores(storesMap);
        const result = productsData as { data?: Product[]; products?: Product[]; items?: Product[] };
        const productsArray = result.data || result.products || result.items || [];
        setProducts(productsArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar productos');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAuthenticated, user, page]);

  const handleDelete = async (productId: string) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await apiClient.delete(API_ENDPOINTS.admin.products.delete(productId));
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const filteredProducts = search
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  if (roleLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner />
        <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Cargando productos</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <h1 className="h2 text-foreground">Acceso Denegado</h1>
        <p className="text-sm font-mono text-gray-400 uppercase tracking-wider">No tienes permiso</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute -left-4 top-0 w-1 h-full bg-primary" />
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 border-2 border-gray-200 bg-surface hover:border-primary transition-colors duration-200">
            <span className="text-sm font-mono">←</span>
          </Link>
          <div>
            <p className="text-xs font-mono text-primary uppercase tracking-wider mb-1">Administración</p>
            <h1 className="h1 text-3xl md:text-4xl text-foreground">Gestionar Productos</h1>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-3 border-2 border-danger bg-danger-bg font-mono text-xs uppercase tracking-wider text-danger">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 bg-surface font-body text-sm focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-ghost)] focus:outline-none transition-all duration-200"
        />
      </div>

      {/* Products List */}
      <div className="industrial-card rounded-none bg-surface overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <span className="text-3xl">📦</span>
            <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">No hay productos</p>
          </div>
        ) : (
          <div>
            {filteredProducts.map((product, idx) => {
              const store = stores.get(product.storeId);
              return (
                <div
                  key={product._id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors duration-150"
                  style={{ borderBottom: idx < filteredProducts.length - 1 ? '2px solid var(--gray-200)' : 'none' }}
                >
                  <div className="w-10 h-10 bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                    {product.mainImageUrl && (
                      <img src={product.mainImageUrl} alt={product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{product.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {store?.storeName || 'Tienda desconocida'} • {product.price != null ? `$${product.price}` : 'Sin precio'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-mono font-medium uppercase tracking-wider text-danger border-2 border-danger/30 bg-danger-bg hover:bg-danger hover:text-white transition-all duration-200 shrink-0"
                  >
                    ✕ Eliminar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
