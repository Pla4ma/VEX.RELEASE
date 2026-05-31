/**
 * Content-Study Tests: API Schemas & Service
 */
import { describe, it, expect, jest } from '@jest/globals';

import {
  normalizeError,
  ContentStudyTimeoutFallbackSchema,
} from '../api-schemas';
import { ContentStudyErrorCode } from '../types';
import { buildContentStudyTimeoutFallback } from '../service';

// ─── Mocks (required by service) ───────────────────────────────────────────
jest.mock('../repository', () => ({
  invokeContentStudy: jest.fn(),
  uploadStudyFileRecord: jest.fn(),
  deleteStudyFileRecord: jest.fn(),
  fetchContentHistoryRecords: jest.fn(),
  fetchContentRecord: jest.fn(),
  fetchGenerationRecord: jest.fn(),
  updateContentTextRecord: jest.fn(),
  deleteContentRecord: jest.fn(),
}));

jest.mock('../../../utils/supabase-resilience', () => ({
  withResilience: (promise: Promise<unknown>) => promise,
}));

jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: jest.fn(),
}));

jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }),
}));

// ============================================================================
// normalizeError
// ============================================================================
describe('normalizeError', () => {
  it('wraps an Error instance', () => {
    const err = new Error('test error');
    const result = normalizeError(err, ContentStudyErrorCode.NETWORK_ERROR, 'fallback');
    expect(result.code).toBe(ContentStudyErrorCode.NETWORK_ERROR);
    expect(result.message).toBe('test error');
    expect(result.recoverable).toBe(true);
  });

  it('handles non-Error value', () => {
    const result = normalizeError('string error', ContentStudyErrorCode.INVALID_INPUT, 'fallback msg');
    expect(result.code).toBe(ContentStudyErrorCode.INVALID_INPUT);
    expect(result.message).toBe('fallback msg');
    expect(result.recoverable).toBe(true);
  });

  it('handles null/undefined', () => {
    const result = normalizeError(null, ContentStudyErrorCode.UNKNOWN_ERROR, 'unknown');
    expect(result.message).toBe('unknown');
  });
});

// ============================================================================
// ContentStudyTimeoutFallbackSchema
// ============================================================================
describe('ContentStudyTimeoutFallbackSchema', () => {
  it('accepts valid fallback object', () => {
    const result = ContentStudyTimeoutFallbackSchema.safeParse({
      body: 'Start studying now',
      ctaLabel: 'Start',
      title: 'Content warming up',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty body', () => {
    const result = ContentStudyTimeoutFallbackSchema.safeParse({
      body: '',
      ctaLabel: 'Start',
      title: 'Title',
    });
    expect(result.success).toBe(false);
  });

  it('rejects extra fields (strict mode)', () => {
    const result = ContentStudyTimeoutFallbackSchema.safeParse({
      body: 'body',
      ctaLabel: 'cta',
      title: 'title',
      extra: 'not allowed',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// buildContentStudyTimeoutFallback
// ============================================================================
describe('buildContentStudyTimeoutFallback', () => {
  it('returns a valid fallback object', () => {
    const fallback = buildContentStudyTimeoutFallback();
    expect(fallback.body).toBeTruthy();
    expect(fallback.ctaLabel).toBeTruthy();
    expect(fallback.title).toBeTruthy();
    // Should parse without error
    expect(ContentStudyTimeoutFallbackSchema.safeParse(fallback).success).toBe(true);
  });
});
