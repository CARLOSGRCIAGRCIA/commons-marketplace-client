import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/hooks/use-categories', () => ({
  useCategories: vi.fn(),
}));

import { useCategories } from '@/hooks/use-categories';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CategoriesSidebar', () => {
  it('should show loading skeleton', async () => {
    vi.mocked(useCategories).mockReturnValue({ categories: [], isLoading: true, error: null });
    const { CategoriesSidebar } = await import('@/app/products/categories-sidebar');
    const { container } = render(<CategoriesSidebar />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should show error state', async () => {
    vi.mocked(useCategories).mockReturnValue({ categories: [], isLoading: false, error: 'API error' });
    const { CategoriesSidebar } = await import('@/app/products/categories-sidebar');
    render(<CategoriesSidebar />);
    expect(screen.getByText('API error')).toBeInTheDocument();
  });

  it('should show all categories link', async () => {
    vi.mocked(useCategories).mockReturnValue({
      categories: [{ _id: 'cat1', name: 'Tech', slug: 'tech' }] as any,
      isLoading: false,
      error: null,
    });
    const { CategoriesSidebar } = await import('@/app/products/categories-sidebar');
    render(<CategoriesSidebar />);
    expect(screen.getByText('Todas las categorías')).toBeInTheDocument();
    expect(screen.getByText('Tech')).toBeInTheDocument();
  });

  it('should render heading', async () => {
    vi.mocked(useCategories).mockReturnValue({
      categories: [],
      isLoading: false,
      error: null,
    });
    const { CategoriesSidebar } = await import('@/app/products/categories-sidebar');
    render(<CategoriesSidebar />);
    expect(screen.getByText('Categorías')).toBeInTheDocument();
  });
});
