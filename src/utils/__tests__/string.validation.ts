import { describe, it, expect } from '@jest/globals';
import {
  formatNumber,
  formatFileSize,
  maskString,
  getInitials,
  isValidEmail,
  isValidPhone,
} from '../string';

describe('formatNumber', () => {
  it('formats thousands with commas', () => {
    expect(formatNumber(1000)).toBe('1,000');
  });
  it('formats millions', () => {
    expect(formatNumber(1000000)).toBe('1,000,000');
  });
  it('returns single digits unchanged', () => {
    expect(formatNumber(5)).toBe('5');
  });
  it('handles three-digit numbers without commas', () => {
    expect(formatNumber(999)).toBe('999');
  });
});

describe('formatFileSize', () => {
  it('formats 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });
  it('formats bytes under 1 KB as bytes', () => {
    expect(formatFileSize(512)).toBe('512 B');
  });
  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });
  it('formats megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
  });
  it('formats gigabytes', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });
});

describe('maskString', () => {
  it('masks all but the last N characters', () => {
    expect(maskString('1234567890', 4)).toBe('******7890');
  });
  it('returns string unchanged when shorter than visible', () => {
    expect(maskString('1234', 4)).toBe('1234');
  });
  it('uses custom mask character', () => {
    expect(maskString('abcdefgh', 3, '#')).toBe('#####fgh');
  });
  it('defaults to 4 visible characters', () => {
    const result = maskString('12345678');
    expect(result).toBe('****5678');
  });
});

describe('getInitials', () => {
  it('returns initials for two-word name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });
  it('returns single initial for single name', () => {
    expect(getInitials('John')).toBe('J');
  });
  it('returns empty string for empty input', () => {
    expect(getInitials('')).toBe('');
  });
  it('limits to 2 characters', () => {
    expect(getInitials('John Michael Doe').length).toBeLessThanOrEqual(2);
  });
  it('uppercases the initials', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

describe('isValidEmail', () => {
  it('returns true for valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });
  it('returns false for missing @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });
  it('returns false for missing domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });
  it('returns false for empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
  it('handles subdomains', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true);
  });
});

describe('isValidPhone', () => {
  it('returns true for a valid 10-digit number', () => {
    expect(isValidPhone('1234567890')).toBe(true);
  });
  it('returns true for international format', () => {
    expect(isValidPhone('+1 555-123-4567')).toBe(true);
  });
  it('returns false for too short number', () => {
    expect(isValidPhone('123456')).toBe(false);
  });
  it('returns false for empty string', () => {
    expect(isValidPhone('')).toBe(false);
  });
});
