import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('@/components/ui', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

describe('Loading pages', () => {
  it('should render products loading skeleton', async () => {
    const { default: ProductsLoading } = await import('@/app/products/loading');
    const { container } = render(<ProductsLoading />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('should render stores loading skeleton', async () => {
    const { default: StoresLoading } = await import('@/app/stores/loading');
    const { container } = render(<StoresLoading />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('should render dashboard products loading skeleton', async () => {
    const { default: DashboardProductsLoading } = await import('@/app/dashboard/my-store/[slug]/products/loading');
    const { container } = render(<DashboardProductsLoading />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('should render edit product loading skeleton', async () => {
    const { default: EditProductLoading } = await import('@/app/dashboard/my-store/[slug]/products/[prodId]/edit/loading');
    const { container } = render(<EditProductLoading />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});
