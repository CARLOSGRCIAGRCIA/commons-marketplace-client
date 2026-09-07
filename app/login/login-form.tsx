'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useFormField } from '@/hooks/use-form-field';
import { Button, Input } from '@/components/ui';
import { isEmail } from '@/lib/validation';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { login, isLoading, error, clearError } = useAuthStore();

  const { values, errors, handleChange, handleSubmit } = useFormField({
    initialValues: { email: '', password: '' },
    validate: (vals) => {
      const errs: Record<string, string> = {};
      if (!vals.email) {
        errs.email = 'El email es requerido';
      } else if (!isEmail(vals.email)) {
        errs.email = 'Email inválido';
      }
      if (!vals.password) {
        errs.password = 'La contraseña es requerida';
      }
      return errs;
    },
    onSubmit: async (vals) => {
      try {
        await login(vals.email, vals.password);
        router.push(callbackUrl);
      } catch {
        // Error is handled by the store
      }
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 text-xs font-mono uppercase tracking-wider text-danger bg-danger-bg border-2 border-danger/30">
          {error}
        </div>
      )}

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="tu@email.com"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
      />

      <Input
        label="Contraseña"
        name="password"
        type="password"
        placeholder="••••••••"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        autoComplete="current-password"
      />

      <Button type="submit" className="w-full font-mono uppercase text-xs" isLoading={isLoading}>
        Entrar
      </Button>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="font-mono text-xs uppercase tracking-wider text-gray-400">Cargando...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
