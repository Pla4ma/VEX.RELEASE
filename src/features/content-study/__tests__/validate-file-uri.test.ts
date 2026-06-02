/**
 * Content-Study Tests: URI Scheme Validation (SEC-002)
 */
import { describe, it, expect } from '@jest/globals';

import { validateFileUri } from '../repository';

// ============================================================================
// validateFileUri
// ============================================================================
describe('validateFileUri (SEC-002)', () => {
  // --- Allowed schemes ---
  it('accepts file:// URIs', () => {
    expect(() => validateFileUri('file:///path/to/document.pdf')).not.toThrow();
  });

  it('accepts content:// URIs (Android content provider)', () => {
    expect(() =>
      validateFileUri('content://com.example.provider/document/1'),
    ).not.toThrow();
  });

  it('accepts https:// URIs', () => {
    expect(() =>
      validateFileUri('https://example.com/files/document.pdf'),
    ).not.toThrow();
  });

  // --- Blocked schemes ---
  it('rejects http:// URIs', () => {
    expect(() => validateFileUri('http://example.com/doc.pdf')).toThrow(
      /Invalid file URI scheme/,
    );
  });

  it('rejects javascript: URIs', () => {
    expect(() => validateFileUri('javascript:alert(1)')).toThrow(
      /Invalid file URI scheme/,
    );
  });

  it('rejects data: URIs', () => {
    expect(() =>
      validateFileUri('data:text/plain;base64,SGVsbG8='),
    ).toThrow(/Invalid file URI scheme/);
  });

  it('rejects ftp:// URIs', () => {
    expect(() => validateFileUri('ftp://files.example.com/doc.pdf')).toThrow(
      /Invalid file URI scheme/,
    );
  });

  it('rejects empty strings', () => {
    expect(() => validateFileUri('')).toThrow(/Invalid file URI scheme/);
  });

  it('rejects relative paths without scheme', () => {
    expect(() => validateFileUri('path/to/file.pdf')).toThrow(
      /Invalid file URI scheme/,
    );
  });

  // --- Error message details ---
  it('includes the received scheme in the error message', () => {
    try {
      validateFileUri('ftp://host/path');
      expect(true).toBe(false); // should not reach here
    } catch (error) {
      expect((error as Error).message).toContain('ftp://');
      expect((error as Error).message).toContain(
        'file://, content://, https://',
      );
    }
  });

  it('reports unknown scheme for strings without a colon', () => {
    try {
      validateFileUri('noscheme');
      expect(true).toBe(false);
    } catch (error) {
      expect((error as Error).message).toContain('Invalid file URI scheme');
    }
  });
});
