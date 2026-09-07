import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  useParams: () => ({ slug: 'my-store' }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

const mockAuthState = { user: { id: '1', name: 'Test', role: 'seller' }, isAuthenticated: true, isLoading: false };
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

const mockUseStore = vi.fn();
vi.mock('@/hooks/use-stores', () => ({
  useStore: mockUseStore,
}));

const mockGetByStore = vi.fn();
const mockDelete = vi.fn();
vi.mock('@/lib/api', () => ({
  productApi: { getByStore: mockGetByStore, delete: mockDelete },
}));

vi.mock('@/app/products/product-card', () => ({
  ProductCard: ({ product, showEdit, showDelete, editHref }: any) => (
    <div data-testid="product-card">
      <span>{product.name}</span>
      {showEdit && <a href={editHref}>Editar</a>}
      {showDelete && <button>Eliminar</button>}
    </div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('StoreProductsPage', () => {
  it('debería mostrar el estado de carga', async () => {
    mockUseStore.mockReturnValue({ store: null, isLoading: true });
    const { default: StoreProductsPage } = await import('@/app/dashboard/my-store/[slug]/products/page');
    const { container } = render(<StoreProductsPage />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('debería mostrar la lista de productos', async () => {
    mockUseStore.mockReturnValue({
      store: { _id: 's1', storeName: 'Mi Tienda', slug: 'my-store' },
      isLoading: false,
    });
    mockGetByStore.mockResolvedValue({
      products: [
        { _id: 'p1', name: 'Producto 1', price: 29.99, stock: 10, imageUrls: [], status: 'Active' },
        { _id: 'p2', name: 'Producto 2', price: 49.99, stock: 5, imageUrls: [], status: 'Active' },
      ],
    });

    const { default: StoreProductsPage } = await import('@/app/dashboard/my-store/[slug]/products/page');
    render(<StoreProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Productos de Mi Tienda')).toBeInTheDocument();
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
      expect(screen.getByText('Producto 2')).toBeInTheDocument();
      expect(screen.getAllByTestId('product-card')).toHaveLength(2);
    });
  });

  it('debería mostrar el estado vacío cuando no hay productos', async () => {
    mockUseStore.mockReturnValue({
      store: { _id: 's1', storeName: 'Mi Tienda', slug: 'my-store' },
      isLoading: false,
    });
    mockGetByStore.mockResolvedValue({ products: [] });

    const { default: StoreProductsPage } = await import('@/app/dashboard/my-store/[slug]/products/page');
    render(<StoreProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('No tienes productos todavía')).toBeInTheDocument();
      expect(screen.getByText('Agrega tu primer producto para comenzar a vender')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /agregar producto/i })).toHaveAttribute(
        'href',
        '/dashboard/my-store/my-store/products/new'
      );
    });
  });
});
