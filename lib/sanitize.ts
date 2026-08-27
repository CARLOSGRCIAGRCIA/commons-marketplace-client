/** Elimina caracteres de control, colapsa espacios múltiples y recorta. */
export function sanitizeString(value: string): string {
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').replace(/\s+/g, ' ').trim();
}

/** Limpia dos String no permitidos por sanitizeString(numero). */
export function sanitizeNumericField(value: string): string {
  return value.trim();
}

/**
 * Sanitiza un FormData: las claves de tipo string se limpian, los objetos File
 * se dejan intactos.
 */
export function sanitizeFormData(data: FormData): FormData {
  const clean = new FormData();
  for (const [key, value] of data.entries()) {
    if (typeof value === 'string') {
      clean.append(key, sanitizeString(value));
    } else {
      clean.append(key, value);
    }
  }
  return clean;
}

interface NumericOptions {
  integer?: boolean;
  min?: number;
  max?: number;
}

/** Valida y normaliza un string numérico. Devuelve `null` si es inválido. */
export function validateNumericField(value: string, opts: NumericOptions = {}): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const num = Number(trimmed);
  if (Number.isNaN(num)) return null;
  if (opts.integer && !Number.isInteger(num)) return null;
  if (opts.min !== undefined && num < opts.min) return null;
  if (opts.max !== undefined && num > opts.max) return null;
  return num;
}
