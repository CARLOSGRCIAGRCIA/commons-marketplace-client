import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('SearchBar', () => {
  it('should render search input', async () => {
    const { SearchBar } = await import('@/app/products/search-bar');
    render(<SearchBar />);
    expect(screen.getByPlaceholderText('Buscar productos...')).toBeInTheDocument();
  });

  it('should update query on input change', async () => {
    const user = userEvent.setup();
    const { SearchBar } = await import('@/app/products/search-bar');
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Buscar productos...');
    await user.type(input, 'phone');
    expect(input).toHaveValue('phone');
  });
});
