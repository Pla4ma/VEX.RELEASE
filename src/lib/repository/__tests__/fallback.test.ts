import { describe, expect, it, jest } from '@jest/globals';
import { executeWithFallback } from '../fallback';

jest.mock('../retry', () => ({
  withRetry: jest.fn(async (_op: string, fn: () => Promise<unknown>) => fn()),
}));

jest.mock('../error-handling', () => {
  const actual = jest.requireActual('../error-handling') as Record<string, unknown>;
  return {
    ...actual,
    classifyError: jest.fn(() => 'SERVER_ERROR'),
  };
});

describe('executeWithFallback', () => {
  it('returns data from online function on success', async () => {
    const onlineFn = jest.fn<() => Promise<string>>().mockResolvedValue('live-data');
    const result = await executeWithFallback('op', onlineFn);
    expect(result.data).toBe('live-data');
    expect(result.error).toBeNull();
    expect(result.fromCache).toBe(false);
  });

  it('falls back to offline function on failure', async () => {
    const onlineFn = jest.fn<() => Promise<string>>().mockRejectedValue(new Error('network'));
    const offlineFn = jest.fn<() => Promise<string | null>>().mockResolvedValue('cached-data');
    const result = await executeWithFallback('op', onlineFn, offlineFn);
    expect(result.data).toBe('cached-data');
    expect(result.fromCache).toBe(true);
    expect(result.error).not.toBeNull();
  });

  it('returns error when no fallback provided', async () => {
    const onlineFn = jest.fn<() => Promise<string>>().mockRejectedValue(new Error('network'));
    const result = await executeWithFallback('op', onlineFn);
    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.fromCache).toBe(false);
  });

  it('returns error when fallback returns null', async () => {
    const onlineFn = jest.fn<() => Promise<string>>().mockRejectedValue(new Error('network'));
    const offlineFn = jest.fn<() => Promise<string | null>>().mockResolvedValue(null);
    const result = await executeWithFallback('op', onlineFn, offlineFn);
    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.fromCache).toBe(false);
  });

  it('returns error when fallback throws', async () => {
    const onlineFn = jest.fn<() => Promise<string>>().mockRejectedValue(new Error('network'));
    const offlineFn = jest.fn<() => Promise<string | null>>().mockRejectedValue(new Error('cache corrupted'));
    const result = await executeWithFallback('op', onlineFn, offlineFn);
    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.fromCache).toBe(false);
  });
});
