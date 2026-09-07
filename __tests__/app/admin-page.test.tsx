import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
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
  useRequireRole: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
  API_ENDPOINTS: {
    admin: { stats: '/api/v1/admin/stats' },
    users: { list: '/api/v1/users' },
    stores: {
      list: '/api/v1/stores',
      pending: '/api/v1/stores/admin/pending',
      updateStatus: (id: string) => `/api/v1/stores/admin/${id}/status`,
    },
  },
}));

import { useRequireRole } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminPage', () => {
  it('should show loading state', async () => {
    vi.mocked(useRequireRole).mockReturnValue({
      hasPermission: true, isLoading: true, user: null, isAuthenticated: true,
    } as any);
    const { default: AdminPage } = await import('@/app/admin/page');
    const { container } = render(<AdminPage />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render dashboard with stats', async () => {
    vi.mocked(useRequireRole).mockReturnValue({
      hasPermission: true, isLoading: false, user: { id: '1', name: 'Admin', role: 'admin' }, isAuthenticated: true,
    } as any);
    vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
      if (url.includes('admin/stats')) {
        return { totalUsers: 10, totalStores: 5, totalProducts: 20, totalReviews: 8, pendingStores: 2, pendingSellerRequests: 1 };
      }
      if (url.includes('pending')) return [];
      return {};
    });
    const { default: AdminPage } = await import('@/app/admin/page');
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard Admin')).toBeInTheDocument();
    });
  });

  it('should render quick actions', async () => {
    vi.mocked(useRequireRole).mockReturnValue({
      hasPermission: true, isLoading: false, user: { id: '1', name: 'Admin', role: 'admin' }, isAuthenticated: true,
    } as any);
    vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
      if (url.includes('admin/stats')) {
        return { totalUsers: 0, totalStores: 0, totalProducts: 0, totalReviews: 0, pendingStores: 0, pendingSellerRequests: 0 };
      }
      if (url.includes('pending')) return [];
      return {};
    });
    const { default: AdminPage } = await import('@/app/admin/page');
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText('Gestionar Categorías')).toBeInTheDocument();
      expect(screen.getByText('Gestionar Productos')).toBeInTheDocument();
      expect(screen.getByText('Gestionar Usuarios')).toBeInTheDocument();
    });
  });

  it('should render pending stores', async () => {
    vi.mocked(useRequireRole).mockReturnValue({
      hasPermission: true, isLoading: false, user: { id: '1', name: 'Admin', role: 'admin' }, isAuthenticated: true,
    } as any);
    vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
      if (url.includes('admin/stats')) {
        return { totalUsers: 0, totalStores: 0, totalProducts: 0, totalReviews: 0, pendingStores: 1, pendingSellerRequests: 0 };
      }
      if (url.includes('pending')) return [{ _id: 's1', storeName: 'Pending Store' }];
      return {};
    });
    const { default: AdminPage } = await import('@/app/admin/page');
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText('Pending Store')).toBeInTheDocument();
    });
  });

  it('should render error state', async () => {
    vi.mocked(useRequireRole).mockReturnValue({
      hasPermission: true, isLoading: false, user: { id: '1', name: 'Admin', role: 'admin' }, isAuthenticated: true,
    } as any);
    vi.mocked(apiClient.get).mockRejectedValue(new Error('API error'));
    const { default: AdminPage } = await import('@/app/admin/page');
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText('API error')).toBeInTheDocument();
    });
  });
});
