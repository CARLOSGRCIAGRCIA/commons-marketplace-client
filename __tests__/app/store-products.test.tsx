import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('@/lib/api', () => ({
  productApi: { getByStore: vi.fn() },
}));

vi.mock('@/app/products/product-card', () => ({
  ProductCard: ({ product }: any) => <div data-testid="product-card">{product.name}</div>,
}));

vi.mock('@/components/ui', () => ({
  Skeleton: (props: any) => <div data-testid="skeleton" {...props} />,
}));

import { productApi } from '@/lib/api';
import { StoreProducts } from '@/app/stores/[slug]/store-products';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('StoreProducts', () => {
  it('should show loading skeletons', () => {
    vi.mocked(productApi.getByStore).mockReturnValue(new Promise(() => {}));
    const { container } = render(<StoreProducts storeId="s1" />);
    const skeletons = container.querySelectorAll('[data-testid="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show error state', async () => {
    vi.mocked(productApi.getByStore).mockRejectedValue(new Error('Network error'));
    render(<StoreProducts storeId="s1" />);
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should show empty state when no products', async () => {
    vi.mocked(productApi.getByStore).mockResolvedValue({ products: [] });
    render(<StoreProducts storeId="s1" />);
    await waitFor(() => {
      expect(screen.getByText(/Esta tienda no tiene productos todavía/)).toBeInTheDocument();
    });
  });

  it('should render products with "products" key in response', async () => {
    const products = [
      { _id: 'p1', name: 'Laptop' },
      { _id: 'p2', name: 'Mouse' },
    ];
    vi.mocked(productApi.getByStore).mockResolvedValue({ products });
    render(<StoreProducts storeId="s1" />);
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Mouse')).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('product-card')).toHaveLength(2);
  });

  it('should render products with "data" key in response', async () => {
    const products = [
      { _id: 'p1', name: 'Keyboard' },
    ];
    vi.mocked(productApi.getByStore).mockResolvedValue({ data: products });
    render(<StoreProducts storeId="s1" />);
    await waitFor(() => {
      expect(screen.getByText('Keyboard')).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('product-card')).toHaveLength(1);
  });

  it('should call getByStore with correct params', async () => {
    vi.mocked(productApi.getByStore).mockResolvedValue({ products: [] });
    render(<StoreProducts storeId="s1" />);
    await waitFor(() => {
      expect(productApi.getByStore).toHaveBeenCalledWith('s1', { limit: 20 });
    });
  });

  it('should show empty state when response has neither products nor data', async () => {
    vi.mocked(productApi.getByStore).mockResolvedValue({});
    render(<StoreProducts storeId="s1" />);
    await waitFor(() => {
      expect(screen.getByText(/Esta tienda no tiene productos todavía/)).toBeInTheDocument();
    });
  });

  it('should handle non-Error exception', async () => {
    vi.mocked(productApi.getByStore).mockRejectedValue('string error');
    render(<StoreProducts storeId="s1" />);
    await waitFor(() => {
      expect(screen.getByText('Error al cargar productos')).toBeInTheDocument();
    });
  });
});
