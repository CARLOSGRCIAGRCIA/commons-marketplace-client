import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn(), refresh: vi.fn() }),
  useParams: () => ({ slug: 'my-store', prodId: 'p1' }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

const mockUseProduct = vi.fn();
vi.mock('@/hooks/use-products', () => ({
  useProduct: mockUseProduct,
}));

const mockUpdate = vi.fn();
const mockGetAll = vi.fn();
vi.mock('@/lib/api', () => ({
  productApi: { update: mockUpdate, uploadImages: vi.fn() },
  categoryApi: { getAll: mockGetAll },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  mockGetAll.mockResolvedValue([
    { _id: 'c1', name: 'Categoría 1' },
    { _id: 'c2', name: 'Categoría 2' },
  ]);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('EditProductPage', () => {
  it('debería mostrar el estado de carga', async () => {
    mockUseProduct.mockReturnValue({ product: null, isLoading: true });

    const { default: EditProductPage } = await import('@/app/dashboard/my-store/[slug]/products/[prodId]/edit/page');
    const { container } = render(<EditProductPage />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('debería mostrar el formulario con los datos del producto', async () => {
    mockUseProduct.mockReturnValue({
      product: {
        _id: 'p1',
        name: 'Producto Test',
        description: 'Descripción del producto',
        price: 29.99,
        stock: 15,
        categoryId: 'c1',
        status: 'Active',
        imageUrls: ['https://example.com/img.jpg'],
      },
      isLoading: false,
    });

    const { default: EditProductPage } = await import('@/app/dashboard/my-store/[slug]/products/[prodId]/edit/page');

    await act(async () => {
      render(<EditProductPage />);
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText('Editar Producto')).toBeInTheDocument();
    expect(screen.getByText('13/200')).toBeInTheDocument();
    expect(screen.getByText('24/5000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('debería cargar las categorías disponibles', async () => {
    mockUseProduct.mockReturnValue({
      product: {
        _id: 'p1',
        name: 'Test',
        description: 'Desc',
        price: 10,
        stock: 5,
        categoryId: 'c1',
        status: 'Active',
        imageUrls: [],
      },
      isLoading: false,
    });

    const { default: EditProductPage } = await import('@/app/dashboard/my-store/[slug]/products/[prodId]/edit/page');

    await act(async () => {
      render(<EditProductPage />);
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText('Categoría 1')).toBeInTheDocument();
    expect(screen.getByText('Categoría 2')).toBeInTheDocument();
  });
});
