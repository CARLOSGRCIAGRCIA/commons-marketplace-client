import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormField } from '@/hooks/use-form-field';

describe('useFormField', () => {
  const defaultOptions = {
    initialValues: { name: '', email: '' },
    onSubmit: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFormField(defaultOptions));
    expect(result.current.values).toEqual({ name: '', email: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
  });

  it('should update values on handleChange', async () => {
    const { result } = renderHook(() => useFormField(defaultOptions));
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.values).toEqual({ name: 'John', email: '' });
  });

  it('should clear field error when value changes', async () => {
    const { result } = renderHook(() => useFormField(defaultOptions));
    act(() => {
      result.current.setFieldError('name', 'Required');
    });
    expect(result.current.errors.name).toBe('Required');
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.errors.name).toBeUndefined();
  });

  it('should submit successfully', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useFormField({ ...defaultOptions, onSubmit }));
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });
    expect(onSubmit).toHaveBeenCalledWith({ name: 'John', email: '' });
    expect(result.current.success).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle submit error', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'));
    const { result } = renderHook(() => useFormField({ ...defaultOptions, onSubmit }));
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });
    expect(result.current.error).toBe('Server error');
    expect(result.current.success).toBe(false);
  });

  it('should handle non-Error thrown value', async () => {
    const onSubmit = vi.fn().mockRejectedValue('string error');
    const { result } = renderHook(() => useFormField({ ...defaultOptions, onSubmit }));
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });
    expect(result.current.error).toBe('Ha ocurrido un error');
  });

  it('should run validation and block submit on errors', async () => {
    const onSubmit = vi.fn();
    const validate = vi.fn().mockReturnValue({ name: 'Required' });
    const { result } = renderHook(() =>
      useFormField({ ...defaultOptions, onSubmit, validate })
    );
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });
    expect(validate).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors).toEqual({ name: 'Required' });
  });

  it('should pass validation and submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const validate = vi.fn().mockReturnValue({});
    const { result } = renderHook(() =>
      useFormField({ ...defaultOptions, onSubmit, validate })
    );
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });
    expect(onSubmit).toHaveBeenCalled();
  });

  it('setFieldError should set error for specific field', () => {
    const { result } = renderHook(() => useFormField(defaultOptions));
    act(() => {
      result.current.setFieldError('email', 'Invalid email');
    });
    expect(result.current.errors.email).toBe('Invalid email');
  });

  it('setError should set general error', () => {
    const { result } = renderHook(() => useFormField(defaultOptions));
    act(() => {
      result.current.setError('Something went wrong');
    });
    expect(result.current.error).toBe('Something went wrong');
  });

  it('setValues should update values', () => {
    const { result } = renderHook(() => useFormField(defaultOptions));
    act(() => {
      result.current.setValues({ name: 'Jane', email: 'jane@test.com' });
    });
    expect(result.current.values).toEqual({ name: 'Jane', email: 'jane@test.com' });
  });

  it('reset should restore initial values and clear state', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useFormField({ ...defaultOptions, onSubmit }));
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.setFieldError('email', 'Required');
    });
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });
    expect(result.current.success).toBe(true);
    act(() => {
      result.current.reset();
    });
    expect(result.current.values).toEqual({ name: '', email: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
  });
});
