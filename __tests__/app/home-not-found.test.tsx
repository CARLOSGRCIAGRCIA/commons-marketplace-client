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
  isLoading: false,
  error: null as string | null,
  login: vi.fn().mockResolvedValue(undefined),
  clearError: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  register: vi.fn().mockResolvedValue({}),
  setUser: vi.fn(),
};

vi.mock('@/store/auth-store', () => ({
  useAuthStore: Object.assign(vi.fn(() => mockAuthState), {
    getState: vi.fn(() => mockAuthState),
    setState: vi.fn((fn: any) => {
      if (typeof fn === 'function') Object.assign(mockAuthState, fn(mockAuthState));
      else Object.assign(mockAuthState, fn);
    }),
  }),
}));

const mockWishlistState = {
  items: [] as any[],
  isLoading: false,
  fetchWishlist: vi.fn(),
  addToWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
  isInWishlist: vi.fn(() => false),
  clearWishlist: vi.fn(),
};

vi.mock('@/store/wishlist-store', () => ({
  useWishlistStore: Object.assign(vi.fn(() => mockWishlistState), {
    getState: vi.fn(() => mockWishlistState),
    setState: vi.fn((fn: any) => {
      if (typeof fn === 'function') Object.assign(mockWishlistState, fn(mockWishlistState));
      else Object.assign(mockWishlistState, fn);
    }),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockAuthState.user = null;
  mockAuthState.isAuthenticated = false;
  mockAuthState.error = null;
});

describe('HomePage', () => {
  it('should render welcome heading', async () => {
    const { default: HomePage } = await import('@/app/page');
    render(<HomePage />);
    expect(screen.getByText(/Bienvenido a Commons Marketplace/)).toBeInTheDocument();
  });

  it('should render navigation links', async () => {
    const { default: HomePage } = await import('@/app/page');
    render(<HomePage />);
    expect(screen.getByRole('link', { name: /explorar productos/i })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: /ver tiendas/i })).toHaveAttribute('href', '/stores');
  });

  it('should render feature cards', async () => {
    const { default: HomePage } = await import('@/app/page');
    render(<HomePage />);
    expect(screen.getByText('Tiendas Locales')).toBeInTheDocument();
    expect(screen.getByText('Productos Únicos')).toBeInTheDocument();
    expect(screen.getByText('Comunicación Directa')).toBeInTheDocument();
  });

  it('should render seller CTA', async () => {
    const { default: HomePage } = await import('@/app/page');
    render(<HomePage />);
    expect(screen.getByText('Crear Cuenta de Vendedor')).toBeInTheDocument();
  });
});

describe('NotFound', () => {
  it('should render 404 page', async () => {
    const { default: NotFound } = await import('@/app/not-found');
    render(<NotFound />);
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
  });

  it('should render back to home link', async () => {
    const { default: NotFound } = await import('@/app/not-found');
    render(<NotFound />);
    expect(screen.getByRole('link', { name: /volver al inicio/i })).toHaveAttribute('href', '/');
  });

  it('should render products link', async () => {
    const { default: NotFound } = await import('@/app/not-found');
    render(<NotFound />);
    expect(screen.getByRole('link', { name: /ver productos/i })).toHaveAttribute('href', '/products');
  });
});
