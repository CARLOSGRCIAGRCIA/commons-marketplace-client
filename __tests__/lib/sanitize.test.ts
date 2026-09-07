import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  sanitizeNumericField,
  sanitizeFormData,
  validateNumericField,
} from '@/lib/sanitize';

describe('sanitizeString', () => {
  it('should remove control characters', () => {
    expect(sanitizeString('hello\x00world')).toBe('helloworld');
    expect(sanitizeString('test\x08back')).toBe('testback');
  });

  it('should collapse multiple spaces', () => {
    expect(sanitizeString('hello   world')).toBe('hello world');
    expect(sanitizeString('  multiple   spaces  ')).toBe('multiple spaces');
  });

  it('should trim whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('should handle normal strings', () => {
    expect(sanitizeString('normal text')).toBe('normal text');
  });
});

describe('sanitizeNumericField', () => {
  it('should trim whitespace', () => {
    expect(sanitizeNumericField('  123  ')).toBe('123');
  });

  it('should leave non-whitespace strings unchanged', () => {
    expect(sanitizeNumericField('123')).toBe('123');
  });
});

describe('sanitizeFormData', () => {
  it('should sanitize string values', () => {
    const fd = new FormData();
    fd.append('name', '  hello   world  ');
    fd.append('description', 'test\x00value');

    const clean = sanitizeFormData(fd);
    expect(clean.get('name')).toBe('hello world');
    expect(clean.get('description')).toBe('testvalue');
  });

  it('should leave File objects intact', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fd = new FormData();
    fd.append('file', file);
    fd.append('name', '  test  ');

    const clean = sanitizeFormData(fd);
    expect(clean.get('name')).toBe('test');
    expect(clean.get('file')).toBe(file);
  });
});

describe('validateNumericField', () => {
  it('should return number for valid input', () => {
    expect(validateNumericField('123')).toBe(123);
    expect(validateNumericField('12.5')).toBe(12.5);
  });

  it('should return null for empty string', () => {
    expect(validateNumericField('')).toBeNull();
    expect(validateNumericField('  ')).toBeNull();
  });

  it('should return null for non-numeric strings', () => {
    expect(validateNumericField('abc')).toBeNull();
  });

  it('should respect integer option', () => {
    expect(validateNumericField('12', { integer: true })).toBe(12);
    expect(validateNumericField('12.5', { integer: true })).toBeNull();
  });

  it('should respect min option', () => {
    expect(validateNumericField('5', { min: 10 })).toBeNull();
    expect(validateNumericField('15', { min: 10 })).toBe(15);
  });

  it('should respect max option', () => {
    expect(validateNumericField('15', { max: 10 })).toBeNull();
    expect(validateNumericField('5', { max: 10 })).toBe(5);
  });
});
