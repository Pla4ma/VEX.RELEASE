import { calculateBackoff, isRetryableError, isRetryableErrorCode, createApiError } from '../retry';
import type { ApiError } from '../client-types';

describe('calculateBackoff', () => {
  it('returns base delay for attempt 0', () => {
    const backoff = calculateBackoff(0, 1000);
    expect(backoff).toBeGreaterThanOrEqual(1000);
    expect(backoff).toBeLessThanOrEqual(2000); // 1000 + jitter (max ~1000)
  });

  it('increases exponentially with attempt', () => {
    const backoff0 = calculateBackoff(0, 1000);
    const backoff1 = calculateBackoff(1, 1000);
    expect(backoff1).toBeGreaterThan(backoff0);
  });

  it('caps at 30000ms', () => {
    const backoff = calculateBackoff(10, 1000);
    expect(backoff).toBeLessThanOrEqual(30000);
  });

  it('includes jitter', () => {
    const results = new Set<number>();
    for (let i = 0; i < 20; i++) {
      results.add(calculateBackoff(1, 1000));
    }
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('isRetryableError', () => {
  function makeError(code: string, retryable: boolean): ApiError {
    return createApiError(code, 'test', 500, undefined, retryable);
  }

  it('returns true for retryable NETWORK_ERROR', () => {
    expect(isRetryableError(makeError('NETWORK_ERROR', true))).toBe(true);
  });

  it('returns true for retryable TIMEOUT', () => {
    expect(isRetryableError(makeError('TIMEOUT', true))).toBe(true);
  });

  it('returns true for retryable RATE_LIMIT', () => {
    expect(isRetryableError(makeError('RATE_LIMIT', true))).toBe(true);
  });

  it('returns true for retryable SERVER_ERROR', () => {
    expect(isRetryableError(makeError('SERVER_ERROR', true))).toBe(true);
  });

  it('returns false when retryable is false', () => {
    expect(isRetryableError(makeError('NETWORK_ERROR', false))).toBe(false);
  });

  it('returns false for non-retryable codes', () => {
    expect(isRetryableError(makeError('AUTH_ERROR', true))).toBe(false);
    expect(isRetryableError(makeError('VALIDATION_ERROR', true))).toBe(false);
  });
});

describe('isRetryableErrorCode', () => {
  it('returns true for retryable codes', () => {
    expect(isRetryableErrorCode('NETWORK_ERROR')).toBe(true);
    expect(isRetryableErrorCode('TIMEOUT')).toBe(true);
    expect(isRetryableErrorCode('RATE_LIMIT')).toBe(true);
    expect(isRetryableErrorCode('SERVER_ERROR')).toBe(true);
  });

  it('returns false for non-retryable codes', () => {
    expect(isRetryableErrorCode('AUTH_ERROR')).toBe(false);
    expect(isRetryableErrorCode('NOT_FOUND')).toBe(false);
    expect(isRetryableErrorCode('VALIDATION_ERROR')).toBe(false);
  });
});

describe('createApiError', () => {
  it('creates error with required fields', () => {
    const error = createApiError('NETWORK_ERROR', 'Network failed', 503);
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toBe('Network failed');
    expect(error.status).toBe(503);
    expect(error.retryable).toBe(false);
  });

  it('creates retryable error', () => {
    const error = createApiError('TIMEOUT', 'Timed out', 408, undefined, true);
    expect(error.retryable).toBe(true);
  });

  it('includes details when provided', () => {
    const details = { userId: '123' };
    const error = createApiError('SERVER_ERROR', 'Server error', 500, details);
    expect(error.details).toEqual(details);
  });
});
