import { describe, expect, it, jest } from '@jest/globals';
import { RequestDeduplicator } from '../deduplicator';

jest.mock('../../utils/debug', () => ({
  createDebugger: () => ({
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('RequestDeduplicator', () => {
  it('executes request normally when not deduplicating', async () => {
    const dedup = new RequestDeduplicator();
    const request = jest.fn<() => Promise<string>>().mockResolvedValue('result');
    const result = await dedup.deduplicate('key-1', request);
    expect(result).toBe('result');
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent requests with same key', async () => {
    const dedup = new RequestDeduplicator();
    let callCount = 0;
    const request = jest.fn<() => Promise<string>>().mockImplementation(async () => {
      callCount++;
      return `result-${callCount}`;
    });
    const [result1, result2] = await Promise.all([
      dedup.deduplicate('same-key', request),
      dedup.deduplicate('same-key', request),
    ]);
    expect(result1).toBe(result2);
    expect(callCount).toBeGreaterThanOrEqual(1);
  });

  it('allows sequential requests with same key', async () => {
    const dedup = new RequestDeduplicator();
    const request = jest.fn<() => Promise<string>>()
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second');
    const result1 = await dedup.deduplicate('key-1', request);
    const result2 = await dedup.deduplicate('key-1', request);
    expect(result1).toBe('first');
    expect(result2).toBe('second');
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('handles different keys independently', async () => {
    const dedup = new RequestDeduplicator();
    const request = jest.fn<() => Promise<string>>().mockResolvedValue('result');
    const [result1, result2] = await Promise.all([
      dedup.deduplicate('key-a', request),
      dedup.deduplicate('key-b', request),
    ]);
    expect(result1).toBe('result');
    expect(result2).toBe('result');
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('cleans up pending map after request completes', async () => {
    const dedup = new RequestDeduplicator();
    const request = jest.fn<() => Promise<string>>().mockResolvedValue('ok');
    await dedup.deduplicate('key-1', request);
    await dedup.deduplicate('key-1', request);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('cleans up pending map after request fails', async () => {
    const dedup = new RequestDeduplicator();
    const request = jest.fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('ok');
    await expect(dedup.deduplicate('key-1', request)).rejects.toThrow('fail');
    await dedup.deduplicate('key-1', request);
    expect(request).toHaveBeenCalledTimes(2);
  });
});
