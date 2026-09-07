import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('@/hooks/use-stores', () => ({
  useStore: vi.fn(),
}));

vi.mock('@/app/stores/[slug]/store-products', () => ({
  StoreProducts: () => <div data-testid="store-products">Products</div>,
}));

vi.mock('@/components/ui', () => ({
  Spinner: () => <div data-testid="spinner" />,
}));

import { useStore } from '@/hooks/use-stores';
import { StoreDetailClient } from '@/app/stores/[slug]/store-detail-client';

const mockStore = {
  _id: 's1',
  storeName: 'My Store',
  slug: 'my-store',
  status: 'approved',
  description: 'A store',
  logo: '/logo.jpg',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('StoreDetailClient', () => {
  it('should show loading state', () => {
    vi.mocked(useStore).mockReturnValue({
      store: null, isLoading: true, error: null,
    });
    const { container } = render(<StoreDetailClient storeId="s1" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('should render store with approved status', () => {
    vi.mocked(useStore).mockReturnValue({
      store: mockStore, isLoading: false, error: null,
    });
    render(<StoreDetailClient storeId="s1" />);
    expect(screen.getByText('My Store')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('should render store with pending status', () => {
    vi.mocked(useStore).mockReturnValue({
      store: { ...mockStore, status: 'pending' }, isLoading: false, error: null,
    });
    render(<StoreDetailClient storeId="s1" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should show initial when store has no logo', () => {
    vi.mocked(useStore).mockReturnValue({
      store: { ...mockStore, logo: '' }, isLoading: false, error: null,
    });
    render(<StoreDetailClient storeId="s1" />);
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'My Store' })).not.toBeInTheDocument();
  });

  it('should show logo image when store has logo', () => {
    vi.mocked(useStore).mockReturnValue({
      store: mockStore, isLoading: false, error: null,
    });
    render(<StoreDetailClient storeId="s1" />);
    const logo = screen.getByRole('img', { name: 'My Store' });
    expect(logo).toHaveAttribute('src', '/logo.jpg');
  });

  it('should render store description', () => {
    vi.mocked(useStore).mockReturnValue({
      store: mockStore, isLoading: false, error: null,
    });
    render(<StoreDetailClient storeId="s1" />);
    expect(screen.getByText('A store')).toBeInTheDocument();
  });

  it('should not render description when empty', () => {
    vi.mocked(useStore).mockReturnValue({
      store: { ...mockStore, description: '' }, isLoading: false, error: null,
    });
    render(<StoreDetailClient storeId="s1" />);
    expect(screen.queryByText('A store')).not.toBeInTheDocument();
  });

  it('should render StoreProducts component', () => {
    vi.mocked(useStore).mockReturnValue({
      store: mockStore, isLoading: false, error: null,
    });
    render(<StoreDetailClient storeId="s1" />);
    expect(screen.getByTestId('store-products')).toBeInTheDocument();
  });

  it('should show back link to stores', () => {
    vi.mocked(useStore).mockReturnValue({
      store: mockStore, isLoading: false, error: null,
    });
    render(<StoreDetailClient storeId="s1" />);
    const backLink = screen.getByText('Volver a tiendas').closest('a');
    expect(backLink).toHaveAttribute('href', '/stores');
  });

  it('should show section title for products', () => {
    vi.mocked(useStore).mockReturnValue({
      store: mockStore, isLoading: false, error: null,
    });
    render(<StoreDetailClient storeId="s1" />);
    expect(screen.getByText('Productos de la tienda')).toBeInTheDocument();
  });
});
