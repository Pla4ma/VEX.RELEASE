import { describe, expect, it } from '@jest/globals';
import {
  calculateBackoff,
  isRetryableError,
  isRetryableErrorCode,
  isApiError,
  createApiError,
} from '../retry';
import type { ApiError } from '../client-types';

describe('calculateBackoff', () => {
  it('returns baseDelay for attempt 0', () => {
    const result = calculateBackoff(0, 1000);
    expect(result).toBeGreaterThanOrEqual(1000);
    expect(result).toBeLessThanOrEqual(2000);
  });

  it('increases exponentially', () => {
    const result0 = calculateBackoff(0, 1000);
    const result2 = calculateBackoff(2, 1000);
    expect(result2).toBeGreaterThan(result0);
  });

  it('caps at 30000ms', () => {
    const result = calculateBackoff(10, 5000);
    expect(result).toBeLessThanOrEqual(30000);
  });
});

describe('isRetryableError', () => {
  it('returns true for NETWORK_ERROR', () => {
    expect(isRetryableError({ code: 'NETWORK_ERROR', message: 'fail', status: 0, retryable: true })).toBe(true);
  });

  it('returns true for TIMEOUT', () => {
    expect(isRetryableError({ code: 'TIMEOUT', message: 'timeout', status: 408, retryable: true })).toBe(true);
  });

  it('returns true for RATE_LIMIT', () => {
    expect(isRetryableError({ code: 'RATE_LIMIT', message: 'rate', status: 429, retryable: true })).toBe(true);
  });

  it('returns true for SERVER_ERROR', () => {
    expect(isRetryableError({ code: 'SERVER_ERROR', message: 'server', status: 500, retryable: true })).toBe(true);
  });

  it('returns false when retryable is false', () => {
    expect(isRetryableError({ code: 'NETWORK_ERROR', message: 'fail', status: 0, retryable: false })).toBe(false);
  });

  it('returns false for AUTH_ERROR', () => {
    expect(isRetryableError({ code: 'AUTH_ERROR', message: 'auth', status: 401, retryable: true })).toBe(false);
  });
});

describe('isRetryableErrorCode', () => {
  it('returns true for known retryable codes', () => {
    expect(isRetryableErrorCode('NETWORK_ERROR')).toBe(true);
    expect(isRetryableErrorCode('TIMEOUT')).toBe(true);
    expect(isRetryableErrorCode('RATE_LIMIT')).toBe(true);
    expect(isRetryableErrorCode('SERVER_ERROR')).toBe(true);
  });

  it('returns false for non-retryable codes', () => {
    expect(isRetryableErrorCode('AUTH_ERROR')).toBe(false);
    expect(isRetryableErrorCode('NOT_FOUND')).toBe(false);
    expect(isRetryableErrorCode('UNKNOWN')).toBe(false);
  });
});

describe('isApiError', () => {
  it('returns true for valid ApiError', () => {
    expect(isApiError({ code: 'NETWORK_ERROR', retryable: true })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isApiError(null)).toBe(false);
  });

  it('returns false for plain Error', () => {
    expect(isApiError(new Error('test'))).toBe(false);
  });

  it('returns false for object missing code', () => {
    expect(isApiError({ retryable: true })).toBe(false);
  });

  it('returns false for object missing retryable', () => {
    expect(isApiError({ code: 'NETWORK_ERROR' })).toBe(false);
  });
});

describe('createApiError', () => {
  it('creates error with required fields', () => {
    const error = createApiError('NETWORK_ERROR', 'Connection failed', 0);
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toBe('Connection failed');
    expect(error.status).toBe(0);
    expect(error.retryable).toBe(false);
  });

  it('creates error with retryable=true', () => {
    const error = createApiError('TIMEOUT', 'Request timed out', 408, undefined, true);
    expect(error.retryable).toBe(true);
  });

  it('creates error with details', () => {
    const error = createApiError('RATE_LIMIT', 'Too many requests', 429, { retryAfter: 30 }, true);
    expect(error.details).toEqual({ retryAfter: 30 });
  });
});
