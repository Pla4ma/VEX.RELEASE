import {
  DEFAULT_RETRY_CONFIG,
  ERROR_MESSAGES,
  type RetryConfig,
} from '../PremiumErrorRecovery-helpers';

describe('PremiumErrorRecovery-helpers', () => {
  describe('DEFAULT_RETRY_CONFIG', () => {
    it('has expected default values', () => {
      expect(DEFAULT_RETRY_CONFIG.maxAttempts).toBe(3);
      expect(DEFAULT_RETRY_CONFIG.baseDelay).toBe(1000);
      expect(DEFAULT_RETRY_CONFIG.maxDelay).toBe(10000);
      expect(DEFAULT_RETRY_CONFIG.backoffMultiplier).toBe(2);
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('has messages for all contexts', () => {
      const contexts = ['session', 'purchase', 'sync', 'network', 'general'] as const;
      for (const ctx of contexts) {
        expect(ERROR_MESSAGES[ctx]).toBeDefined();
      }
    });

    it('each message has required fields', () => {
      for (const [ctx, state] of Object.entries(ERROR_MESSAGES)) {
        expect(state.message).toBeDefined();
        expect(state.message.length).toBeGreaterThan(0);
        expect(state.wittyMessage).toBeDefined();
        expect(state.wittyMessage.length).toBeGreaterThan(0);
        expect(state.icon).toBeDefined();
        expect(['low', 'medium', 'high']).toContain(state.severity);
      }
    });

    it('purchase has high severity', () => {
      expect(ERROR_MESSAGES.purchase.severity).toBe('high');
    });

    it('sync has low severity', () => {
      expect(ERROR_MESSAGES.sync.severity).toBe('low');
    });

    it('each message has non-empty icon', () => {
      for (const state of Object.values(ERROR_MESSAGES)) {
        expect(state.icon.length).toBeGreaterThan(0);
      }
    });
  });
});
