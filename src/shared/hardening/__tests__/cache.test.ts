import { TTLCache, RateLimiter, AsyncQueue } from '../cache';

describe('cache', () => {
  describe('TTLCache', () => {
    it('returns undefined for missing key', () => {
      const cache = new TTLCache<string>();
      expect(cache.get('missing')).toBeUndefined();
    });

    it('returns value before TTL expires', () => {
      const cache = new TTLCache<string>(60000);
      cache.set('key', 'value');
      expect(cache.get('key')).toBe('value');
    });

    it('returns undefined after TTL expires', async () => {
      const cache = new TTLCache<string>(10);
      cache.set('key', 'value');
      await new Promise((r) => setTimeout(r, 20));
      expect(cache.get('key')).toBeUndefined();
    });

    it('uses custom TTL per entry', async () => {
      const cache = new TTLCache<string>(60000);
      cache.set('short', 'a', 10);
      cache.set('long', 'b', 60000);
      await new Promise((r) => setTimeout(r, 20));
      expect(cache.get('short')).toBeUndefined();
      expect(cache.get('long')).toBe('b');
    });

    it('deletes entries', () => {
      const cache = new TTLCache<string>();
      cache.set('key', 'value');
      cache.delete('key');
      expect(cache.get('key')).toBeUndefined();
    });

    it('clears all entries', () => {
      const cache = new TTLCache<string>();
      cache.set('a', '1');
      cache.set('b', '2');
      cache.clear();
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBeUndefined();
    });

    it('has() returns true for valid entries', () => {
      const cache = new TTLCache<string>(60000);
      cache.set('key', 'value');
      expect(cache.has('key')).toBe(true);
    });

    it('has() returns false for expired entries', async () => {
      const cache = new TTLCache<string>(10);
      cache.set('key', 'value');
      await new Promise((r) => setTimeout(r, 20));
      expect(cache.has('key')).toBe(false);
    });

    it('size() returns count of non-expired entries', async () => {
      const cache = new TTLCache<string>(10000);
      cache.set('a', '1');
      cache.set('b', '2');
      expect(cache.size()).toBe(2);
    });
  });

  describe('RateLimiter', () => {
    it('allows requests under limit', () => {
      const limiter = new RateLimiter(5, 60000);
      expect(limiter.canProceed()).toBe(true);
    });

    it('blocks requests at limit', () => {
      const limiter = new RateLimiter(2, 60000);
      limiter.recordRequest();
      limiter.recordRequest();
      expect(limiter.canProceed()).toBe(false);
    });

    it('returns remaining count', () => {
      const limiter = new RateLimiter(5, 60000);
      limiter.recordRequest();
      expect(limiter.getRemaining()).toBe(4);
    });

    it('resets after window expires', async () => {
      const limiter = new RateLimiter(1, 20);
      limiter.recordRequest();
      expect(limiter.canProceed()).toBe(false);
      await new Promise((r) => setTimeout(r, 30));
      expect(limiter.canProceed()).toBe(true);
    });

    it('getResetTime returns 0 when no requests', () => {
      const limiter = new RateLimiter(5, 60000);
      expect(limiter.getResetTime()).toBe(0);
    });

    it('getResetTime returns future timestamp when requests exist', () => {
      const limiter = new RateLimiter(5, 60000);
      limiter.recordRequest();
      expect(limiter.getResetTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('AsyncQueue', () => {
    it('executes tasks in order', async () => {
      const queue = new AsyncQueue(1);
      const results: number[] = [];
      await Promise.all([
        queue.add(async () => { results.push(1); return 1; }),
        queue.add(async () => { results.push(2); return 2; }),
        queue.add(async () => { results.push(3); return 3; }),
      ]);
      expect(results).toEqual([1, 2, 3]);
    });

    it('respects concurrency limit', async () => {
      const queue = new AsyncQueue(2);
      let running = 0;
      let maxRunning = 0;

      await Promise.all([
        queue.add(async () => {
          running++;
          maxRunning = Math.max(maxRunning, running);
          await new Promise((r) => setTimeout(r, 20));
          running--;
        }),
        queue.add(async () => {
          running++;
          maxRunning = Math.max(maxRunning, running);
          await new Promise((r) => setTimeout(r, 20));
          running--;
        }),
        queue.add(async () => {
          running++;
          maxRunning = Math.max(maxRunning, running);
          await new Promise((r) => setTimeout(r, 20));
          running--;
        }),
      ]);
      expect(maxRunning).toBeLessThanOrEqual(2);
    });

    it('returns task results', async () => {
      const queue = new AsyncQueue(2);
      const result = await queue.add(() => Promise.resolve(42));
      expect(result).toBe(42);
    });

    it('propagates errors', async () => {
      const queue = new AsyncQueue(1);
      await expect(queue.add(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail');
    });

    it('tracks size and active', () => {
      const queue = new AsyncQueue(2);
      expect(queue.size).toBe(0);
      expect(queue.active).toBe(0);
    });
  });
});
