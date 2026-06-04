import { captureSilentFailure } from '../../../../utils/silent-failure';
import { describe, it, expect } from '@jest/globals';
import { CircuitBreaker, CircuitBreakerOpenError } from '../../utils/retry';

describe('Retry Utilities', () => {
  describe('CircuitBreaker', () => {
    it('allows operations when closed', async () => {
      const cb = new CircuitBreaker(
        { failureThreshold: 3, resetTimeoutMs: 1000, halfOpenMaxCalls: 1 },
        'test',
      );
      const result = await cb.execute(async () => 'success');
      expect(result).toBe('success');
    });

    it('opens after threshold failures', async () => {
      const cb = new CircuitBreaker(
        { failureThreshold: 2, resetTimeoutMs: 5000, halfOpenMaxCalls: 1 },
        'test',
      );
      try {
        await cb.execute(async () => {
          throw new Error('fail');
        });
      } catch (error) {
        captureSilentFailure(error, {
          feature: 'ai-coach',
          operation: 'network-fallback',
          type: 'network',
        });
      }
      expect(cb.getState()).toBe('CLOSED');
      try {
        await cb.execute(async () => {
          throw new Error('fail');
        });
      } catch (error) {
        captureSilentFailure(error, {
          feature: 'ai-coach',
          operation: 'network-fallback',
          type: 'network',
        });
      }
      expect(cb.getState()).toBe('OPEN');
      await expect(cb.execute(async () => 'success')).rejects.toThrow(
        CircuitBreakerOpenError,
      );
    });

    it('transitions to half-open after timeout', async () => {
      const cb = new CircuitBreaker(
        { failureThreshold: 1, resetTimeoutMs: 100, halfOpenMaxCalls: 1 },
        'test',
      );
      try {
        await cb.execute(async () => {
          throw new Error('fail');
        });
      } catch (error) {
        captureSilentFailure(error, {
          feature: 'ai-coach',
          operation: 'network-fallback',
          type: 'network',
        });
      }
      expect(cb.getState()).toBe('OPEN');
      await new Promise((r) => setTimeout(r, 150));
    });
  });
});
