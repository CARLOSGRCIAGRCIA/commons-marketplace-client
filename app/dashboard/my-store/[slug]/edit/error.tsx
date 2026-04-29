'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';

export default function EditStoreError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar tienda</h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <div className="flex justify-center gap-4">
        <Button onClick={reset} variant="outline">Reintentar</Button>
        <Link href="/dashboard">
          <Button>Volver al dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
