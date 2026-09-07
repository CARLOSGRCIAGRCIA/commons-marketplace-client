import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
};

vi.mock('@/store/auth-store', () => ({
  useAuthStore: Object.assign(vi.fn(() => mockAuthState), {
    getState: vi.fn(() => mockAuthState),
    setState: vi.fn(),
  }),
}));

const mockWishlistState = {
  items: [] as any[],
  addToWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
  isInWishlist: vi.fn(() => false),
};

vi.mock('@/store/wishlist-store', () => ({
  useWishlistStore: Object.assign(vi.fn(() => mockWishlistState), {
    getState: vi.fn(() => mockWishlistState),
    setState: vi.fn(),
  }),
}));

const mockProduct = {
  _id: 'p1',
  name: 'Test Product',
  slug: 'test-product',
  price: 29.99,
  stock: 5,
  mainImageUrl: '/test.jpg',
  store: { storeName: 'Test Store' },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProductCard', () => {
  it('should render product name and price', async () => {
    const { ProductCard } = await import('@/app/products/product-card');
    render(<ProductCard product={mockProduct as any} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('should render store name', async () => {
    const { ProductCard } = await import('@/app/products/product-card');
    render(<ProductCard product={mockProduct as any} />);
    expect(screen.getByText('Test Store')).toBeInTheDocument();
  });

  it('should render stock badge', async () => {
    const { ProductCard } = await import('@/app/products/product-card');
    render(<ProductCard product={mockProduct as any} />);
    expect(screen.getByText('5 en stock')).toBeInTheDocument();
  });

  it('should render out of stock overlay when stock is 0', async () => {
    const { ProductCard } = await import('@/app/products/product-card');
    render(<ProductCard product={{ ...mockProduct, stock: 0 } as any} />);
    expect(screen.getByText('Sin stock')).toBeInTheDocument();
  });

  it('should render edit button when showEdit is true', async () => {
    const { ProductCard } = await import('@/app/products/product-card');
    render(<ProductCard product={mockProduct as any} showEdit editHref="/edit/p1" />);
    expect(screen.getByText('Editar')).toBeInTheDocument();
  });

  it('should render delete button when showDelete is true', async () => {
    const onDelete = vi.fn();
    const { ProductCard } = await import('@/app/products/product-card');
    render(<ProductCard product={mockProduct as any} showDelete onDelete={onDelete} />);
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('should not render wishlist when showWishlist is false', async () => {
    const { ProductCard } = await import('@/app/products/product-card');
    const { container } = render(<ProductCard product={mockProduct as any} showWishlist={false} />);
    expect(container.querySelector('svg[fill="none"]')).not.toBeInTheDocument();
  });
});
