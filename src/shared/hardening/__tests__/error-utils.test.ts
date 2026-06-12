import {
  classifyError,
  safeJsonParse,
  safeJsonStringify,
  runHealthChecks,
} from '../error-utils';

describe('error-utils', () => {
  describe('classifyError', () => {
    it('classifies network errors as transient and retryable', () => {
      const result = classifyError(new Error('network connection failed'));
      expect(result.type).toBe('transient');
      expect(result.retryable).toBe(true);
      expect(result.severity).toBe('medium');
    });

    it('classifies timeout errors as transient', () => {
      const result = classifyError(new Error('request timeout'));
      expect(result.type).toBe('transient');
      expect(result.retryable).toBe(true);
    });

    it('classifies rate limit errors as transient with low severity', () => {
      const result = classifyError(new Error('rate limit exceeded'));
      expect(result.type).toBe('transient');
      expect(result.retryable).toBe(true);
      expect(result.severity).toBe('low');
    });

    it('classifies 429 (too many requests) errors as transient', () => {
      const result = classifyError(new Error('too many requests'));
      expect(result.type).toBe('transient');
      expect(result.retryable).toBe(true);
    });

    it('classifies unauthorized errors as auth and non-retryable', () => {
      const result = classifyError(new Error('unauthorized access'));
      expect(result.type).toBe('auth');
      expect(result.retryable).toBe(false);
      expect(result.severity).toBe('high');
    });

    it('classifies forbidden errors as auth', () => {
      const result = classifyError(new Error('forbidden'));
      expect(result.type).toBe('auth');
      expect(result.retryable).toBe(false);
    });

    it('classifies validation errors as non-retryable', () => {
      const result = classifyError(new Error('validation failed'));
      expect(result.type).toBe('validation');
      expect(result.retryable).toBe(false);
      expect(result.severity).toBe('medium');
    });

    it('classifies not found errors as persistent', () => {
      const result = classifyError(new Error('resource not found'));
      expect(result.type).toBe('persistent');
      expect(result.retryable).toBe(false);
      expect(result.severity).toBe('low');
    });

    it('classifies unknown errors as unknown with high severity', () => {
      const result = classifyError(new Error('some random error'));
      expect(result.type).toBe('unknown');
      expect(result.retryable).toBe(false);
      expect(result.severity).toBe('high');
    });

    it('is case insensitive', () => {
      const result = classifyError(new Error('NETWORK_ERROR'));
      expect(result.type).toBe('transient');
    });
  });

  describe('safeJsonParse', () => {
    it('parses valid JSON', () => {
      const result = safeJsonParse('{"key":"value"}', { default: true });
      expect(result).toEqual({ key: 'value' });
    });

    it('returns fallback on invalid JSON', () => {
      const result = safeJsonParse('not json', 'fallback');
      expect(result).toBe('fallback');
    });

    it('returns fallback on empty string', () => {
      const result = safeJsonParse('', { default: true });
      expect(result).toEqual({ default: true });
    });

    it('handles arrays', () => {
      const result = safeJsonParse('[1,2,3]', []);
      expect(result).toEqual([1, 2, 3]);
    });

    it('handles null', () => {
      const result = safeJsonParse('null', 'fallback');
      expect(result).toBeNull();
    });
  });

  describe('safeJsonStringify', () => {
    it('stringifies valid objects', () => {
      const result = safeJsonStringify({ key: 'value' });
      expect(result).toBe('{"key":"value"}');
    });

    it('returns fallback on circular reference', () => {
      const obj: Record<string, unknown> = {};
      obj.self = obj;
      const result = safeJsonStringify(obj, '{"error":"circular"}');
      expect(result).toBe('{"error":"circular"}');
    });

    it('handles null gracefully', () => {
      const result = safeJsonStringify(null);
      expect(result).toBe('null');
    });

    it('handles arrays', () => {
      const result = safeJsonStringify([1, 2, 3]);
      expect(result).toBe('[1,2,3]');
    });
  });

  describe('runHealthChecks', () => {
    it('returns healthy when all checks pass', async () => {
      const checks = [
        { name: 'db', check: () => Promise.resolve(true), critical: true },
        { name: 'cache', check: () => Promise.resolve(true), critical: false },
      ];
      const result = await runHealthChecks(checks);
      expect(result.healthy).toBe(true);
      expect(result.results).toEqual([
        { name: 'db', healthy: true, critical: true },
        { name: 'cache', healthy: true, critical: false },
      ]);
    });

    it('returns unhealthy when critical check fails', async () => {
      const checks = [
        { name: 'db', check: () => Promise.resolve(false), critical: true },
        { name: 'cache', check: () => Promise.resolve(true), critical: false },
      ];
      const result = await runHealthChecks(checks);
      expect(result.healthy).toBe(false);
    });

    it('returns healthy when only non-critical check fails', async () => {
      const checks = [
        { name: 'db', check: () => Promise.resolve(true), critical: true },
        { name: 'cache', check: () => Promise.resolve(false), critical: false },
      ];
      const result = await runHealthChecks(checks);
      expect(result.healthy).toBe(true);
    });

    it('handles check that throws', async () => {
      const checks = [
        { name: 'db', check: () => Promise.reject(new Error('db down')), critical: true },
      ];
      const result = await runHealthChecks(checks);
      expect(result.healthy).toBe(false);
      expect(result.results[0].healthy).toBe(false);
    });

    it('handles empty checks array', async () => {
      const result = await runHealthChecks([]);
      expect(result.healthy).toBe(true);
    });
  });
});
