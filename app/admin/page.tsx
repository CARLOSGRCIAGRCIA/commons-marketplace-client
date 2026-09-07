'use client';
import { useEffect, useState } from 'react';
import { useRequireRole } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import Link from 'next/link';
import { Badge, Spinner } from '@/components/ui';
import type { AdminStats, StoreSummary, UserSummary } from '@/types/api';

const STATS = [
  { key: 'totalUsers', label: 'Usuarios', icon: '👥', accent: 'var(--primary)', bg: 'var(--primary-ghost)' },
  { key: 'totalStores', label: 'Tiendas', icon: '🏪', accent: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  { key: 'totalProducts', label: 'Productos', icon: '📦', accent: '#059669', bg: 'rgba(5,150,105,0.08)' },
  { key: 'totalReviews', label: 'Reseñas', icon: '⭐', accent: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  { key: 'pendingStores', label: 'Tiendas pendientes', icon: '⏳', accent: '#ea580c', bg: 'rgba(234,88,12,0.08)', alert: true },
  { key: 'pendingSellerRequests', label: 'Solicitudes', icon: '📨', accent: '#dc2626', bg: 'rgba(220,38,38,0.08)', alert: true },
];

const QUICK_ACTIONS = [
  { href: '/admin/categories', label: 'Gestionar Categorías', desc: 'Crear, editar y eliminar categorías' },
  { href: '/admin/products', label: 'Gestionar Productos', desc: 'Ver, editar y eliminar productos' },
  { href: '/admin/users', label: 'Gestionar Usuarios', desc: 'Ver y administrar cuentas de usuario' },
];

export default function AdminPage() {
  const { user, isAuthenticated, isLoading: roleLoading } = useRequireRole(['admin']);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingStores, setPendingStores] = useState<StoreSummary[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        let statsData: AdminStats | null = null;
        try {
          statsData = await apiClient.get<AdminStats>(API_ENDPOINTS.admin.stats);
        } catch {
          const [usersData, storesData, productsData] = await Promise.all([
            apiClient.get<UserSummary[]>(API_ENDPOINTS.users.list, {}),
            apiClient.get<StoreSummary[]>(API_ENDPOINTS.stores.list),
            apiClient.get<StoreSummary[] | { data?: StoreSummary[]; products?: StoreSummary[] }>('/api/v1/products?page=1&limit=1000'),
          ]);
          const productsArray = Array.isArray(productsData)
            ? productsData
            : productsData.data || productsData.products || [];
          statsData = {
            totalUsers: usersData.length,
            totalStores: storesData.length,
            totalProducts: productsArray.length,
            totalReviews: 0,
            pendingStores: storesData.filter((s) => (s.status || '') === 'Pending').length,
            pendingSellerRequests: 0,
          };
        }
        const pendingStoresData = await apiClient
          .get<StoreSummary[]>(API_ENDPOINTS.stores.pending)
          .catch(() => [] as StoreSummary[]);
        setStats(statsData);
        setPendingStores(pendingStoresData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAuthenticated, user]);

  const handleStoreStatus = async (storeId: string, status: 'Approved' | 'Rejected') => {
    try {
      await apiClient.patch(API_ENDPOINTS.stores.updateStatus(storeId), {
        status: status.charAt(0).toUpperCase() + status.slice(1),
      });
      setPendingStores(prev => prev.filter(s => s._id !== storeId));
    } catch (err) {
      console.error('Error updating store:', err);
    }
  };

  if (roleLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner />
        <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Cargando panel</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <h1 className="h2 text-foreground">Acceso Denegado</h1>
        <p className="text-sm font-mono text-gray-400 uppercase tracking-wider">No tienes permiso para acceder</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 relative">
        <div className="absolute -left-4 top-0 w-1 h-full bg-primary" />
        <div>
          <p className="text-xs font-mono text-primary uppercase tracking-wider mb-1">Panel de control</p>
          <h1 className="h1 text-3xl md:text-4xl text-foreground">Dashboard Admin</h1>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-surface border-2 border-gray-200">
          <span className="w-2 h-2 bg-success" />
          <span className="text-xs font-mono text-gray-600">{user?.name || user?.email}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-3 border-2 border-danger bg-danger-bg font-mono text-xs uppercase tracking-wider text-danger">
          {error}
        </div>
      )}

      {/* Stats */}
      {(stats || error) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {STATS.map(({ key, label, icon, accent, bg, alert }) => {
            const value = stats ? stats[key as keyof AdminStats] : 0;
            return (
              <div key={key} className="industrial-card rounded-none bg-surface p-4 hover:shadow-[4px_4px_0px_-2px_var(--gray-300)]">
                <div className="w-8 h-8 flex items-center justify-center mb-3 text-lg" style={{ background: bg }}>
                  {icon}
                </div>
                <p className="text-2xl font-mono font-bold mb-1" style={{ color: alert && value > 0 ? accent : 'var(--foreground)' }}>
                  {value ?? 0}
                </p>
                <p className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">{label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Pending Stores */}
        <div className="lg:col-span-3 industrial-card rounded-none bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-gray-200 flex items-center justify-between">
            <h2 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">Tiendas Pendientes</h2>
            {pendingStores.length > 0 && (
              <Badge variant="warning" className="text-[10px]">{pendingStores.length}</Badge>
            )}
          </div>

          {pendingStores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <span className="text-3xl">✓</span>
              <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Todo al día</p>
            </div>
          ) : (
            <div>
              {pendingStores.map((store, idx) => (
                <div key={store._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors duration-150" style={{ borderBottom: idx < pendingStores.length - 1 ? '2px solid var(--gray-200)' : 'none' }}>
                  <div className="w-8 h-8 bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-xs font-display font-bold text-primary shrink-0">
                    {store.storeName?.[0]?.toUpperCase() ?? 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{store.storeName}</p>
                    {store.description && <p className="text-[11px] text-gray-400 truncate">{store.description}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleStoreStatus(store._id, 'Approved')}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-mono font-medium uppercase tracking-wider text-primary border-2 border-primary bg-primary-ghost hover:bg-primary hover:text-white transition-all duration-200"
                    >
                      ✓ Aprobar
                    </button>
                    <button
                      onClick={() => handleStoreStatus(store._id, 'Rejected')}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-mono font-medium uppercase tracking-wider text-danger border-2 border-danger bg-danger-bg hover:bg-danger hover:text-white transition-all duration-200"
                    >
                      ✕ Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 industrial-card rounded-none bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-gray-200">
            <h2 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">Acciones Rápidas</h2>
          </div>
          <div className="p-3">
            {QUICK_ACTIONS.map(({ href, label, desc }) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-3.5 p-3.5 hover:bg-gray-50 transition-colors duration-150 group cursor-pointer border-b-2 border-gray-100 last:border-b-0">
                  <div className="w-8 h-8 bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:border-primary transition-colors duration-200 shrink-0">
                    →
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <span className="text-gray-300 group-hover:text-primary transition-colors duration-200 group-hover:translate-x-0.5 transform">›</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
