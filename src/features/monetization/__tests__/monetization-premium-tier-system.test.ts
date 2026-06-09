import {
  shouldShowPaywall,
  getFeatureGate,
  canCreateStudyPlan,
  getRemainingStudyPlanSlots,
  FEATURE_GATES,
} from '../PremiumTierSystem';

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

describe('monetization feature — comprehensive tests', () => {
  describe('PremiumTierSystem', () => {
    it('FEATURE_GATES has entries for all premium features', () => {
      expect(FEATURE_GATES.length).toBeGreaterThan(0);
    });
    it('getFeatureGate returns a gate for known features', () => {
      const gate = getFeatureGate('deepCoachMemory');
      expect(gate).not.toBeNull();
      expect(gate!.requiresPremium).toBe(true);
    });
    it('getFeatureGate returns null for unknown feature', () => {
      expect(getFeatureGate('nonexistent_feature' as unknown)).toBeNull();
    });
    it('shouldShowPaywall shows for free user with premium feature', () => {
      const result = shouldShowPaywall('free', 'deepCoachMemory');
      expect(result.show).toBe(true);
      expect(result.context).toBe('DEEP_COACH_MEMORY');
    });
    it('shouldShowPaywall does not show for premium user', () => {
      const result = shouldShowPaywall('premium', 'deepCoachMemory');
      expect(result.show).toBe(false);
    });
    it('canCreateStudyPlan allows when under limit for free', () => {
      expect(canCreateStudyPlan('free', 0)).toBe(true);
      expect(canCreateStudyPlan('free', 1)).toBe(false);
    });
    it('canCreateStudyPlan always allows for premium', () => {
      expect(canCreateStudyPlan('premium', 100)).toBe(true);
    });
    it('getRemainingStudyPlanSlots returns correct count for free', () => {
      expect(getRemainingStudyPlanSlots('free', 0)).toBe(1);
      expect(getRemainingStudyPlanSlots('free', 1)).toBe(0);
    });
    it('getRemainingStudyPlanSlots returns Infinity for premium', () => {
      expect(getRemainingStudyPlanSlots('premium', 0)).toBe(Infinity);
    });
  });
});
