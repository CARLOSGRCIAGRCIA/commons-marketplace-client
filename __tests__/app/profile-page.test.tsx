import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/store/wishlist-store', () => ({
  useWishlistStore: Object.assign(vi.fn(() => ({ items: [] })), {
    getState: vi.fn(() => ({ items: [] })),
    setState: vi.fn(),
  }),
}));

vi.mock('@/lib/api', () => ({
  userApi: {
    update: vi.fn(),
  },
}));

const mockAuthState = {
  user: null as any,
  isAuthenticated: false,
  setUser: vi.fn(),
};

vi.mock('@/store/auth-store', () => ({
  useAuthStore: Object.assign(vi.fn(() => mockAuthState), {
    getState: vi.fn(() => mockAuthState),
    setState: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockAuthState.user = null;
  mockAuthState.isAuthenticated = false;
});

describe('ProfilePage', () => {
  it('should show login prompt when not authenticated', async () => {
    mockAuthState.isAuthenticated = false;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);
    expect(screen.getByText(/Debes iniciar sesión/)).toBeInTheDocument();
  });

  it('should render profile form when authenticated', async () => {
    mockAuthState.user = { _id: '1', name: 'John', lastName: 'Doe', email: 'john@test.com', phoneNumber: '+52 55 0000', address: '123 Main St', role: 'buyer' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
    expect(screen.getByText('Identidad')).toBeInTheDocument();
    expect(screen.getByText('Contacto')).toBeInTheDocument();
  });

  it('should show user info', async () => {
    mockAuthState.user = { _id: '1', name: 'John', lastName: 'Doe', email: 'john@test.com', role: 'buyer' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);
    expect(screen.getByText('john@test.com')).toBeInTheDocument();
    expect(screen.getByText('Usuario')).toBeInTheDocument();
  });

  it('should show admin role label', async () => {
    mockAuthState.user = { _id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);
    expect(screen.getByText('Administrador')).toBeInTheDocument();
  });

  it('should show seller role label', async () => {
    mockAuthState.user = { _id: '1', name: 'Seller', email: 'seller@test.com', role: 'seller' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);
    expect(screen.getByText('Vendedor')).toBeInTheDocument();
  });

  it('should render save button', async () => {
    mockAuthState.user = { _id: '1', name: 'John', email: 'john@test.com', role: 'buyer' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);
    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument();
  });
});
