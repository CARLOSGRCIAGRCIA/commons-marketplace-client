import { describe, it, expect } from 'vitest';
import {
  isRequired,
  isWithinLength,
  isAtLeastLength,
  isPositiveNumber,
  isNonNegativeInt,
  isIntInRange,
  isEmail,
  hasControlChars,
  validateField,
  requiredText,
  optionalText,
  FIELD_LIMITS,
} from '@/lib/validation';

describe('FIELD_LIMITS', () => {
  it('should have all field limits defined', () => {
    expect(FIELD_LIMITS.PRODUCT_NAME).toBe(200);
    expect(FIELD_LIMITS.STORE_NAME).toBe(100);
    expect(FIELD_LIMITS.NAME).toBe(100);
    expect(FIELD_LIMITS.REVIEW_COMMENTARY).toBe(1000);
  });
});

describe('isRequired', () => {
  it('should return true for non-empty strings', () => {
    expect(isRequired('hello')).toBe(true);
    expect(isRequired(' a ')).toBe(true);
  });

  it('should return false for empty strings', () => {
    expect(isRequired('')).toBe(false);
    expect(isRequired('   ')).toBe(false);
  });
});

describe('isWithinLength', () => {
  it('should return true when within max', () => {
    expect(isWithinLength('abc', 5)).toBe(true);
    expect(isWithinLength('abc', 3)).toBe(true);
  });

  it('should return false when exceeding max', () => {
    expect(isWithinLength('abcdef', 3)).toBe(false);
  });
});

describe('isAtLeastLength', () => {
  it('should return true when at least min', () => {
    expect(isAtLeastLength('abc', 3)).toBe(true);
    expect(isAtLeastLength('abcd', 3)).toBe(true);
  });

  it('should return false when below min', () => {
    expect(isAtLeastLength('ab', 3)).toBe(false);
  });
});

describe('isPositiveNumber', () => {
  it('should return true for valid numbers', () => {
    expect(isPositiveNumber('0')).toBe(true);
    expect(isPositiveNumber('10.5')).toBe(true);
    expect(isPositiveNumber('100')).toBe(true);
  });

  it('should return false for invalid numbers', () => {
    expect(isPositiveNumber('')).toBe(false);
    expect(isPositiveNumber('abc')).toBe(false);
  });

  it('should handle negative numbers', () => {
    expect(isPositiveNumber('-5')).toBe(false);
  });
});

describe('isNonNegativeInt', () => {
  it('should return true for valid non-negative integers', () => {
    expect(isNonNegativeInt('0')).toBe(true);
    expect(isNonNegativeInt('5')).toBe(true);
    expect(isNonNegativeInt('100')).toBe(true);
  });

  it('should return false for invalid values', () => {
    expect(isNonNegativeInt('')).toBe(false);
    expect(isNonNegativeInt('abc')).toBe(false);
    expect(isNonNegativeInt('1.5')).toBe(false);
    expect(isNonNegativeInt('-1')).toBe(false);
  });
});

describe('isIntInRange', () => {
  it('should return true for integers in range', () => {
    expect(isIntInRange(1, 1, 5)).toBe(true);
    expect(isIntInRange(3, 1, 5)).toBe(true);
    expect(isIntInRange(5, 1, 5)).toBe(true);
  });

  it('should return false for integers out of range', () => {
    expect(isIntInRange(0, 1, 5)).toBe(false);
    expect(isIntInRange(6, 1, 5)).toBe(false);
  });

  it('should return false for non-integers', () => {
    expect(isIntInRange(1.5, 1, 5)).toBe(false);
  });
});

describe('isEmail', () => {
  it('should return true for valid emails', () => {
    expect(isEmail('test@example.com')).toBe(true);
    expect(isEmail('user.name@domain.co')).toBe(true);
  });

  it('should return false for invalid emails', () => {
    expect(isEmail('')).toBe(false);
    expect(isEmail('notanemail')).toBe(false);
    expect(isEmail('@domain.com')).toBe(false);
    expect(isEmail('user@')).toBe(false);
  });
});

describe('hasControlChars', () => {
  it('should detect control characters', () => {
    expect(hasControlChars('hello\x00world')).toBe(true);
    expect(hasControlChars('test\x08back')).toBe(true);
    expect(hasControlChars('line\x0Bbreak')).toBe(true);
  });

  it('should return false for normal strings', () => {
    expect(hasControlChars('hello world')).toBe(false);
    expect(hasControlChars('normal text')).toBe(false);
  });
});

describe('validateField', () => {
  it('should return null when all rules pass', () => {
    const result = validateField('hello', [
      { validator: isRequired, message: 'Required' },
    ]);
    expect(result).toBeNull();
  });

  it('should return first error message when a rule fails', () => {
    const result = validateField('', [
      { validator: isRequired, message: 'Required' },
      { validator: (v) => isWithinLength(v, 10), message: 'Too long' },
    ]);
    expect(result).toBe('Required');
  });
});

describe('requiredText', () => {
  it('should return null for valid text', () => {
    expect(requiredText('Hello', 100, 'Name')).toBeNull();
  });

  it('should return error for empty text', () => {
    expect(requiredText('', 100, 'Name')).toBe('Name es requerido');
  });

  it('should return error for text exceeding max', () => {
    expect(requiredText('a'.repeat(101), 100, 'Name')).toBe('Name no debe exceder 100 caracteres');
  });
});

describe('optionalText', () => {
  it('should return null for empty text', () => {
    expect(optionalText('', 100, 'Name')).toBeNull();
  });

  it('should return null for valid text', () => {
    expect(optionalText('Hello', 100, 'Name')).toBeNull();
  });

  it('should return error for text exceeding max', () => {
    expect(optionalText('a'.repeat(101), 100, 'Name')).toBe('Name no debe exceder 100 caracteres');
  });
});
