import Link from 'next/link';
import type { Metadata } from 'next';
import { Button, Card, CardContent } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Commons Marketplace | Tu Marketplace Local',
  description: 'Descubre productos únicos de vendedores locales. Compra y vende en tu comunidad.',
  openGraph: {
    title: 'Commons Marketplace | Tu Marketplace Local',
    description: 'Descubre productos únicos de vendedores locales. Compra y vende en tu comunidad.',
  },
  twitter: {
    card: 'summary',
    title: 'Commons Marketplace | Tu Marketplace Local',
    description: 'Descubre productos únicos de vendedores locales.',
  },
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Bienvenido a Commons Marketplace
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Descubre productos únicos de vendedores locales
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/products">
            <Button size="lg">Explorar Productos</Button>
          </Link>
          <Link href="/stores">
            <Button size="lg" variant="outline">
              Ver Tiendas
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold mb-2">Tiendas Locales</h3>
            <p className="text-gray-600">
              Explora tiendas de vendedores de tu comunidad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold mb-2">Productos Únicos</h3>
            <p className="text-gray-600">
              Encuentra productos exclusivos y de calidad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Comunicación Directa</h3>
            <p className="text-gray-600">
              Chatea directamente con los vendedores
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¿Quieres vender tus productos?
        </h2>
        <p className="text-gray-600 mb-6">
          Únete a nuestra comunidad de vendedores y reaches a más clientes
        </p>
        <Link href="/register">
          <Button>Crear Cuenta de Vendedor</Button>
        </Link>
      </section>
    </div>
  );
}