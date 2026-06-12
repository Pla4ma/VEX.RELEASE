import { describe, expect, it } from '@jest/globals';
import {
  RepositoryError,
  RepositoryErrorCode,
  classifyError,
} from '../error-handling';

describe('RepositoryErrorCode', () => {
  it('has all expected error codes', () => {
    expect(RepositoryErrorCode.NETWORK_ERROR).toBe('NETWORK_ERROR');
    expect(RepositoryErrorCode.AUTH_ERROR).toBe('AUTH_ERROR');
    expect(RepositoryErrorCode.NOT_FOUND).toBe('NOT_FOUND');
    expect(RepositoryErrorCode.CONFLICT).toBe('CONFLICT');
    expect(RepositoryErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(RepositoryErrorCode.RATE_LIMIT).toBe('RATE_LIMIT');
    expect(RepositoryErrorCode.SERVER_ERROR).toBe('SERVER_ERROR');
    expect(RepositoryErrorCode.UNKNOWN).toBe('UNKNOWN');
  });
});

describe('RepositoryError', () => {
  it('wraps an Error with operation prefix', () => {
    const err = new RepositoryError('fetchSessions', new Error('timeout'));
    expect(err.message).toBe('[fetchSessions] timeout');
    expect(err.name).toBe('RepositoryError');
  });

  it('wraps an object with message property', () => {
    const err = new RepositoryError('save', { message: 'conflict' });
    expect(err.message).toBe('[save] conflict');
  });

  it('handles plain string error', () => {
    const err = new RepositoryError('op', 'something failed');
    expect(err.message).toBe('[op] Unknown error');
  });

  it('handles null error', () => {
    const err = new RepositoryError('op', null);
    expect(err.message).toBe('[op] Unknown error');
  });

  it('handles undefined error', () => {
    const err = new RepositoryError('op', undefined);
    expect(err.message).toBe('[op] Unknown error');
  });

  it('defaults to UNKNOWN code', () => {
    const err = new RepositoryError('op', new Error('x'));
    expect(err.code).toBe(RepositoryErrorCode.UNKNOWN);
  });

  it('accepts explicit error code', () => {
    const err = new RepositoryError('op', new Error('x'), RepositoryErrorCode.CONFLICT);
    expect(err.code).toBe(RepositoryErrorCode.CONFLICT);
  });

  it('preserves original error', () => {
    const original = new Error('root cause');
    const err = new RepositoryError('op', original);
    expect(err.originalError).toBe(original);
  });

  it('marks NETWORK_ERROR as retryable', () => {
    const err = new RepositoryError('op', new Error('x'), RepositoryErrorCode.NETWORK_ERROR);
    expect(err.isRetryable).toBe(true);
  });

  it('marks RATE_LIMIT as retryable', () => {
    const err = new RepositoryError('op', new Error('x'), RepositoryErrorCode.RATE_LIMIT);
    expect(err.isRetryable).toBe(true);
  });

  it('marks SERVER_ERROR as retryable', () => {
    const err = new RepositoryError('op', new Error('x'), RepositoryErrorCode.SERVER_ERROR);
    expect(err.isRetryable).toBe(true);
  });

  it('marks CONFLICT as not retryable', () => {
    const err = new RepositoryError('op', new Error('x'), RepositoryErrorCode.CONFLICT);
    expect(err.isRetryable).toBe(false);
  });

  it('marks NOT_FOUND as not retryable', () => {
    const err = new RepositoryError('op', new Error('x'), RepositoryErrorCode.NOT_FOUND);
    expect(err.isRetryable).toBe(false);
  });

  it('marks UNKNOWN as not retryable', () => {
    const err = new RepositoryError('op', new Error('x'));
    expect(err.isRetryable).toBe(false);
  });
});

describe('classifyError', () => {
  it('classifies PGRST116 as NOT_FOUND', () => {
    expect(classifyError({ code: 'PGRST116' })).toBe(RepositoryErrorCode.NOT_FOUND);
  });

  it('classifies 23505 as CONFLICT', () => {
    expect(classifyError({ code: '23505' })).toBe(RepositoryErrorCode.CONFLICT);
  });

  it('classifies PGRST301 as AUTH_ERROR', () => {
    expect(classifyError({ code: 'PGRST301' })).toBe(RepositoryErrorCode.AUTH_ERROR);
  });

  it('classifies 22xxx codes as VALIDATION_ERROR', () => {
    expect(classifyError({ code: '22001' })).toBe(RepositoryErrorCode.VALIDATION_ERROR);
    expect(classifyError({ code: '22P02' })).toBe(RepositoryErrorCode.VALIDATION_ERROR);
  });

  it('classifies 28xxx codes as AUTH_ERROR', () => {
    expect(classifyError({ code: '28000' })).toBe(RepositoryErrorCode.AUTH_ERROR);
    expect(classifyError({ code: '28P01' })).toBe(RepositoryErrorCode.AUTH_ERROR);
  });

  it('classifies 42xxx codes as VALIDATION_ERROR', () => {
    expect(classifyError({ code: '42501' })).toBe(RepositoryErrorCode.VALIDATION_ERROR);
    expect(classifyError({ code: '42P01' })).toBe(RepositoryErrorCode.VALIDATION_ERROR);
  });

  it('classifies status 401 as AUTH_ERROR', () => {
    expect(classifyError({ status: 401 })).toBe(RepositoryErrorCode.AUTH_ERROR);
  });

  it('classifies status 403 as AUTH_ERROR', () => {
    expect(classifyError({ status: 403 })).toBe(RepositoryErrorCode.AUTH_ERROR);
  });

  it('classifies status 404 as NOT_FOUND', () => {
    expect(classifyError({ status: 404 })).toBe(RepositoryErrorCode.NOT_FOUND);
  });

  it('classifies status 409 as CONFLICT', () => {
    expect(classifyError({ status: 409 })).toBe(RepositoryErrorCode.CONFLICT);
  });

  it('classifies status 422 as VALIDATION_ERROR', () => {
    expect(classifyError({ status: 422 })).toBe(RepositoryErrorCode.VALIDATION_ERROR);
  });

  it('classifies status 429 as RATE_LIMIT', () => {
    expect(classifyError({ status: 429 })).toBe(RepositoryErrorCode.RATE_LIMIT);
  });

  it('classifies status 500 as SERVER_ERROR', () => {
    expect(classifyError({ status: 500 })).toBe(RepositoryErrorCode.SERVER_ERROR);
  });

  it('classifies status 503 as SERVER_ERROR', () => {
    expect(classifyError({ status: 503 })).toBe(RepositoryErrorCode.SERVER_ERROR);
  });

  it('classifies network-related messages as NETWORK_ERROR', () => {
    expect(classifyError({ message: 'fetch failed' })).toBe(RepositoryErrorCode.NETWORK_ERROR);
    expect(classifyError({ message: 'network timeout' })).toBe(RepositoryErrorCode.NETWORK_ERROR);
    expect(classifyError({ message: 'ECONNREFUSED' })).toBe(RepositoryErrorCode.NETWORK_ERROR);
    expect(classifyError({ message: 'ETIMEDOUT' })).toBe(RepositoryErrorCode.NETWORK_ERROR);
  });

  it('returns UNKNOWN for unrecognized errors', () => {
    expect(classifyError({ code: '99999' })).toBe(RepositoryErrorCode.UNKNOWN);
    expect(classifyError({ status: 301 })).toBe(RepositoryErrorCode.UNKNOWN);
    expect(classifyError({ message: 'random error' })).toBe(RepositoryErrorCode.UNKNOWN);
  });

  it('returns UNKNOWN for null/undefined', () => {
    expect(classifyError(null)).toBe(RepositoryErrorCode.UNKNOWN);
    expect(classifyError(undefined)).toBe(RepositoryErrorCode.UNKNOWN);
  });

  it('returns UNKNOWN for non-object', () => {
    expect(classifyError('string error')).toBe(RepositoryErrorCode.UNKNOWN);
    expect(classifyError(42)).toBe(RepositoryErrorCode.UNKNOWN);
  });

  it('prefers code over status when both present', () => {
    expect(classifyError({ code: 'PGRST116', status: 500 })).toBe(RepositoryErrorCode.NOT_FOUND);
  });

  it('prefers code over message when both present', () => {
    expect(classifyError({ code: '23505', message: 'fetch failed' })).toBe(RepositoryErrorCode.CONFLICT);
  });
});
