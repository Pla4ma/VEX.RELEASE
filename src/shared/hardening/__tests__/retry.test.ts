import { withRetry, sleep } from '../retry';

describe('retry', () => {
  describe('sleep', () => {
    it('resolves after the specified time', async () => {
      const start = Date.now();
      await sleep(50);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(40);
    });
  });

  describe('withRetry', () => {
    it('returns result on first success', async () => {
      const result = await withRetry(() => Promise.resolve(42));
      expect(result).toBe(42);
    });

    it('retries on retryable error and succeeds', async () => {
      let attempts = 0;
      const result = await withRetry(
        () => {
          attempts++;
          if (attempts < 2) {
            throw new Error('network_error: connection failed');
          }
          return Promise.resolve(42);
        },
        { maxAttempts: 3, baseDelayMs: 1 },
      );
      expect(result).toBe(42);
      expect(attempts).toBe(2);
    });

    it('throws after max attempts', async () => {
      let attempts = 0;
      await expect(
        withRetry(
          () => {
            attempts++;
            throw new Error('network_error: fail');
          },
          { maxAttempts: 3, baseDelayMs: 1 },
        ),
      ).rejects.toThrow('network_error: fail');
      expect(attempts).toBe(3);
    });

    it('does not retry non-retryable errors', async () => {
      let attempts = 0;
      await expect(
        withRetry(
          () => {
            attempts++;
            throw new Error('validation: invalid input');
          },
          { maxAttempts: 3, baseDelayMs: 1 },
        ),
      ).rejects.toThrow('validation: invalid input');
      expect(attempts).toBe(1);
    });

    it('calls onRetry callback', async () => {
      const retryCalls: number[] = [];
      let attempts = 0;
      await withRetry(
        () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('timeout');
          }
          return Promise.resolve(42);
        },
        { maxAttempts: 3, baseDelayMs: 1, onRetry: (attempt) => retryCalls.push(attempt) },
      );
      expect(retryCalls).toEqual([1, 2]);
    });

    it('calls onExhausted callback', async () => {
      let exhaustedError: Error | null = null;
      await expect(
        withRetry(
          () => {
            throw new Error('rate_limited');
          },
          {
            maxAttempts: 2,
            baseDelayMs: 1,
            onExhausted: (err) => { exhaustedError = err; },
          },
        ),
      ).rejects.toThrow();
      expect(exhaustedError).not.toBeNull();
      expect(exhaustedError!.message).toBe('rate_limited');
    });

    it('handles non-Error thrown values', async () => {
      await expect(
        withRetry(
          () => {
            throw 'string error';
          },
          { maxAttempts: 1 },
        ),
      ).rejects.toThrow();
    });

    it('uses exponential backoff', async () => {
      const delays: number[] = [];
      let lastTime = Date.now();
      let attempts = 0;
      await withRetry(
        () => {
          const now = Date.now();
          if (attempts > 0) {
            delays.push(now - lastTime);
          }
          lastTime = now;
          attempts++;
          throw new Error('network_error');
        },
        { maxAttempts: 3, baseDelayMs: 10, backoffMultiplier: 2 },
      );
      // Second delay should be roughly 2x the first (with jitter tolerance)
      expect(delays[1]).toBeGreaterThan(delays[0]);
    });
  });
});
