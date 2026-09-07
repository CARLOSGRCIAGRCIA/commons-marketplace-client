import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn(), refresh: vi.fn() }),
}));

const mockRegister = vi.fn();
const mockAuthState = {
  user: null as any,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
  register: mockRegister,
  clearError: vi.fn(),
};

vi.mock('@/store/auth-store', () => ({
  useAuthStore: Object.assign(vi.fn(() => mockAuthState), {
    getState: vi.fn(() => mockAuthState),
    setState: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockAuthState.error = null;
});

describe('RegisterForm', () => {
  it('should render all form fields', async () => {
    const { RegisterForm } = await import('@/app/register/register-form');
    render(<RegisterForm />);
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it('should validate empty fields on submit', async () => {
    const user = userEvent.setup();
    const { RegisterForm } = await import('@/app/register/register-form');
    render(<RegisterForm />);
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
    });
  });

  it('should validate short name', async () => {
    const user = userEvent.setup();
    const { RegisterForm } = await import('@/app/register/register-form');
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/nombre/i), 'A');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText(/al menos 2 caracteres/)).toBeInTheDocument();
    });
  });

  it('should validate short password', async () => {
    const user = userEvent.setup();
    const { RegisterForm } = await import('@/app/register/register-form');
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/nombre/i), 'John');
    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), '123');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText(/al menos 8 caracteres/)).toBeInTheDocument();
    });
  });

  it('should validate password without uppercase', async () => {
    const user = userEvent.setup();
    const { RegisterForm } = await import('@/app/register/register-form');
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/nombre/i), 'John');
    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), 'lowercase1');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText(/una letra mayúscula/)).toBeInTheDocument();
    });
  });

  it('should validate password without lowercase', async () => {
    const user = userEvent.setup();
    const { RegisterForm } = await import('@/app/register/register-form');
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/nombre/i), 'John');
    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), 'UPPERCASE1');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText(/una letra minúscula/)).toBeInTheDocument();
    });
  });

  it('should validate password without number', async () => {
    const user = userEvent.setup();
    const { RegisterForm } = await import('@/app/register/register-form');
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/nombre/i), 'John');
    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), 'NoNumberHere');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText(/un número/)).toBeInTheDocument();
    });
  });

  it('should validate password mismatch', async () => {
    const user = userEvent.setup();
    const { RegisterForm } = await import('@/app/register/register-form');
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/nombre/i), 'John');
    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), 'Password1');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Different1');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText(/no coinciden/)).toBeInTheDocument();
    });
  });

  it('should submit with valid data', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({ needsEmailConfirmation: false });
    const { RegisterForm } = await import('@/app/register/register-form');
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/nombre/i), 'John');
    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), 'Password1');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('John', 'test@test.com', 'Password1', 'buyer');
    });
  });

  it('should redirect to confirm-email when needsEmailConfirmation', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({ needsEmailConfirmation: true });
    const { RegisterForm } = await import('@/app/register/register-form');
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/nombre/i), 'John');
    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), 'Password1');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/register/confirm-email');
    });
  });
});
