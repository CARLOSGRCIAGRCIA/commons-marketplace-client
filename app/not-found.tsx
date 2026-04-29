import Link from 'next/link';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="mb-8">
        <svg className="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l3 3m-3 0l3-3m-3 3l-3 3m3-3l3 3m6-6l-3 3m3 3l3-3m-3 3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-3xl font-display font-bold text-foreground mb-4">Página no encontrada</h2>
      <p className="text-sm text-gray-500 mb-6 font-body">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link href="/">
          <Button variant="outline" className="font-mono uppercase text-xs">Volver al inicio</Button>
        </Link>
        <Link href="/products">
          <Button className="font-mono uppercase text-xs">Ver productos</Button>
        </Link>
      </div>
    </div>
  );
}
