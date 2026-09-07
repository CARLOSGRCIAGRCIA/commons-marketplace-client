import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/store/wishlist-store', () => ({
  useWishlistStore: Object.assign(vi.fn(() => ({ items: [] })), {
    getState: vi.fn(() => ({ items: [] })),
    setState: vi.fn(),
  }),
}));

vi.mock('@/lib/api', () => ({
  userApi: {
    update: vi.fn(),
  },
}));

const mockAuthState = {
  user: null as any,
  isAuthenticated: false,
  setUser: vi.fn(),
};

vi.mock('@/store/auth-store', () => ({
  useAuthStore: Object.assign(vi.fn(() => mockAuthState), {
    getState: vi.fn(() => mockAuthState),
    setState: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockAuthState.user = null;
  mockAuthState.isAuthenticated = false;
});

describe('ProfilePage', () => {
  it('should show login prompt when not authenticated', async () => {
    mockAuthState.isAuthenticated = false;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);
    expect(screen.getByText(/Debes iniciar sesión/)).toBeInTheDocument();
  });

  it('should render profile form when authenticated', async () => {
    mockAuthState.user = { _id: '1', name: 'John', lastName: 'Doe', email: 'john@test.com', phoneNumber: '+52 55 0000', address: '123 Main St', role: 'buyer' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
    expect(screen.getByText('Identidad')).toBeInTheDocument();
    expect(screen.getByText('Contacto')).toBeInTheDocument();
  });

  it('should show user info', async () => {
    mockAuthState.user = { _id: '1', name: 'John', lastName: 'Doe', email: 'john@test.com', role: 'buyer' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);
    expect(screen.getByText('john@test.com')).toBeInTheDocument();
    expect(screen.getByText('Usuario')).toBeInTheDocument();
  });

  it('should show admin role label', async () => {
    mockAuthState.user = { _id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);
    expect(screen.getByText('Administrador')).toBeInTheDocument();
  });

  it('should show seller role label', async () => {
    mockAuthState.user = { _id: '1', name: 'Seller', email: 'seller@test.com', role: 'seller' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);
    expect(screen.getByText('Vendedor')).toBeInTheDocument();
  });

  it('should render save button', async () => {
    mockAuthState.user = { _id: '1', name: 'John', email: 'john@test.com', role: 'buyer' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);
    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const { userApi } = await import('@/lib/api');
    (userApi.update as any).mockResolvedValue({ _id: '1', name: 'Updated' });

    mockAuthState.user = { _id: '1', name: 'John', lastName: 'Doe', email: 'john@test.com', role: 'buyer' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);

    fireEvent.change(screen.getByPlaceholderText('Tu nombre'), { target: { name: 'name', value: 'Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(userApi.update).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByText('Perfil actualizado correctamente')).toBeInTheDocument();
    });
  });

  it('should show validation errors on submit', async () => {
    mockAuthState.user = { _id: '1', name: 'John', email: 'john@test.com', role: 'buyer' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);

    fireEvent.change(screen.getByPlaceholderText('+52 55 0000 0000'), {
      target: { name: 'phoneNumber', value: 'abc123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(screen.getByText(/Por favor corrige los campos/)).toBeInTheDocument();
    });
  });

  it('should show error on API failure', async () => {
    const { userApi } = await import('@/lib/api');
    (userApi.update as any).mockRejectedValue(new Error('Server error'));

    mockAuthState.user = { _id: '1', name: 'John', email: 'john@test.com', role: 'buyer' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('should show generic error for non-Error thrown value', async () => {
    const { userApi } = await import('@/lib/api');
    (userApi.update as any).mockRejectedValue('string error');

    mockAuthState.user = { _id: '1', name: 'John', email: 'john@test.com', role: 'buyer' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(screen.getByText('Error al actualizar perfil')).toBeInTheDocument();
    });
  });

  it('should handle avatar file change', async () => {
    const createObjectURL = vi.fn(() => 'blob:mock-url');
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    mockAuthState.user = { _id: '1', name: 'John', email: 'john@test.com', role: 'buyer' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    const { container } = render(<ProfilePage />);

    const file = new File(['test'], 'avatar.png', { type: 'image/png' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    expect(createObjectURL).toHaveBeenCalled();
  });

  it('should reject avatar over 5MB', async () => {
    mockAuthState.user = { _id: '1', name: 'John', email: 'john@test.com', role: 'buyer' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    const { container } = render(<ProfilePage />);

    const bigFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'big.png', { type: 'image/png' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { files: [bigFile] } });
    });
    await waitFor(() => {
      expect(screen.getByText(/La foto no debe superar 5MB/)).toBeInTheDocument();
    });
  });

  it('should populate form fields from user data', async () => {
    mockAuthState.user = { _id: '1', name: 'Jane', lastName: 'Smith', phoneNumber: '+52 55 1234', address: '456 Oak Ave', email: 'jane@test.com', role: 'buyer' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('jane@test.com')).toBeInTheDocument();
      expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
    });
  });

  it('should validate phone number format', async () => {
    mockAuthState.user = { _id: '1', name: 'John', email: 'john@test.com', role: 'buyer' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);

    fireEvent.change(screen.getByPlaceholderText('+52 55 0000 0000'), {
      target: { name: 'phoneNumber', value: 'letters only' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(screen.getByText(/El teléfono solo puede contener/)).toBeInTheDocument();
    });
  });

  it('should allow empty optional fields', async () => {
    const { userApi } = await import('@/lib/api');
    (userApi.update as any).mockResolvedValue({ _id: '1', name: 'John' });

    mockAuthState.user = { _id: '1', name: 'John', email: 'john@test.com', role: 'buyer' };
    mockAuthState.isAuthenticated = true;
    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(userApi.update).toHaveBeenCalled();
    });
  });
});
