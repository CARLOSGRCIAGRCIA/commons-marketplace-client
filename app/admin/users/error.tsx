'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import type { ErrorInfo } from 'next/dist/client/components/error-boundary';

export default function AdminUsersError({ error, reset }: ErrorInfo) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar usuarios</h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <div className="flex justify-center gap-4">
        <Button onClick={reset} variant="outline">Reintentar</Button>
        <Link href="/admin">
          <Button>Volver al admin</Button>
        </Link>
      </div>
    </div>
  );
}
