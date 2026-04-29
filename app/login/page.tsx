'use client';

import Link from 'next/link';
import { LoginForm } from './login-form';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-mono text-sm uppercase tracking-wider">Cargando...</div>}>
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 mesh-bg">
        {/* Noise overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: '256px 256px',
          }}
        />

        <div className="w-full max-w-md relative">
          {/* Decorative side accent */}
          <div className="absolute -left-6 top-0 w-1 h-full bg-primary" />

          <div className="industrial-card rounded-none p-8 md:p-10 bg-surface">
            <div className="text-center mb-8">
              <h1 className="h1 text-3xl md:text-4xl text-foreground mb-3">
                Entrar
              </h1>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                Accede a tu cuenta de Commons
              </p>
            </div>

            <LoginForm />

            <div className="mt-6 pt-4 border-t-2 border-gray-200 text-center">
              <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                ¿No tienes cuenta?{' '}
                <Link href="/register" className="text-primary hover:underline font-semibold">
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
