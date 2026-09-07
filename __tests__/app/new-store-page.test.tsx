import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('@/store/auth-store', () => ({
  useAuthStore: Object.assign(vi.fn(() => ({ user: { id: '1', name: 'Test', role: 'seller' }, isAuthenticated: true, isLoading: false })), {
    getState: vi.fn(() => ({ user: { id: '1', name: 'Test', role: 'seller' }, isAuthenticated: true, isLoading: false })),
    setState: vi.fn(),
  }),
}));

vi.mock('@/store/wishlist-store', () => ({
  useWishlistStore: Object.assign(vi.fn(() => ({ items: [] })), {
    getState: vi.fn(() => ({ items: [] })),
    setState: vi.fn(),
  }),
}));

const mockCreate = vi.fn();
vi.mock('@/lib/api', () => ({
  storeApi: { create: mockCreate },
}));

const mockHandleSubmit = vi.fn((e: any) => { e.preventDefault(); });
const mockHandleChange = vi.fn();
const mockFormFieldState = {
  values: { storeName: '', description: '' },
  errors: {} as Record<string, string>,
  isSubmitting: false,
  error: null as string | null,
  handleChange: mockHandleChange,
  handleSubmit: mockHandleSubmit,
  setFieldError: vi.fn(),
};

vi.mock('@/hooks/use-form-field', () => ({
  useFormField: vi.fn(() => mockFormFieldState),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockFormFieldState.values = { storeName: '', description: '' };
  mockFormFieldState.errors = {};
  mockFormFieldState.isSubmitting = false;
  mockFormFieldState.error = null;
});

describe('NewStorePage', () => {
  it('debería renderizar el formulario con los campos requeridos', async () => {
    const { default: NewStorePage } = await import('@/app/dashboard/new-store/page');
    render(<NewStorePage />);

    expect(screen.getByRole('heading', { name: /crear tienda/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre de la tienda/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear tienda/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('debería mostrar errores de validación para nombre vacío', async () => {
    mockFormFieldState.errors = { storeName: 'El nombre de la tienda es requerido' };
    mockFormFieldState.handleSubmit = vi.fn((e: any) => {
      e.preventDefault();
    });

    const { default: NewStorePage } = await import('@/app/dashboard/new-store/page');
    render(<NewStorePage />);

    await waitFor(() => {
      expect(screen.getByText('El nombre de la tienda es requerido')).toBeInTheDocument();
    });
  });

  it('debería enviar el formulario y redirigir', async () => {
    mockCreate.mockResolvedValue({});
    mockFormFieldState.handleSubmit = vi.fn(async (e: any) => {
      e.preventDefault();
      await mockCreate();
      mockPush('/dashboard');
    });

    const { default: NewStorePage } = await import('@/app/dashboard/new-store/page');
    const user = userEvent.setup();
    render(<NewStorePage />);

    await user.type(screen.getByLabelText(/nombre de la tienda/i), 'Mi Tienda');
    await user.type(screen.getByLabelText(/descripción/i), 'Una tienda de prueba');
    await user.click(screen.getByRole('button', { name: /crear tienda/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
