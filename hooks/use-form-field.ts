import { useState, useCallback } from 'react';

interface UseFormFieldOptions<T extends Record<string, unknown>> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit: (values: T) => Promise<void>;
}

interface UseFormFieldResult<T extends Record<string, unknown>> {
  values: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFieldError: (field: string, message: string) => void;
  setError: (message: string | null) => void;
  setValues: React.Dispatch<React.SetStateAction<T>>;
  reset: () => void;
}

export function useFormField<T extends Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormFieldOptions<T>): UseFormFieldResult<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(false);

      if (validate) {
        const validationErrors = validate(values);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
      }

      setErrors({});
      setIsSubmitting(true);

      try {
        await onSubmit(values);
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ha ocurrido un error');
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setError(null);
    setSuccess(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    error,
    success,
    handleChange,
    handleSubmit,
    setFieldError,
    setError,
    setValues,
    reset,
  };
}
