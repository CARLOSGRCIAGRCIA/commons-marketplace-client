import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('@/hooks/use-reviews', () => ({
  useReviews: vi.fn(),
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  reviewApi: { create: vi.fn() },
}));

import { useReviews } from '@/hooks/use-reviews';
import { useAuth } from '@/hooks/use-auth';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ReviewsSection', () => {
  it('should show loading state', async () => {
    vi.mocked(useReviews).mockReturnValue({ reviews: [], isLoading: true, error: null, avgScore: 0, reviewCount: 0 });
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false, user: null } as any);
    const { ReviewsSection } = await import('@/app/products/[slug]/reviews-list');
    render(<ReviewsSection productId="p1" />);
    expect(screen.getByText('Cargando reseñas...')).toBeInTheDocument();
  });

  it('should show error state', async () => {
    vi.mocked(useReviews).mockReturnValue({ reviews: [], isLoading: false, error: 'API error', avgScore: 0, reviewCount: 0 });
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false, user: null } as any);
    const { ReviewsSection } = await import('@/app/products/[slug]/reviews-list');
    render(<ReviewsSection productId="p1" />);
    expect(screen.getByText('API error')).toBeInTheDocument();
  });

  it('should show empty reviews message', async () => {
    vi.mocked(useReviews).mockReturnValue({ reviews: [], isLoading: false, error: null, avgScore: 0, reviewCount: 0 });
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false, user: null } as any);
    const { ReviewsSection } = await import('@/app/products/[slug]/reviews-list');
    render(<ReviewsSection productId="p1" />);
    expect(screen.getByText('No hay reseñas todavía.')).toBeInTheDocument();
  });

  it('should render reviews', async () => {
    vi.mocked(useReviews).mockReturnValue({
      reviews: [
        { id: 'r1', score: 5, commentary: 'Great product!' },
        { id: 'r2', score: 3, commentary: 'Decent' },
      ] as any,
      isLoading: false,
      error: null,
      avgScore: 4,
      reviewCount: 2,
    });
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false, user: null } as any);
    const { ReviewsSection } = await import('@/app/products/[slug]/reviews-list');
    render(<ReviewsSection productId="p1" />);
    expect(screen.getByText('Great product!')).toBeInTheDocument();
    expect(screen.getByText('Decent')).toBeInTheDocument();
  });

  it('should show review form for authenticated buyers', async () => {
    vi.mocked(useReviews).mockReturnValue({
      reviews: [],
      isLoading: false,
      error: null,
      avgScore: 0,
      reviewCount: 0,
    });
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, user: { _id: '1', role: 'buyer' } } as any);
    const { ReviewsSection } = await import('@/app/products/[slug]/reviews-list');
    render(<ReviewsSection productId="p1" />);
    expect(screen.getByText('Escribir Reseña')).toBeInTheDocument();
  });

  it('should not show review form for non-buyers', async () => {
    vi.mocked(useReviews).mockReturnValue({
      reviews: [],
      isLoading: false,
      error: null,
      avgScore: 0,
      reviewCount: 0,
    });
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, user: { _id: '1', role: 'seller' } } as any);
    const { ReviewsSection } = await import('@/app/products/[slug]/reviews-list');
    render(<ReviewsSection productId="p1" />);
    expect(screen.queryByText('Escribir Reseña')).not.toBeInTheDocument();
  });
});
