import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { StoresList } from './stores-list';
import { Spinner } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Tiendas | Commons Marketplace',
  description: 'Descubre las tiendas disponibles en nuestro marketplace de vendedores locales',
  openGraph: {
    title: 'Tiendas | Commons Marketplace',
    description: 'Descubre las tiendas disponibles en nuestro marketplace',
  },
  twitter: {
    card: 'summary',
    title: 'Tiendas | Commons Marketplace',
    description: 'Descubre las tiendas disponibles en nuestro marketplace',
  },
};

export default function StoresPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Dramatic Header */}
      <div className="mb-12 relative">
        <div className="absolute -left-4 top-0 w-1 h-full bg-primary" />
        <h1 className="h1 text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
          Tiendas
        </h1>
        <p className="text-sm font-mono text-gray-500 uppercase tracking-wider">
          Descubre las tiendas disponibles en nuestro marketplace
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="industrial-card h-64 animate-pulse bg-gray-200" />
            ))}
          </div>
        }
      >
        <StoresList />
      </Suspense>
    </div>
  );
}
