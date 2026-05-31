import {
  recordPaywallShow,
  getPaywallHistory,
  canShowPaywall,
  shouldPreventPaywall,
  evaluateTrigger,
  getPaywallCooldownRemaining,
  selectBestPaywall,
} from '../ContextualPaywall';

jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn() },
}));

jest.mock('../subscription-store', () => ({
  subscriptionStore: {
    getSubscription: jest.fn(() => null),
    setSubscription: jest.fn(),
  },
}));

const TEST_USER = 'test-user-001';

describe('monetization feature — comprehensive tests', () => {
  describe('ContextualPaywall', () => {
    it('recordPaywallShow and getPaywallHistory work together', () => {
      const userId = `ctx-user-${Date.now()}`;
      recordPaywallShow(userId, 'DEEP_COACH_MEMORY', false, false);
      const history = getPaywallHistory(userId);
      expect(history.length).toBe(1);
      expect(history[0]!.context).toBe('DEEP_COACH_MEMORY');
    });
    it('canShowPaywall returns true for first show', () => {
      const userId = `ctx-user-${Date.now()}-fresh`;
      const result = canShowPaywall(userId, 'DEEP_COACH_MEMORY');
      expect(result.canShow).toBe(true);
    });
    it('canShowPaywall respects DND during session', () => {
      const userId = `ctx-user-${Date.now()}-dnd`;
      const result = canShowPaywall(userId, 'DEEP_COACH_MEMORY', true);
      expect(result.canShow).toBe(false);
      expect(result.reason).toContain('Do Not Disturb');
    });
    it('shouldPreventPaywall blocks during onboarding', () => {
      const result = shouldPreventPaywall(TEST_USER, 5, true, false);
      expect(result.prevent).toBe(true);
      expect(result.reason).toContain('Onboarding');
    });
    it('shouldPreventPaywall blocks for first session', () => {
      const result = shouldPreventPaywall(TEST_USER, 5, false, true);
      expect(result.prevent).toBe(true);
    });
    it('shouldPreventPaywall blocks with < 1 sessions completed', () => {
      const result = shouldPreventPaywall(TEST_USER, 0, false, false);
      expect(result.prevent).toBe(true);
    });
    it('evaluateTrigger returns shouldShow for free user with known trigger', () => {
      const userId = `eval-user-${Date.now()}`;
      const result = evaluateTrigger(userId, { type: 'COACH_MEMORY_REQUEST' }, 'free');
      expect(typeof result.shouldShow).toBe('boolean');
      expect(typeof result.context === 'string' || result.context === null).toBe(true);
    });
    it('evaluateTrigger returns false for unknown trigger type', () => {
      const result = evaluateTrigger(TEST_USER, { type: 'UNKNOWN_TRIGGER' } as any);
      expect(result.shouldShow).toBe(false);
    });
    it('getPaywallCooldownRemaining returns 0 for no history', () => {
      const userId = `cooldown-user-${Date.now()}`;
      expect(getPaywallCooldownRemaining(userId, 'DEEP_COACH_MEMORY')).toBe(0);
    });
    it('selectBestPaywall returns null when no contexts can show', () => {
      const { subscriptionStore } = require('../subscription-store');
      subscriptionStore.getSubscription.mockReturnValue({
        userId: 'premium-user',
        tier: 'premium',
        startedAt: Date.now(),
        expiresAt: null,
        isTrial: false,
        trialEndsAt: null,
        autoRenew: true,
        platform: 'ios',
      });
      const result = selectBestPaywall('premium-user', ['DEEP_COACH_MEMORY']);
      expect(result).toBeNull();
      subscriptionStore.getSubscription.mockReturnValue(null);
    });
  });
});
