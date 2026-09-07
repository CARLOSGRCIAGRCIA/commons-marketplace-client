import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockAuthState = {
  user: null as any,
  isAuthenticated: false,
};

vi.mock('@/store/auth-store', () => ({
  useAuthStore: Object.assign(vi.fn(() => mockAuthState), {
    getState: vi.fn(() => mockAuthState),
    setState: vi.fn(),
  }),
}));

const mockWishlistState = {
  items: [] as any[],
  isLoading: false,
  fetchWishlist: vi.fn(),
  clearWishlist: vi.fn(),
};

vi.mock('@/store/wishlist-store', () => ({
  useWishlistStore: Object.assign(vi.fn(() => mockWishlistState), {
    getState: vi.fn(() => mockWishlistState),
    setState: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-products', () => ({
  useProducts: vi.fn(),
}));

import { useProducts } from '@/hooks/use-products';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('WishlistPage', () => {
  it('should show login prompt when not authenticated', async () => {
    mockAuthState.isAuthenticated = false;
    const { default: WishlistPage } = await import('@/app/wishlist/page');
    render(<WishlistPage />);
    expect(screen.getByText(/Debes iniciar sesión/)).toBeInTheDocument();
  });

  it('should show empty state when no items', async () => {
    mockAuthState.isAuthenticated = true;
    mockWishlistState.items = [];
    mockWishlistState.isLoading = false;
    const { default: WishlistPage } = await import('@/app/wishlist/page');
    render(<WishlistPage />);
    expect(screen.getByText(/lista de deseos está vacía/)).toBeInTheDocument();
  });

  it('should show loading state', async () => {
    mockAuthState.isAuthenticated = true;
    mockWishlistState.items = [];
    mockWishlistState.isLoading = true;
    const { default: WishlistPage } = await import('@/app/wishlist/page');
    render(<WishlistPage />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });
});
