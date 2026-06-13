import { sanitizeErrorMessage } from '../error-sanitizer';

describe('sanitizeErrorMessage', () => {
  describe('with Error instances', () => {
    it('sanitizes relation names from error messages', () => {
      const error = new Error('relation "users" does not exist');
      expect(sanitizeErrorMessage(error)).toBe('[redacted] does not exist');
    });

    it('sanitizes table names from error messages', () => {
      const error = new Error('table "sessions" not found');
      expect(sanitizeErrorMessage(error)).toBe('[redacted] not found');
    });

    it('sanitizes constraint names from error messages', () => {
      const error = new Error('constraint "fk_user_id" violates unique');
      expect(sanitizeErrorMessage(error)).toBe('[redacted] violates unique');
    });

    it('sanitizes column names from error messages', () => {
      const error = new Error('column "secret_field" of relation "profiles"');
      expect(sanitizeErrorMessage(error)).toBe('[redacted] of [redacted]');
    });

    it('sanitizes schema names from error messages', () => {
      const error = new Error('schema "private" not found');
      expect(sanitizeErrorMessage(error)).toBe('[redacted] not found');
    });

    it('sanitizes duplicate key violations', () => {
      const error = new Error('duplicate key value violates unique constraint');
      // Pattern matches "duplicate key value violates" but not "unique constraint"
      expect(sanitizeErrorMessage(error)).toBe('[redacted] unique constraint');
    });

    it('sanitizes PostgREST error codes', () => {
      const error = new Error('PGRST123: something went wrong');
      expect(sanitizeErrorMessage(error)).toBe('[redacted]: something went wrong');
    });

    it('sanitizes JWT tokens from error messages', () => {
      const error = new Error(
        'Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U expired',
      );
      const result = sanitizeErrorMessage(error);
      expect(result).not.toContain('eyJ');
      expect(result).toContain('[redacted]');
    });

    it('sanitizes Bearer tokens from error messages', () => {
      const error = new Error(
        'Authorization: Bearer abcdefghijklmnopqrstuvwxyz1234567890',
      );
      const result = sanitizeErrorMessage(error);
      expect(result).toContain('[redacted]');
      expect(result).not.toContain('abcdefghijklmnopqrstuvwxyz');
    });
  });

  describe('with string errors', () => {
    it('sanitizes raw string error messages', () => {
      const error = 'relation "accounts" already exists';
      expect(sanitizeErrorMessage(error)).toBe('[redacted] already exists');
    });
  });

  describe('with non-string non-error types', () => {
    it('returns default message for null', () => {
      expect(sanitizeErrorMessage(null)).toBe(
        'An unexpected error occurred. Please try again.',
      );
    });

    it('returns default message for undefined', () => {
      expect(sanitizeErrorMessage(undefined)).toBe(
        'An unexpected error occurred. Please try again.',
      );
    });

    it('returns default message for number', () => {
      expect(sanitizeErrorMessage(42)).toBe(
        'An unexpected error occurred. Please try again.',
      );
    });

    it('returns default message for object', () => {
      expect(sanitizeErrorMessage({ code: 500 })).toBe(
        'An unexpected error occurred. Please try again.',
      );
    });
  });

  describe('message truncation', () => {
    it('truncates messages longer than 300 characters', () => {
      const longMessage = 'a'.repeat(500);
      const error = new Error(longMessage);
      const result = sanitizeErrorMessage(error);
      expect(result.length).toBe(300);
    });

    it('does not truncate messages under 300 characters', () => {
      const shortMessage = 'short error';
      const error = new Error(shortMessage);
      expect(sanitizeErrorMessage(error)).toBe(shortMessage);
    });
  });

  describe('multiple patterns in single message', () => {
    it('redacts all matching patterns', () => {
      const error = new Error(
        'relation "users" constraint "pk_users" duplicate key value violates',
      );
      const result = sanitizeErrorMessage(error);
      expect(result).toBe('[redacted] [redacted] [redacted]');
    });
  });

  describe('safe fallback', () => {
    it('returns default for empty string error', () => {
      const error = new Error('');
      expect(sanitizeErrorMessage(error)).toBe(
        'An unexpected error occurred. Please try again.',
      );
    });

    it('fully redacts PostgREST codes from messages', () => {
      const error = new Error('PGRST204 content-type not supported');
      expect(sanitizeErrorMessage(error)).toBe('[redacted] content-type not supported');
    });
  });
});
