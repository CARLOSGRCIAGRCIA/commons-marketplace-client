'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/components/ui';
import { Badge } from '@/components/ui';

interface NavLink {
  href: string;
  label: string;
  requireAuth?: boolean;
  roles?: ('buyer' | 'seller' | 'admin')[];
}

const navLinks: NavLink[] = [
  { href: '/products', label: 'Productos' },
  { href: '/stores', label: 'Tiendas' },
  { href: '/wishlist', label: 'Deseos', requireAuth: true },
  { href: '/profile', label: 'Perfil', requireAuth: true },
  { href: '/dashboard', label: 'Mi Tienda', requireAuth: true, roles: ['seller', 'admin'] },
  { href: '/admin', label: 'Admin', requireAuth: true, roles: ['admin'] },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { fetchWishlist } = useWishlistStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const userRole = user?.role?.toLowerCase() || '';

  const filteredLinks = navLinks.filter((link) => {
    if (link.requireAuth && !isAuthenticated) return false;
    if (link.roles) {
      if (!user || !userRole) return false;
      const allowedRoles = link.roles.map(r => r.toLowerCase());
      if (!allowedRoles.includes(userRole)) return false;
    }
    return true;
  });

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-gray-300 bg-surface">
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '256px 256px',
        }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logoCommons.png"
                alt="Commons Marketplace"
                width={36}
                height={36}
                className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-display text-lg font-black uppercase tracking-tight text-foreground hidden sm:block">
                Commons
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-xs font-mono font-medium uppercase tracking-wider text-gray-600 hover:text-primary transition-colors duration-200 relative group/navlink"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary scale-x-0 group-hover/navlink:scale-x-100 transition-transform duration-200 origin-left" />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 hidden sm:block">
                    {user?.name || user?.email}
                  </span>
                  <Badge
                    variant={
                      user?.role?.toLowerCase() === 'admin'
                        ? 'warning'
                        : user?.role?.toLowerCase() === 'seller'
                        ? 'success'
                        : 'default'
                    }
                    className="text-[10px]"
                  >
                    {user?.role?.toLowerCase() || 'buyer'}
                  </Badge>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-mono font-medium uppercase tracking-wider text-gray-500 hover:text-danger transition-colors duration-200"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-mono font-medium uppercase tracking-wider text-gray-600 hover:text-primary transition-colors duration-200"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="bg-primary text-white px-4 py-2 text-xs font-display font-semibold uppercase tracking-wider border-2 border-primary hover:bg-primary-hover hover:border-primary-hover transition-all duration-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]"
                >
                  Registro
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
