import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockSearchParams.delete('search');
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

  it('should display recent searches when input is focused', async () => {
    localStorage.setItem('recent-searches', JSON.stringify(['laptop', 'phone']));
    const user = userEvent.setup();
    const { SearchBar } = await import('@/app/products/search-bar');
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Buscar productos...');
    await user.click(input);
    expect(screen.getByText('laptop')).toBeInTheDocument();
    expect(screen.getByText('phone')).toBeInTheDocument();
  });

  it('should clear input and perform search on clear button click', async () => {
    const user = userEvent.setup();
    const { SearchBar } = await import('@/app/products/search-bar');
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Buscar productos...');
    await user.type(input, 'test');
    const clearBtn = screen.getByRole('button', { name: /Limpiar búsqueda/i });
    await user.click(clearBtn);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it('should handle blur to hide recent searches', async () => {
    localStorage.setItem('recent-searches', JSON.stringify(['laptop']));
    const user = userEvent.setup();
    const { SearchBar } = await import('@/app/products/search-bar');
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Buscar productos...');
    await user.click(input);
    expect(screen.getByText('laptop')).toBeInTheDocument();
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.queryByText('laptop')).not.toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('should handle recent search click', async () => {
    localStorage.setItem('recent-searches', JSON.stringify(['laptop']));
    const user = userEvent.setup();
    const { SearchBar } = await import('@/app/products/search-bar');
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Buscar productos...');
    await user.click(input);
    await user.click(screen.getByText('laptop'));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('search=laptop'));
    });
  });

  it('should not show recent searches when query is not empty', async () => {
    localStorage.setItem('recent-searches', JSON.stringify(['laptop']));
    const user = userEvent.setup();
    const { SearchBar } = await import('@/app/products/search-bar');
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Buscar productos...');
    await user.type(input, 'test');
    await user.click(input);
    expect(screen.queryByText('laptop')).not.toBeInTheDocument();
  });
});
