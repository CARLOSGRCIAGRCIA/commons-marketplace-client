'use client';

import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const { user, isAuthenticated, login, register, logout, clearError, error, isLoading } =
    useAuthStore();

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
    error,
    isLoading,
  };
}

export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, redirectTo, pathname, router]);

  return { isAuthenticated, isLoading };
}

export function useRequireRole(allowedRoles: UserRole[], redirectTo = '/') {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const userRole = user.role?.toLowerCase();
      const allowed = allowedRoles.map(r => r.toLowerCase());
      if (!allowed.includes(userRole)) {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, redirectTo, router]);

  return { 
    user, 
    isAuthenticated, 
    isLoading, 
    hasPermission: user ? allowedRoles.map(r => r.toLowerCase()).includes(user.role?.toLowerCase()) : false 
  };
}