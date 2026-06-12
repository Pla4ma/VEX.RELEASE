import {
  isNonEmptyString,
  isPositiveInteger,
  isNonNegativeNumber,
  isValidEmail,
  isValidUUID,
  isPlainObject,
  isValidDate,
  isValidURL,
  isValidImageURL,
} from '../type-guards';

describe('type-guards', () => {
  describe('isNonEmptyString', () => {
    it('returns true for non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString('a')).toBe(true);
      expect(isNonEmptyString('  ')).toBe(true);
    });

    it('returns false for empty strings', () => {
      expect(isNonEmptyString('')).toBe(false);
    });

    it('returns false for non-strings', () => {
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString(42)).toBe(false);
      expect(isNonEmptyString({})).toBe(false);
      expect(isNonEmptyString([])).toBe(false);
    });
  });

  describe('isPositiveInteger', () => {
    it('returns true for positive integers', () => {
      expect(isPositiveInteger(1)).toBe(true);
      expect(isPositiveInteger(100)).toBe(true);
    });

    it('returns false for zero', () => {
      expect(isPositiveInteger(0)).toBe(false);
    });

    it('returns false for negative numbers', () => {
      expect(isPositiveInteger(-1)).toBe(false);
    });

    it('returns false for floats', () => {
      expect(isPositiveInteger(1.5)).toBe(false);
    });

    it('returns false for non-numbers', () => {
      expect(isPositiveInteger('1')).toBe(false);
      expect(isPositiveInteger(null)).toBe(false);
      expect(isPositiveInteger(NaN)).toBe(false);
    });
  });

  describe('isNonNegativeNumber', () => {
    it('returns true for zero and positive numbers', () => {
      expect(isNonNegativeNumber(0)).toBe(true);
      expect(isNonNegativeNumber(42)).toBe(true);
      expect(isNonNegativeNumber(3.14)).toBe(true);
    });

    it('returns false for negative numbers', () => {
      expect(isNonNegativeNumber(-1)).toBe(false);
    });

    it('returns false for NaN', () => {
      expect(isNonNegativeNumber(NaN)).toBe(false);
    });

    it('returns false for non-numbers', () => {
      expect(isNonNegativeNumber('0')).toBe(false);
      expect(isNonNegativeNumber(null)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.email@domain.org')).toBe(true);
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('returns false for non-strings', () => {
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(42)).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    it('returns true for valid UUIDs', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
    });

    it('returns false for invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false);
      expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });

    it('wrong version (0) returns false', () => {
      expect(isValidUUID('550e8400-e29b-01d4-a716-446655440000')).toBe(false);
    });

    it('wrong variant returns false', () => {
      expect(isValidUUID('550e8400-e29b-41d4-0716-446655440000')).toBe(false);
    });
  });

  describe('isPlainObject', () => {
    it('returns true for plain objects', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ key: 'value' })).toBe(true);
    });

    it('returns false for arrays', () => {
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject([1, 2, 3])).toBe(false);
    });

    it('returns false for null and primitives', () => {
      expect(isPlainObject(null)).toBe(false);
      expect(isPlainObject(undefined)).toBe(false);
      expect(isPlainObject(42)).toBe(false);
      expect(isPlainObject('string')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('returns true for valid dates', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date('2024-01-01'))).toBe(true);
    });

    it('returns false for invalid dates', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
    });

    it('returns false for non-dates', () => {
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate('2024-01-01')).toBe(false);
      expect(isValidDate(1704067200000)).toBe(false);
    });
  });

  describe('isValidURL', () => {
    it('returns true for valid URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('http://localhost:3000')).toBe(true);
      expect(isValidURL('https://example.com/path?query=1')).toBe(true);
    });

    it('returns false for invalid URLs', () => {
      expect(isValidURL('not a url')).toBe(false);
      expect(isValidURL('example.com')).toBe(false);
      expect(isValidURL('')).toBe(false);
    });

    it('returns false for non-strings', () => {
      expect(isValidURL(null)).toBe(false);
      expect(isValidURL(42)).toBe(false);
    });
  });

  describe('isValidImageURL', () => {
    it('returns true for image URLs', () => {
      expect(isValidImageURL('https://example.com/image.jpg')).toBe(true);
      expect(isValidImageURL('https://example.com/image.png')).toBe(true);
      expect(isValidImageURL('https://example.com/image.webp')).toBe(true);
      expect(isValidImageURL('https://example.com/image.svg')).toBe(true);
      expect(isValidImageURL('https://example.com/image.gif')).toBe(true);
    });

    it('returns false for non-image URLs', () => {
      expect(isValidImageURL('https://example.com/page')).toBe(false);
      expect(isValidImageURL('https://example.com/file.pdf')).toBe(false);
    });

    it('returns false for invalid URLs', () => {
      expect(isValidImageURL('not-a-url')).toBe(false);
    });
  });
});
