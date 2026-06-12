import {
  clamp,
  clamp01,
  sanitizeString,
  truncateString,
  formatNumber,
  parseNumber,
} from '../format-utils';

describe('format-utils', () => {
  describe('clamp', () => {
    it('returns value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('returns min when value is below range', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('returns max when value is above range', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('handles equal min and max', () => {
      expect(clamp(5, 3, 3)).toBe(3);
    });

    it('handles negative ranges', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(0, -10, -1)).toBe(-1);
    });
  });

  describe('clamp01', () => {
    it('returns value when between 0 and 1', () => {
      expect(clamp01(0.5)).toBe(0.5);
    });

    it('returns 0 for negative values', () => {
      expect(clamp01(-0.5)).toBe(0);
    });

    it('returns 1 for values above 1', () => {
      expect(clamp01(1.5)).toBe(1);
    });

    it('handles exact boundaries', () => {
      expect(clamp01(0)).toBe(0);
      expect(clamp01(1)).toBe(1);
    });
  });

  describe('sanitizeString', () => {
    it('trims whitespace by default', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('converts to lowercase when requested', () => {
      expect(sanitizeString('HELLO', { lowercase: true })).toBe('hello');
    });

    it('removes special characters when requested', () => {
      expect(sanitizeString('hello!@#world', { removeSpecialChars: true })).toBe('helloworld');
    });

    it('truncates to maxLength', () => {
      expect(sanitizeString('hello world', { maxLength: 5 })).toBe('hello');
    });

    it('applies all options together', () => {
      expect(
        sanitizeString('  HELLO! WORLD  ', {
          trim: true,
          lowercase: true,
          removeSpecialChars: true,
          maxLength: 10,
        }),
      ).toBe('hello worl');
    });

    it('preserves spaces when not removing special chars', () => {
      expect(sanitizeString('hello world')).toBe('hello world');
    });

    it('handles empty string', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('truncateString', () => {
    it('returns original string when within maxLength', () => {
      expect(truncateString('hello', 10)).toBe('hello');
    });

    it('truncates and adds suffix when exceeding maxLength', () => {
      expect(truncateString('hello world', 8)).toBe('hello...');
    });

    it('uses custom suffix', () => {
      expect(truncateString('hello world', 8, '…')).toBe('hello w…');
    });

    it('returns original when length equals maxLength', () => {
      expect(truncateString('hello', 5)).toBe('hello');
    });

    it('handles suffix longer than maxLength', () => {
      const result = truncateString('hello world', 3, '...');
      expect(result).toBe('...');
    });
  });

  describe('formatNumber', () => {
    it('formats with default options', () => {
      expect(formatNumber(1234)).toBe('1,234');
    });

    it('formats with decimals', () => {
      expect(formatNumber(1234.56, { decimals: 2 })).toBe('1,234.56');
    });

    it('formats compact notation for large numbers', () => {
      expect(formatNumber(1500, { compact: true })).toBe('1.5K');
    });

    it('formats compact with decimals', () => {
      expect(formatNumber(1500, { compact: true, decimals: 1 })).toBe('1.5K');
    });

    it('handles zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('handles negative numbers', () => {
      expect(formatNumber(-1234)).toBe('-1,234');
    });
  });

  describe('parseNumber', () => {
    it('returns number as-is', () => {
      expect(parseNumber(42)).toBe(42);
    });

    it('parses numeric string', () => {
      expect(parseNumber('42')).toBe(42);
    });

    it('parses decimal string', () => {
      expect(parseNumber('3.14')).toBeCloseTo(3.14);
    });

    it('returns null for non-numeric string', () => {
      expect(parseNumber('hello')).toBeNull();
    });

    it('returns null for null/undefined', () => {
      expect(parseNumber(null)).toBeNull();
      expect(parseNumber(undefined)).toBeNull();
    });

    it('returns null for NaN string', () => {
      expect(parseNumber('abc')).toBeNull();
    });
  });
});
