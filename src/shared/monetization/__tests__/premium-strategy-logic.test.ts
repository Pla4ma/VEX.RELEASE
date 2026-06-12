import {
  resolvePremiumStrategy,
  type PremiumStrategyInput,
  type PremiumHighIntentAction,
} from '../premium-strategy';

describe('premium-strategy', () => {
  describe('resolvePremiumStrategy', () => {
    it('hides paywall when billing not configured', () => {
      const result = resolvePremiumStrategy({ billingConfigured: false, completedSessions: 100 });
      expect(result.canShowPaywall).toBe(false);
      expect(result.triggerMoment).toBe('hidden_billing_unavailable');
    });

    it('hides paywall after 2+ dismissals', () => {
      const result = resolvePremiumStrategy({
        billingConfigured: true, completedSessions: 100, paywallDismissals: 2,
      });
      expect(result.canShowPaywall).toBe(false);
      expect(result.triggerMoment).toBe('none');
    });

    it('hides paywall when fewer than 5 sessions', () => {
      const result = resolvePremiumStrategy({
        billingConfigured: true, completedSessions: 3,
      });
      expect(result.canShowPaywall).toBe(false);
    });

    it('shows paywall with high intent action', () => {
      const result = resolvePremiumStrategy({
        billingConfigured: true, completedSessions: 10,
        highIntentAction: 'deep_coach_memory',
      });
      expect(result.canShowPaywall).toBe(true);
      expect(result.triggerMoment).toBe('deep_coach_memory');
    });

    it('shows paywall after 40+ sessions (after_value)', () => {
      const result = resolvePremiumStrategy({
        billingConfigured: true, completedSessions: 40,
      });
      expect(result.canShowPaywall).toBe(true);
      expect(result.triggerMoment).toBe('after_value');
    });

    it('hides paywall between 5-39 sessions without high intent', () => {
      const result = resolvePremiumStrategy({
        billingConfigured: true, completedSessions: 20,
      });
      expect(result.canShowPaywall).toBe(false);
    });

    it('includes session evidence in paywall body when provided', () => {
      const result = resolvePremiumStrategy({
        billingConfigured: true, completedSessions: 10,
        highIntentAction: 'memory_console',
        sessionEvidence: { completedSessions: 10, focusHours: 5, consistencyRate: 0.8 },
      });
      expect(result.paywallBody).toContain('10 sessions');
      expect(result.paywallBody).toContain('5h of focus');
    });

    it('includes best window and day in evidence body', () => {
      const result = resolvePremiumStrategy({
        billingConfigured: true, completedSessions: 10,
        highIntentAction: 'calendar_intelligence',
        sessionEvidence: {
          completedSessions: 10, focusHours: 5, consistencyRate: 0.8,
          bestWindow: 'morning', bestDay: 'Monday',
        },
      });
      expect(result.paywallBody).toContain('morning');
      expect(result.paywallBody).toContain('Monday');
    });

    it('uses generic body without evidence', () => {
      const result = resolvePremiumStrategy({
        billingConfigured: true, completedSessions: 10,
        highIntentAction: 'weekly_intelligence',
      });
      expect(result.paywallBody).toContain('VEX Premium');
    });

    it('all strategies include required fields', () => {
      const result = resolvePremiumStrategy({ billingConfigured: true, completedSessions: 50 });
      expect(result.entitlementArchitecture.length).toBeGreaterThan(0);
      expect(result.freeFeatures.length).toBeGreaterThan(0);
      expect(result.premiumFeatures.length).toBeGreaterThan(0);
      expect(result.noFakeBillingChecklist.length).toBeGreaterThan(0);
      expect(result.freeVsProMatrix.length).toBeGreaterThan(0);
      expect(result.paywallHeadline).toBeDefined();
      expect(result.paywallHeadline.length).toBeGreaterThan(0);
    });

    it('all high intent actions are supported', () => {
      const actions: PremiumHighIntentAction[] = [
        'deep_coach_memory', 'advanced_study', 'weekly_intelligence',
        'memory_console', 'calendar_intelligence',
      ];
      for (const action of actions) {
        const result = resolvePremiumStrategy({
          billingConfigured: true, completedSessions: 10, highIntentAction: action,
        });
        expect(result.canShowPaywall).toBe(true);
        expect(result.triggerMoment).toBe(action);
      }
    });

    it('evidence body requires minimum 5 sessions and 1 hour', () => {
      const result = resolvePremiumStrategy({
        billingConfigured: true, completedSessions: 10,
        highIntentAction: 'deep_coach_memory',
        sessionEvidence: { completedSessions: 3, focusHours: 0.5, consistencyRate: 0.5 },
      });
      // Evidence clause should be null, so generic body
      expect(result.paywallBody).toContain('VEX Premium');
    });
  });
});
