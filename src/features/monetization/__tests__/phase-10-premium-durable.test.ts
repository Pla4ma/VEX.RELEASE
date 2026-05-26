import { resolvePremiumStrategy } from '../../../shared/monetization/premium-strategy';
import { resolvePremiumTiming, PREMIUM_VALUE_MAP, getLanePremiumValue, mapProfileToLane } from '../premium-timing';
import { resolvePersonalizedPremium } from '../personalized-premium';
import { getPaywallTiming } from '../value-ladder';
import {
  VALUE_PROPOSITION,
  FREE_BOUNDARY_COPY,
  PREMIUM_BOUNDARY_COPY,
  FEATURE_HIGHLIGHT_MAP,
} from '../../../screens/paywall/paywall-copy';

const blockedEconomyTerms = [
  'coin', 'coins', 'gem', 'gems',
  'shop', 'inventory', 'chest', 'chests',
  'loot', 'lootbox', 'battle pass',
  'streak insurance', 'streak save', 'paid save',
  'pay to win', 'pay-to-win', 'xp boost', 'reward boost',
  'season rewards', 'premium rewards',
];

describe('Phase 10 — Premium 11/10 durable value pass', () => {
  // ── NO DAY 0 PAYWALL ──────────────────────────────────
  describe('no Day 0 paywall', () => {
    it('hides premium at session 0 even with billing and high intent', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 0,
        highIntentAction: 'deep_coach_memory',
      });
      expect(strategy.canShowPaywall).toBe(false);
      expect(strategy.triggerMoment).toBe('none');
    });

    it('hides premium at sessions 1-4 even with highIntentAction', () => {
      for (const sessions of [1, 2, 3, 4]) {
        const strategy = resolvePremiumStrategy({
          billingConfigured: true,
          completedSessions: sessions,
          highIntentAction: 'advanced_study',
        });
        expect(strategy.canShowPaywall).toBe(false);
        expect(strategy.triggerMoment).toBe('none');
      }
    });
  });

  // ── PREMIUM HIDDEN IF REVENUECAT UNHEALTHY ────────────
  describe('premium hidden if RevenueCat unhealthy', () => {
    it('blocks at sessions 0-4 with unhealthy RC', () => {
      const result = resolvePremiumTiming({
        completedSessions: 0,
        revenueCatHealthy: false,
        billingConfigured: true,
      });
      expect(result.tier).toBe('blocked_unhealthy');
      expect(result.canShowPaywall).toBe(false);
      expect(result.canTeaseEntries).toBe(false);
      expect(result.canRenderPremiumCTA).toBe(false);
      expect(result.canShowCompletionMoment).toBe(false);
    });

    it('blocks at session 50 with unhealthy RC', () => {
      const result = resolvePremiumTiming({
        completedSessions: 50,
        revenueCatHealthy: false,
        billingConfigured: true,
      });
      expect(result.tier).toBe('blocked_unhealthy');
      expect(result.canShowPaywall).toBe(false);
    });

    it('blocks when billing not configured at all', () => {
      const result = resolvePremiumTiming({
        completedSessions: 50,
        revenueCatHealthy: true,
        billingConfigured: false,
      });
      expect(result.tier).toBe('blocked_unhealthy');
    });

    it('premium strategy hides without billing config', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: false,
        completedSessions: 100,
      });
      expect(strategy.canShowPaywall).toBe(false);
      expect(strategy.triggerMoment).toBe('hidden_billing_unavailable');
    });
  });

  // ── PREMIUM VISIBLE IF HEALTHY AND VALUE PROOF ─────────
  describe('premium visible if healthy and value proof', () => {
    it('shows paywall at session 40+ with healthy billing', () => {
      const result = resolvePremiumTiming({
        completedSessions: 40,
        revenueCatHealthy: true,
        billingConfigured: true,
      });
      expect(result.tier).toBe('eligible');
      expect(result.canShowPaywall).toBe(true);
      expect(result.canRenderPremiumCTA).toBe(true);
    });

    it('teases but does not paywall at session 5-39', () => {
      for (const sessions of [5, 10, 25, 39]) {
        const result = resolvePremiumTiming({
          completedSessions: sessions,
          revenueCatHealthy: true,
          billingConfigured: true,
        });
        expect(result.tier).toBe('soft_tease');
        expect(result.canShowPaywall).toBe(false);
        expect(result.canTeaseEntries).toBe(true);
      }
    });

    it('allows high-intent trigger at or after session 5', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 5,
        highIntentAction: 'weekly_intelligence',
      });
      expect(strategy.canShowPaywall).toBe(true);
      expect(strategy.triggerMoment).toBe('weekly_intelligence');
    });
  });

  // ── LANE-SPECIFIC PREMIUM COPY ─────────────────────────
  describe('lane-specific premium copy', () => {
    it('each lane has distinct durable value copy', () => {
      const study = getLanePremiumValue('study');
      const run = getLanePremiumValue('run');
      const project = getLanePremiumValue('project');
      const clean = getLanePremiumValue('clean');

      expect(study.headline).toContain('study');
      expect(run.headline).toContain('run');
      expect(project.headline).toContain('project');
      expect(clean.headline).toContain('quiet');

      const allLaneCopy = [
        ...study.features, study.headline, study.body,
        ...run.features, run.headline, run.body,
        ...project.features, project.headline, project.body,
        ...clean.features, clean.headline, clean.body,
      ].join(' ').toLowerCase();

      for (const term of blockedEconomyTerms) {
        const positiveUse = new RegExp(
          `(?<!(no|not|without|never|0)[\\s\\S]{0,30})${term}`, 'i',
        );
        expect(allLaneCopy).not.toMatch(positiveUse);
      }
    });

    it('mapProfileToLane returns correct premium lanes', () => {
      expect(mapProfileToLane('student')).toBe('study');
      expect(mapProfileToLane('competitive')).toBe('run');
      expect(mapProfileToLane('deep_creative')).toBe('project');
      expect(mapProfileToLane('calm')).toBe('clean');
    });
  });

  // ── NO OLD ECONOMY PREMIUM COPY ────────────────────────
  describe('no old economy premium copy', () => {
    const allCopy = [
      VALUE_PROPOSITION,
      FREE_BOUNDARY_COPY,
      PREMIUM_BOUNDARY_COPY,
      ...Object.values(FEATURE_HIGHLIGHT_MAP).flatMap((f) => [f.title, f.benefit]),
    ].join(' ').toLowerCase();

    it.each(blockedEconomyTerms)('excludes "%s" from all paywall copy', (term) => {
      const positiveUse = new RegExp(
        `(?<!(no|not|without|never|0)[\\s\\S]{0,30})${term}`, 'i',
      );
      expect(allCopy).not.toMatch(positiveUse);
    });

    it('explicitly disclaims no coins, no gems', () => {
      expect(allCopy).toContain('no coin');
      expect(allCopy).toContain('no gem');
    });

    it('VALUE_PROPOSITION disclaims game economy', () => {
      expect(VALUE_PROPOSITION.toLowerCase()).toContain('not a game economy');
    });

    it('personalized premium excludes economy for all lanes', () => {
      const lanes = ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const;
      for (const lane of lanes) {
        const result = resolvePersonalizedPremium({
          billingConfigured: true,
          completedSessions: 10,
          lane,
          primaryGoal: 'focus',
          motivationStyle: 'calm',
          studyUsageRatio: 0.5,
          hasTriedAdvancedStudy: false,
          hasTriedWeeklyReport: false,
          hasTriedVisualIdentity: false,
          currentStreakDays: 5,
          daysSinceOnboarding: 10,
        });
        const copy = [result.premiumHeadline, result.premiumBody, ...result.premiumFeatures]
          .join(' ').toLowerCase();
        for (const term of blockedEconomyTerms) {
          const positiveUse = new RegExp(
            `(?<!(no|not|without|never|0)[\\s\\S]{0,30})${term}`, 'i',
          );
          expect(copy).not.toMatch(positiveUse);
        }
      }
    });
  });

  // ── FREE FIRST SESSION FLOW REMAINS FREE ───────────────
  describe('free first session flow remains free', () => {
    it('free features include core session loop', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 0,
      });
      const freeCopy = strategy.freeFeatures.join(' ').toLowerCase();
      expect(freeCopy).toContain('start and complete');
      expect(freeCopy).toContain('session');
    });

    it('noFakeBillingChecklist forbids paywalling basic focus loop', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 0,
      });
      expect(strategy.noFakeBillingChecklist.join(' ').toLowerCase()).toMatch(
        /do not paywall/i,
      );
    });

    it('resolvePremiumTiming hides everything at session 0', () => {
      const result = resolvePremiumTiming({
        completedSessions: 0,
        revenueCatHealthy: true,
        billingConfigured: true,
      });
      expect(result.tier).toBe('hidden_early');
      expect(result.canShowPaywall).toBe(false);
      expect(result.canRenderPremiumCTA).toBe(false);
    });
  });

  // ── PREMIUM ACTION ROUTES SAFELY ───────────────────────
  describe('premium action routes safely', () => {
    it('getPaywallTiming uses 40-session value proof not session-7', () => {
      const timing40 = getPaywallTiming(40, 10, 90);
      expect(timing40.shouldShow).toBe(true);
      expect(timing40.trigger).toBe('post_session');

      const timing7 = getPaywallTiming(7, 10, 70);
      expect(timing7.shouldShow).toBe(false);
    });

    it('premium strategy respects dismissals', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 40,
        paywallDismissals: 2,
      });
      expect(strategy.triggerMoment).toBe('none');
      expect(strategy.canShowPaywall).toBe(false);
    });

    it('personalized premium hides on Day 0', () => {
      const result = resolvePersonalizedPremium({
        billingConfigured: true,
        completedSessions: 0,
        primaryGoal: 'focus',
        motivationStyle: 'calm',
        studyUsageRatio: 0,
        hasTriedAdvancedStudy: false,
        hasTriedWeeklyReport: false,
        hasTriedVisualIdentity: false,
        currentStreakDays: 0,
        daysSinceOnboarding: 0,
      });
      expect(result.canShowPaywall).toBe(false);
      expect(result.triggerMoment).toBe('none');
    });
  });
});
