import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const mockPush = vi.fn();
const mockBack = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, refresh: mockRefresh }),
  useParams: () => ({ slug: 'my-store' }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('@/hooks/use-stores', () => ({
  useStore: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  storeApi: { update: vi.fn(), delete: vi.fn() },
}));

vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, isLoading, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} disabled={isLoading} {...props}>{children}</button>
  ),
  Input: ({ label, name, value, onChange, error, ...props }: any) => (
    <div>
      <label>{label}</label>
      <input name={name} value={value} onChange={onChange} {...props} />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  Textarea: ({ label, name, value, onChange, error, ...props }: any) => (
    <div>
      <label>{label}</label>
      <textarea name={name} value={value} onChange={onChange} {...props} />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Spinner: () => <div data-testid="spinner" />,
}));

vi.mock('@/components/ui/image-upload', () => ({
  ImageUpload: (props: any) => <div data-testid="image-upload">{props.label}</div>,
}));

vi.mock('@/lib/validation', () => ({
  FIELD_LIMITS: { STORE_NAME: 100, STORE_DESCRIPTION: 500 },
  requiredText: (v: string, max: number, label: string) => (!v ? `${label} es requerido` : v.length > max ? `Máximo ${max} caracteres` : null),
  optionalText: (v: string, max: number, label: string) => (v && v.length > max ? `Máximo ${max} caracteres` : null),
}));

vi.mock('@/lib/sanitize', () => ({
  sanitizeFormData: (fd: FormData) => fd,
}));

import { useStore } from '@/hooks/use-stores';
import { storeApi } from '@/lib/api';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('EditStorePage', () => {
  it('should show loading state', async () => {
    vi.mocked(useStore).mockReturnValue({ store: null, isLoading: true, error: null });
    const { default: EditStorePage } = await import('@/app/dashboard/my-store/[slug]/edit/page');
    const { container } = render(<EditStorePage />);
    expect(container.querySelector('[data-testid="spinner"]')).toBeInTheDocument();
  });

  it('should render form with store data', async () => {
    vi.mocked(useStore).mockReturnValue({
      store: { _id: 's1', storeName: 'My Store', description: 'A great store', slug: 'my-store', logo: '/logo.png' },
      isLoading: false,
      error: null,
    });
    const { default: EditStorePage } = await import('@/app/dashboard/my-store/[slug]/edit/page');
    render(<EditStorePage />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('My Store')).toBeInTheDocument();
    }, { timeout: 2000 });
    expect(screen.getByDisplayValue('A great store')).toBeInTheDocument();
  });

  it('should navigate to dashboard on cancel', async () => {
    vi.mocked(useStore).mockReturnValue({
      store: { _id: 's1', storeName: 'My Store', description: 'Test', slug: 'my-store' },
      isLoading: false,
      error: null,
    });
    const { default: EditStorePage } = await import('@/app/dashboard/my-store/[slug]/edit/page');
    render(<EditStorePage />);
    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });
    screen.getByText('Cancelar').click();
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should render delete button in danger zone', async () => {
    vi.mocked(useStore).mockReturnValue({
      store: { _id: 's1', storeName: 'My Store', description: 'Test', slug: 'my-store' },
      isLoading: false,
      error: null,
    });
    const { default: EditStorePage } = await import('@/app/dashboard/my-store/[slug]/edit/page');
    render(<EditStorePage />);
    await waitFor(() => {
      expect(screen.getByText('Eliminar Tienda')).toBeInTheDocument();
    });
    expect(screen.getByText('Zona de Peligro')).toBeInTheDocument();
  });
});
