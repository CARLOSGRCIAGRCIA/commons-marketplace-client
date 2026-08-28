'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStores } from '@/hooks/use-stores';
import { Skeleton, Button, Badge } from '@/components/ui';
import { getStoreSlug } from '@/types';

interface Store {
  _id: string;
  id?: string;
  storeName: string;
  slug?: string;
  description?: string;
  logo?: string;
  status: string;
  accentColor?: string;
}

const StoreCard = memo(function StoreCard({ store }: { store: Store }) {
  const storeSlug = store.slug || store._id || store.id || '';
  const initials = store.storeName.charAt(0).toUpperCase();

  return (
    <Link href={`/stores/${storeSlug}`} className="group block focus:outline-none">
      <div className="industrial-card rounded-none overflow-hidden transition-all duration-300 hover:shadow-[6px_6px_0px_-2px_var(--gray-300)]">
        {/* Banner blur */}
        <div className="relative h-[90px] overflow-hidden bg-gray-100 border-b-2 border-gray-200">
          {store.logo ? (
            <img
              src={store.logo}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover scale-[1.3] blur-[24px] saturate-[1.6] opacity-50 pointer-events-none"
            />
          ) : (
            <div
              className="absolute inset-0 opacity-15"
              style={{ background: store.accentColor ?? 'var(--primary)' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/80" />

          {/* Noise overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
              backgroundSize: '128px 128px',
            }}
          />
        </div>

        {/* Logo centered over banner */}
        <div className="flex justify-center">
          <div className="relative -mt-9 w-[72px] h-[72px] border-2 border-gray-200 overflow-hidden bg-surface flex items-center justify-center z-10 group-hover:border-primary transition-colors duration-200">
            {store.logo ? (
              <Image
                src={store.logo}
                alt={store.storeName}
                width={72}
                height={72}
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="text-2xl font-display font-black"
                style={{ color: store.accentColor ?? 'var(--primary)' }}
              >
                {initials}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pt-3 pb-5 text-center bg-surface">
          <p className="text-sm font-display font-semibold text-foreground tracking-tight truncate">
            {store.storeName}
          </p>

          {store.description && (
            <p className="text-[12px] text-gray-400 mt-1 line-clamp-2 leading-relaxed font-body">
              {store.description}
            </p>
          )}

          <div className="flex items-center justify-center mt-4 pt-3 border-t-2 border-gray-100">
            <Badge
              variant={
                store.status === 'Approved'
                  ? 'success'
                  : store.status === 'Pending'
                  ? 'warning'
                  : 'danger'
              }
              className="text-[10px] font-mono uppercase tracking-wider"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
              {store.status}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
});

function StoreSkeleton() {
  return (
    <div className="industrial-card rounded-none overflow-hidden border-2 border-gray-200">
      <Skeleton className="h-[90px] w-full rounded-none" />
      <div className="flex justify-center">
        <Skeleton className="-mt-9 w-[72px] h-[72px] rounded-none z-10 relative border-2 border-gray-200" />
      </div>
      <div className="px-5 pt-3 pb-5 flex flex-col items-center space-y-2 bg-surface">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-20 mt-2" />
      </div>
    </div>
  );
}

export const StoresList = memo(function StoresList() {
  const { stores, isLoading, error, total, refetch } = useStores({
    status: 'Approved',
    limit: 12,
  });

  if (isLoading || !stores) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 stagger-child">
        {Array.from({ length: 10 }).map((_, i) => (
          <StoreSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-300 bg-surface">
        <p className="text-danger font-mono uppercase tracking-wider text-sm">{error}</p>
        <Button onClick={refetch} variant="outline" className="mt-6 font-mono uppercase text-xs">
          Reintentar
        </Button>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-300 bg-surface">
        <p className="text-gray-400 font-mono uppercase tracking-wider text-sm">No hay tiendas disponibles</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-6 text-xs font-mono text-gray-400 uppercase tracking-wider border-b-2 border-gray-200 pb-3">
        {total} tiendas encontradas
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {stores.map((store, index) => (
          <div
            key={store._id}
            style={{
              animationDelay: `${index * 60}ms`,
              animationFillMode: 'both',
            }}
            className="animate-fadeInUp"
          >
            <StoreCard store={store} />
          </div>
        ))}
      </div>
    </div>
  );
});

export default StoresList;
