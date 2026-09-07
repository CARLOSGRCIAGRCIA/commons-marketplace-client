import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

const mockAuthState = { user: null as any, isAuthenticated: false, isLoading: false };
vi.mock('@/store/auth-store', () => ({
  useAuthStore: Object.assign(vi.fn(() => mockAuthState), {
    getState: vi.fn(() => mockAuthState),
    setState: vi.fn(),
  }),
}));

vi.mock('@/store/wishlist-store', () => ({
  useWishlistStore: Object.assign(vi.fn(() => ({ items: [] })), {
    getState: vi.fn(() => ({ items: [] })),
    setState: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
  useRequireRole: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  storeApi: { getMyStores: vi.fn() },
}));

import { useAuth, useRequireRole } from '@/hooks/use-auth';
import { storeApi } from '@/lib/api';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DashboardPage', () => {
  it('should show loading state', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, isAuthenticated: true } as any);
    vi.mocked(useRequireRole).mockReturnValue({ hasPermission: true, isLoading: true, user: null, isAuthenticated: true } as any);
    const { default: DashboardPage } = await import('@/app/dashboard/page');
    const { container } = render(<DashboardPage />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should show empty state when no stores', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: '1', name: 'John', role: 'seller' }, isAuthenticated: true } as any);
    vi.mocked(useRequireRole).mockReturnValue({ hasPermission: true, isLoading: false, user: { id: '1', name: 'John', role: 'seller' }, isAuthenticated: true } as any);
    vi.mocked(storeApi.getMyStores).mockResolvedValue([]);
    const { default: DashboardPage } = await import('@/app/dashboard/page');
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('No tienes tiendas todavía')).toBeInTheDocument();
    });
  });

  it('should render stores list', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: '1', name: 'John', role: 'seller' }, isAuthenticated: true } as any);
    vi.mocked(useRequireRole).mockReturnValue({ hasPermission: true, isLoading: false, user: { id: '1', name: 'John', role: 'seller' }, isAuthenticated: true } as any);
    vi.mocked(storeApi.getMyStores).mockResolvedValue([
      { _id: 's1', storeName: 'My Store', slug: 'my-store', status: 'approved', description: 'Test' },
    ] as any);
    const { default: DashboardPage } = await import('@/app/dashboard/page');
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('My Store')).toBeInTheDocument();
    });
  });
});
