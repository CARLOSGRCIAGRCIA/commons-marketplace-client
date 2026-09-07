import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner, Skeleton } from '@/components/ui';

describe('Spinner', () => {
  it('should render SVG element', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Spinner className="h-8 w-8" />);
    const svg = container.querySelector('svg');
    expect(svg?.className.baseVal).toContain('h-8');
  });

  it('should have animate-spin class', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg?.className.baseVal).toContain('animate-spin');
  });
});

describe('Skeleton', () => {
  it('should render div element', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
  });

  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('h-4');
    expect(div.className).toContain('w-32');
  });
});
