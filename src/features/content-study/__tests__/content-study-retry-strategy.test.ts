/**
 * Content-Study Tests: Retry Strategy
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import {
  DefaultRetryStrategy,
  ExponentialBackoffStrategy,
  executeWithRetry,
} from '../retry-strategy';
import {
  buildError,
} from '../validation';
import { CONTENT_STUDY_CONSTANTS, ContentStudyErrorCode } from '../types';

// ============================================================================
// DefaultRetryStrategy
// ============================================================================
describe('DefaultRetryStrategy', () => {
  it('has correct maxAttempts from constants', () => {
    expect(DefaultRetryStrategy.maxAttempts).toBe(CONTENT_STUDY_CONSTANTS.MAX_RETRY_ATTEMPTS);
  });

  it('shouldRetry returns true for recoverable errors under limit', () => {
    const error = buildError(ContentStudyErrorCode.NETWORK_ERROR, 'err');
    expect(DefaultRetryStrategy.shouldRetry(error, 0)).toBe(true);
  });

  it('shouldRetry returns false at max attempts', () => {
    const error = buildError(ContentStudyErrorCode.NETWORK_ERROR, 'err');
    expect(DefaultRetryStrategy.shouldRetry(error, CONTENT_STUDY_CONSTANTS.MAX_RETRY_ATTEMPTS)).toBe(false);
  });

  it('shouldRetry returns false for non-recoverable error', () => {
    const error = buildError(ContentStudyErrorCode.INVALID_INPUT, 'err');
    expect(DefaultRetryStrategy.shouldRetry(error, 0)).toBe(false);
  });
});

// ============================================================================
// ExponentialBackoffStrategy
// ============================================================================
describe('ExponentialBackoffStrategy', () => {
  it('has maxAttempts of 5', () => {
    expect(ExponentialBackoffStrategy.maxAttempts).toBe(5);
  });

  it('shouldRetry only for NETWORK_ERROR and AI_RATE_LIMIT', () => {
    const networkErr = buildError(ContentStudyErrorCode.NETWORK_ERROR, 'err');
    const rateErr = buildError(ContentStudyErrorCode.AI_RATE_LIMIT, 'err');
    const otherErr = buildError(ContentStudyErrorCode.INVALID_INPUT, 'err');
    expect(ExponentialBackoffStrategy.shouldRetry(networkErr, 0)).toBe(true);
    expect(ExponentialBackoffStrategy.shouldRetry(rateErr, 0)).toBe(true);
    expect(ExponentialBackoffStrategy.shouldRetry(otherErr, 0)).toBe(false);
  });

  it('shouldRetry returns false at max attempts', () => {
    const err = buildError(ContentStudyErrorCode.NETWORK_ERROR, 'err');
    expect(ExponentialBackoffStrategy.shouldRetry(err, 5)).toBe(false);
  });
});

// ============================================================================
// executeWithRetry
// ============================================================================
describe('executeWithRetry', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('returns result on first success', async () => {
    const op = jest.fn<() => Promise<string>>().mockResolvedValue('ok');
    const result = await executeWithRetry(op as () => Promise<string>);
    expect(result).toBe('ok');
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('retries on recoverable error then succeeds', async () => {
    const op = jest.fn<() => Promise<string>>()
      .mockRejectedValueOnce(buildError(ContentStudyErrorCode.NETWORK_ERROR, 'fail'))
      .mockResolvedValue('ok');
    const result = await executeWithRetry(op as () => Promise<string>);
    expect(result).toBe('ok');
    expect(op).toHaveBeenCalledTimes(2);
  });

  it('throws on non-recoverable error immediately', async () => {
    const op = jest.fn<() => Promise<string>>()
      .mockRejectedValue(buildError(ContentStudyErrorCode.INVALID_INPUT, 'bad input'));
    await expect(executeWithRetry(op as () => Promise<string>)).rejects.toBeDefined();
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('throws after max retries exhausted', async () => {
    const op = jest.fn<() => Promise<string>>()
      .mockRejectedValue(buildError(ContentStudyErrorCode.NETWORK_ERROR, 'fail'));
    await expect(
      executeWithRetry(op as () => Promise<string>, {
        ...DefaultRetryStrategy,
        maxAttempts: 2,
        backoffMs: 1,
        maxBackoffMs: 10,
      }),
    ).rejects.toBeDefined();
    expect(op).toHaveBeenCalledTimes(2);
  });

  it('calls onRetry callback', async () => {
    const onRetry = jest.fn();
    const op = jest.fn<() => Promise<string>>()
      .mockRejectedValueOnce(buildError(ContentStudyErrorCode.AI_TIMEOUT, 'timeout'))
      .mockResolvedValue('ok');
    await executeWithRetry(op as () => Promise<string>, DefaultRetryStrategy, onRetry as (attempt: number, delay: number, error: unknown) => void);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Number), expect.objectContaining({ code: ContentStudyErrorCode.AI_TIMEOUT }));
  });
});
