import { resolvePersonalizedPremium } from '../personalized-premium';

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
  describe('personalized-premium', () => {
    const baseInput = {
      billingConfigured: true,
      completedSessions: 50,
      primaryGoal: 'study' as const,
      motivationStyle: 'study_focused' as const,
      studyUsageRatio: 0.6,
      hasTriedAdvancedStudy: false,
      hasTriedWeeklyReport: false,
      hasTriedVisualIdentity: false,
      currentStreakDays: 5,
      daysSinceOnboarding: 30,
    };

    it('resolves to hidden_billing_unavailable when billing not configured', () => {
      const result = resolvePersonalizedPremium({
        ...baseInput,
        billingConfigured: false,
      });
      expect(result.triggerMoment).toBe('hidden_billing_unavailable');
      expect(result.canShowPaywall).toBe(false);
    });
    it('resolves to none for 0 sessions', () => {
      const result = resolvePersonalizedPremium({
        ...baseInput,
        completedSessions: 0,
      });
      expect(result.triggerMoment).toBe('none');
    });
    it('resolves to advanced_study when tried it', () => {
      const result = resolvePersonalizedPremium({
        ...baseInput,
        hasTriedAdvancedStudy: true,
      });
      expect(result.triggerMoment).toBe('advanced_study');
      expect(result.canShowPaywall).toBe(true);
    });
    it('resolves to weekly_intelligence when tried it', () => {
      const result = resolvePersonalizedPremium({
        ...baseInput,
        hasTriedWeeklyReport: true,
      });
      expect(result.triggerMoment).toBe('weekly_intelligence');
    });
    it('returns non-empty freeVsProMatrix', () => {
      const result = resolvePersonalizedPremium(baseInput);
      expect(result.freeVsProMatrix.length).toBeGreaterThan(0);
    });
    it('returns non-empty premium headline and body', () => {
      const result = resolvePersonalizedPremium(baseInput);
      expect(result.premiumHeadline.length).toBeGreaterThan(0);
      expect(result.premiumBody.length).toBeGreaterThan(0);
    });
    it('includes NO_FAKE_BILLING checklist', () => {
      const result = resolvePersonalizedPremium(baseInput);
      expect(result.noFakeBillingChecklist.length).toBeGreaterThan(0);
    });
    it('resolves session_value for high sessions with no specific trigger', () => {
      const result = resolvePersonalizedPremium({
        ...baseInput,
        completedSessions: 50,
        daysSinceOnboarding: 30,
        hasTriedAdvancedStudy: false,
        hasTriedWeeklyReport: false,
        hasTriedVisualIdentity: false,
        studyUsageRatio: 0.1,
        currentStreakDays: 2,
      });
      expect(result.triggerMoment).toBe('session_value');
    });
  });
});
