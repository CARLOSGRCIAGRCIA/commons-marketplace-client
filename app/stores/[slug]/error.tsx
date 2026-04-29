'use client';

import { useEffect } from 'react';
import type { ErrorInfo } from 'next/dist/client/components/error-boundary';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function StoreError({ error, reset }: ErrorInfo) {
  useEffect(() => {
    console.error('Store page error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center">
      <div className="mb-8">
        <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.732 1.732-2.502m-14.058 10h14.058m-14.058 4h14.058M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4">Algo salió mal</h2>
      <p className="text-sm text-gray-500 mb-6 font-body">
        {error?.message || 'Ocurrió un error al cargar la tienda.'}
      </p>
      <div className="flex items-center justify-center gap-4">
        <Button onClick={() => reset()} variant="outline" className="font-mono uppercase text-xs">
          Reintentar
        </Button>
        <Link href="/stores">
          <Button className="font-mono uppercase text-xs">Volver a tiendas</Button>
        </Link>
      </div>
    </div>
  );
}
