'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/hooks/use-stores';
import { StoreProducts } from './store-products';
import { Spinner } from '@/components/ui';

interface StoreDetailClientProps {
  storeId: string;
}

export function StoreDetailClient({ storeId }: StoreDetailClientProps) {
  const { store, isLoading, error } = useStore(storeId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner />
      </div>
    );
  }

  if (error || !store) {
    return notFound();
  }

  const initials = store.storeName.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link
        href="/stores"
        className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-wider hover:text-primary mb-8 transition-colors duration-200"
      >
        <span>←</span>
        <span>Volver a tiendas</span>
      </Link>

      {/* Hero header */}
      <div className="relative border-2 border-gray-200 bg-surface mb-10 overflow-hidden">
        {/* Banner blur */}
        <div className="relative h-44 overflow-hidden bg-gray-100">
          {store.logo ? (
            <img
              src={store.logo}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover scale-[1.4] blur-[40px] saturate-[1.8] opacity-40 pointer-events-none"
            />
          ) : (
            <div className="absolute inset-0 opacity-10" style={{ background: 'var(--primary)' }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface/90" />

          {/* Noise overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
              backgroundSize: '256px 256px',
            }}
          />
        </div>

        {/* Logo + info */}
        <div className="px-8 pb-8">
          {/* Logo floating */}
          <div className="relative w-[96px] h-[96px] border-2 border-gray-200 bg-surface overflow-hidden -mt-12 z-10">
            {store.logo ? (
              <Image
                src={store.logo}
                alt={store.storeName}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl font-display font-black text-primary">{initials}</span>
              </div>
            )}
          </div>

          {/* Name + badge + description */}
          <div className="mt-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="h2 text-2xl md:text-3xl text-foreground">{store.storeName}</h1>
              <StatusBadge status={store.status} />
            </div>
            {store.description && (
              <p className="mt-2 text-sm text-gray-600 leading-relaxed font-body max-w-2xl">
                {store.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="h2 text-xl mb-6">Productos de la tienda</h2>
        <StoreProducts storeId={storeId} />
      </div>

    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    approved: 'bg-success-bg text-success border-success/30',
    pending: 'bg-warning-bg text-warning border-warning/30',
    rejected: 'bg-danger-bg text-danger border-danger/30',
  };

  const cls = variants[status.toLowerCase()] ?? 'bg-gray-100 text-gray-600 border-gray-300';

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-medium px-2.5 py-1 border-2 uppercase tracking-wider ${cls}`}>
      <span className="w-1.5 h-1.5 bg-current" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
