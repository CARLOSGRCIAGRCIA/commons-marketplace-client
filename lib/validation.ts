/**
 * Límites de campos que reflejan exactamente las restricciones del backend
 * (commons-marketplace/src/presentation/validators + models).
 */
export const FIELD_LIMITS = {
  PRODUCT_NAME: 200,
  PRODUCT_DESCRIPTION: 5000,
  STORE_NAME: 100,
  STORE_DESCRIPTION: 2000,
  REVIEW_COMMENTARY: 1000,
  CHAT_CONTENT: 5000,
  SEO_TITLE: 70,
  SEO_DESCRIPTION: 160,
  CATEGORY_NAME: 100,
  CATEGORY_DESCRIPTION: 1000,
  NAME: 100,
  LAST_NAME: 100,
  PHONE: 20,
  ADDRESS: 200,
  SELLER_REQUEST_MESSAGE: 500,
} as const;

/** Valida que un valor no esté vacío después de recortar espacios. */
export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

/** Valida que la longitud no supere el máximo. */
export function isWithinLength(value: string, max: number): boolean {
  return value.length <= max;
}

/** Valida una longitud mínima. */
export function isAtLeastLength(value: string, min: number): boolean {
  return value.length >= min;
}

/** Valida un número de coma flotante no negativo (para precio). */
export function isPositiveNumber(value: string): boolean {
  if (value.trim() === '') return false;
  const num = Number(value);
  if (Number.isNaN(num)) return false;
  return num >= 0;
}

/** Valida un entero no negativo (para stock). */
export function isNonNegativeInt(value: string): boolean {
  if (value.trim() === '') return false;
  const num = Number(value);
  if (Number.isNaN(num)) return false;
  return Number.isInteger(num) && num >= 0;
}

/** Valida un entero dentro de un rango (para score 1-5). */
export function isIntInRange(value: number, min: number, max: number): boolean {
  if (!Number.isInteger(value)) return false;
  return value >= min && value <= max;
}

/** Valida un email con un patrón básico. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

/** Detecta caracteres de control no permitidos. */
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F]/;
export function hasControlChars(value: string): boolean {
  return CONTROL_CHARS_REGEX.test(value);
}

interface Rule {
  validator: (value: string) => boolean;
  message: string;
}

/**
 * Ejecuta un conjunto de reglas sobre un valor y devuelve el primer mensaje
 * de error o `null` si todas pasan.
 */
export function validateField(value: string, rules: Rule[]): string | null {
  for (const rule of rules) {
    if (!rule.validator(value)) {
      return rule.message;
    }
  }
  return null;
}

/** Reglas reutilizables para un campo de texto requerido con longitud máxima. */
export function requiredText(value: string, max: number, label: string): string | null {
  return validateField(value, [
    { validator: isRequired, message: `${label} es requerido` },
    { validator: (v) => !hasControlChars(v), message: `${label} contiene caracteres no válidos` },
    { validator: (v) => isWithinLength(v, max), message: `${label} no debe exceder ${max} caracteres` },
  ]);
}

/** Reglas reutilizables para un campo de texto opcional con longitud máxima. */
export function optionalText(value: string, max: number, label: string): string | null {
  if (value.trim() === '') return null;
  return validateField(value, [
    { validator: (v) => !hasControlChars(v), message: `${label} contiene caracteres no válidos` },
    { validator: (v) => isWithinLength(v, max), message: `${label} no debe exceder ${max} caracteres` },
  ]);
}
