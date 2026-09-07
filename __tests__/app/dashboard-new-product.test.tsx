import { describe, it, expect, vi } from 'vitest';
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

vi.mock('@/lib/api', () => ({
  productApi: { create: vi.fn() },
  categoryApi: { getAll: vi.fn().mockResolvedValue([]) },
}));

vi.mock('@/components/ui/image-upload', () => ({
  ImageUpload: (props: any) => <div data-testid="image-upload">{props.label}</div>,
}));

vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, isLoading, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} disabled={isLoading} {...props}>{children}</button>
  ),
  Input: ({ label, name, value, onChange, error, type, ...props }: any) => (
    <div>
      <label>{label}</label>
      <input name={name} value={value} onChange={onChange} type={type} {...props} />
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
}));

vi.mock('@/hooks/use-form-field', () => ({
  useFormField: ({ initialValues, validate, onSubmit }: any) => {
    const values = { ...initialValues };
    const errors: Record<string, string> = {};
    return {
      values,
      errors,
      isSubmitting: false,
      error: null,
      handleChange: vi.fn(),
      handleSubmit: vi.fn((e: any) => { e.preventDefault(); }),
      setFieldError: vi.fn(),
    };
  },
}));

vi.mock('@/lib/validation', () => ({
  FIELD_LIMITS: { PRODUCT_NAME: 100, PRODUCT_DESCRIPTION: 1000 },
  requiredText: (v: string, max: number, label: string) => (!v ? `${label} es requerido` : v.length > max ? `Máximo ${max} caracteres` : null),
  isPositiveNumber: (v: string) => !isNaN(Number(v)) && Number(v) >= 0,
  isNonNegativeInt: (v: string) => Number.isInteger(Number(v)) && Number(v) >= 0,
}));

vi.mock('@/lib/sanitize', () => ({
  sanitizeFormData: (fd: FormData) => fd,
  validateNumericField: (v: string, opts: any) => Number(v),
}));

describe('NewProductPage', () => {
  it('should render form with all fields', async () => {
    const { default: NewProductPage } = await import('@/app/dashboard/my-store/[slug]/products/new/page');
    render(<NewProductPage />);
    await waitFor(() => {
      expect(screen.getByText('Nuevo Producto')).toBeInTheDocument();
    });
    expect(screen.getByText('Nombre del producto')).toBeInTheDocument();
    expect(screen.getByText('Descripción')).toBeInTheDocument();
    expect(screen.getByText('Precio')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
  });

  it('should render category select', async () => {
    const { default: NewProductPage } = await import('@/app/dashboard/my-store/[slug]/products/new/page');
    render(<NewProductPage />);
    await waitFor(() => {
      expect(screen.getByText('Categoría')).toBeInTheDocument();
    });
    expect(screen.getByText('Selecciona una categoría')).toBeInTheDocument();
  });

  it('should render ImageUpload component', async () => {
    const { default: NewProductPage } = await import('@/app/dashboard/my-store/[slug]/products/new/page');
    render(<NewProductPage />);
    await waitFor(() => {
      expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    });
    expect(screen.getByText('Imágenes del producto')).toBeInTheDocument();
  });

  it('should navigate back on cancel', async () => {
    const { default: NewProductPage } = await import('@/app/dashboard/my-store/[slug]/products/new/page');
    render(<NewProductPage />);
    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });
    screen.getByText('Cancelar').click();
    expect(mockPush).toHaveBeenCalledWith('/dashboard/my-store/my-store/products');
  });

  it('should have submit and cancel buttons', async () => {
    const { default: NewProductPage } = await import('@/app/dashboard/my-store/[slug]/products/new/page');
    render(<NewProductPage />);
    await waitFor(() => {
      expect(screen.getByText('Crear Producto')).toBeInTheDocument();
    });
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });
});
