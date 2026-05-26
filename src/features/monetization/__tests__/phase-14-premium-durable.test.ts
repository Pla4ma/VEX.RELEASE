import {
  resolvePremiumTiming,
  PREMIUM_VALUE_MAP,
  getLanePremiumValue,
  mapProfileToLane,
  EARLY_HIDDEN_THRESHOLD,
  TEASE_START_SESSION,
  VALUE_PROOF_THRESHOLD,
  type PremiumTimingTier,
  type PremiumLane,
} from '../premium-timing';
import { resolvePremiumStrategy } from '../../../shared/monetization/premium-strategy';
import { resolvePersonalizedPremium } from '../personalized-premium';
import {
  VALUE_PROPOSITION,
  FREE_BOUNDARY_COPY,
  PREMIUM_BOUNDARY_COPY,
  PREMIUM_FEATURES,
  FEATURE_HIGHLIGHT_MAP,
} from '../../../screens/paywall/paywall-copy';

// ── Blocked economy terms ──────────────────────────────────────
const blockedEconomyTerms = [
  'coin', 'coins', 'gem', 'gems',
  'shop', 'inventory', 'chest', 'chests',
  'loot', 'lootbox', 'battle pass',
  'streak insurance', 'streak save', 'paid save',
  'pay to win', 'pay-to-win', 'xp boost', 'reward boost',
  'season rewards', 'premium rewards',
  'boss tier', 'boss tiers', 'raid',
];

// ── Required durable personalization terms ─────────────────────
const durableTerms = [
  'memory', 'focus report', 'focus intelligence',
  'study import', 'import depth',
  'project continuity', 'context restoration', 'flow window',
  'calendar intelligence', 'calendar window',
  'friction mode', 'weekly experiment',
  'memory console', 'private',
];

describe('Phase 14 — premium durable personalization strategy', () => {
  // ────────────────────────────────────────────────────────────
  // TIMING GATES
  // ────────────────────────────────────────────────────────────
  describe('premium timing gates', () => {
    it('returns hidden_early for sessions 0-4 (no Day 0 paywall)', () => {
      for (let i = 0; i < EARLY_HIDDEN_THRESHOLD; i++) {
        const result = resolvePremiumTiming({
          completedSessions: i,
          revenueCatHealthy: true,
          billingConfigured: true,
        });
        expect(result.tier).toBe('hidden_early');
        expect(result.canShowPaywall).toBe(false);
        expect(result.canTeaseEntries).toBe(false);
        expect(result.canRenderPremiumCTA).toBe(false);
        expect(result.canShowCompletionMoment).toBe(false);
      }
    });

    it('returns blocked_unhealthy when RevenueCat is unhealthy', () => {
      const result = resolvePremiumTiming({
        completedSessions: 40,
        revenueCatHealthy: false,
        billingConfigured: true,
      });
      expect(result.tier).toBe('blocked_unhealthy');
      expect(result.canShowPaywall).toBe(false);
      expect(result.canTeaseEntries).toBe(false);
      expect(result.canRenderPremiumCTA).toBe(false);
      expect(result.canShowCompletionMoment).toBe(false);
      expect(result.reason).toContain('billing');
    });

    it('returns blocked_unhealthy when billing not configured', () => {
      const result = resolvePremiumTiming({
        completedSessions: 40,
        revenueCatHealthy: true,
        billingConfigured: false,
      });
      expect(result.tier).toBe('blocked_unhealthy');
      expect(result.canShowPaywall).toBe(false);
    });

    it('returns soft_tease for sessions 5-39 (no paywall, tease only)', () => {
      for (const sessions of [5, 10, 20, 30, 39]) {
        const result = resolvePremiumTiming({
          completedSessions: sessions,
          revenueCatHealthy: true,
          billingConfigured: true,
        });
        expect(result.tier).toBe('soft_tease');
        expect(result.canShowPaywall).toBe(false);
        expect(result.canTeaseEntries).toBe(true);
        expect(result.canRenderPremiumCTA).toBe(false);
      }
    });

    it('returns eligible for 40+ sessions with healthy billing', () => {
      const result = resolvePremiumTiming({
        completedSessions: 40,
        revenueCatHealthy: true,
        billingConfigured: true,
      });
      expect(result.tier).toBe('eligible');
      expect(result.canShowPaywall).toBe(true);
      expect(result.canRenderPremiumCTA).toBe(true);
      expect(result.canShowCompletionMoment).toBe(true);
    });

    it('keeps all premium hidden for 50 sessions if RevenueCat unhealthy', () => {
      const result = resolvePremiumTiming({
        completedSessions: 50,
        revenueCatHealthy: false,
        billingConfigured: true,
      });
      expect(result.tier).toBe('blocked_unhealthy');
      expect(result.canShowPaywall).toBe(false);
    });
  });

  // ────────────────────────────────────────────────────────────
  // PREMIUM COPY SANITY
  // ────────────────────────────────────────────────────────────
  describe('premium copy — no economy language', () => {
    const allCopy = [
      VALUE_PROPOSITION,
      FREE_BOUNDARY_COPY,
      PREMIUM_BOUNDARY_COPY,
      ...PREMIUM_FEATURES.flatMap((f) => [f.title, f.description]),
      ...Object.values(FEATURE_HIGHLIGHT_MAP).flatMap((f) => [f.title, f.benefit]),
    ].join(' ').toLowerCase();

    it.each(blockedEconomyTerms)('excludes "%s" from all premium copy', (term) => {
      // Negation patterns ("no coins", "without gems") are fine — they disclaim economy.
      // Allow up to 30 non-newline chars between negation word and term.
      const positiveUse = new RegExp(`(?<!(no|not|without|never|0)[\\s\\S]{0,30})${term}`, 'i');
      expect(allCopy).not.toMatch(positiveUse);
    });

    it('includes durable personalization language', () => {
      const durableCount = durableTerms.filter((t) => allCopy.includes(t.toLowerCase())).length;
      expect(durableCount).toBeGreaterThanOrEqual(3);
    });

    it('mentions no coins, no gems explicitly', () => {
      expect(allCopy).toContain('no coin');
      expect(allCopy).toContain('no gem');
    });

    it('free boundary copy asserts core loop stays free forever', () => {
      expect(FREE_BOUNDARY_COPY).toMatch(/free.*(forever|always|stay)/i);
      expect(FREE_BOUNDARY_COPY).toContain('Core sessions');
    });
  });

  // ────────────────────────────────────────────────────────────
  // PREMIUM STRATEGY INTEGRATION
  // ────────────────────────────────────────────────────────────
  describe('premium strategy integration', () => {
    it('hidden strategy when billing not configured', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: false,
        completedSessions: 0,
      });
      expect(strategy.canShowPaywall).toBe(false);
      expect(strategy.triggerMoment).toBe('hidden_billing_unavailable');
    });

    it('hidden at session 0 even with billing', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 0,
      });
      expect(strategy.canShowPaywall).toBe(false);
    });

    it('can show after value proof (40 sessions)', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 40,
      });
      expect(strategy.canShowPaywall).toBe(true);
      expect(strategy.triggerMoment).toBe('after_value');
    });

    it('premium features exclude economy', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 40,
      });
      const copy = [
        strategy.paywallHeadline,
        strategy.paywallBody,
        ...strategy.premiumFeatures,
      ].join(' ').toLowerCase();
        for (const term of blockedEconomyTerms) {
          const positiveUse = new RegExp(`(?<!(no|not|without|never|0)[\\s\\S]{0,30})${term}`, 'i');
          expect(copy).not.toMatch(positiveUse);
        }
    });

    it('free features confirm core loop stays free', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 40,
      });
      const freeCopy = strategy.freeFeatures.join(' ').toLowerCase();
      expect(freeCopy).toContain('focus');
      expect(freeCopy).toContain('session');
      expect(freeCopy).toContain('rescue');
    });
  });

  // ────────────────────────────────────────────────────────────
  // PERSONALIZED PREMIUM
  // ────────────────────────────────────────────────────────────
  describe('personalized premium', () => {
    it('copy excludes economy language across all lanes', () => {
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
          const positiveUse = new RegExp(`(?<!(no|not|without|never|0)[\\s\\S]{0,30})${term}`, 'i');
          expect(copy).not.toMatch(positiveUse);
        }
      }
    });

    it('game_like lane copy explicitly disclaims no-currency', () => {
      const result = resolvePersonalizedPremium({
        billingConfigured: true,
        completedSessions: 10,
        lane: 'game_like',
        primaryGoal: 'focus',
        motivationStyle: 'game_like',
        studyUsageRatio: 0.3,
        hasTriedAdvancedStudy: false,
        hasTriedWeeklyReport: false,
        hasTriedVisualIdentity: false,
        currentStreakDays: 5,
        daysSinceOnboarding: 10,
      });
      expect(result.premiumBody.toLowerCase()).toMatch(/(?:no|not|without|never).{0,10}(?:coin|gem|currency|shop)/i);
    });

    it('does not paywall basic focus loop', () => {
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
      // Day 0: triggerMoment should be 'none' (hidden) not a paywall trigger
      expect(result.triggerMoment).toBe('none');
      expect(result.canShowPaywall).toBe(false);
    });
  });

  // ────────────────────────────────────────────────────────────
  // LANE-SPECIFIC VALUE MAP
  // ────────────────────────────────────────────────────────────
  describe('premium value map', () => {
    it('has all 4 lanes defined', () => {
      const lanes = Object.keys(PREMIUM_VALUE_MAP) as PremiumLane[];
      expect(lanes).toHaveLength(4);
      expect(lanes).toContain('study');
      expect(lanes).toContain('run');
      expect(lanes).toContain('project');
      expect(lanes).toContain('clean');
    });

    it.each([
      ['study', 4],
      ['run', 4],
      ['project', 4],
      ['clean', 4],
    ] as const)('%s lane has %d features with no economy terms', (lane, count) => {
      const value = getLanePremiumValue(lane);
      expect(value.features).toHaveLength(count);
      const featureText = value.features.join(' ').toLowerCase();
      for (const term of blockedEconomyTerms) {
        expect(featureText).not.toMatch(new RegExp(term, 'i'));
      }
    });

    it("run lane explicitly states 'no currency'", () => {
      const runValue = getLanePremiumValue('run');
      const allText = [...runValue.features, runValue.headline, runValue.body].join(' ').toLowerCase();
      expect(allText).toMatch(/no currency|no coin|no gem/);
    });

    it.each([
      ['study', 'deadline'],
      ['run', 'modifier'],
      ['project', 'context'],
      ['clean', 'calendar'],
    ] as const)('%s lane uniquely mentions %s', (lane, keyword) => {
      const value = getLanePremiumValue(lane);
      const allText = [...value.features, value.headline, value.body].join(' ').toLowerCase();
      expect(allText).toContain(keyword);
    });

    it('mapProfileToLane routes correctly', () => {
      expect(mapProfileToLane('student')).toBe('study');
      expect(mapProfileToLane('study_focused')).toBe('study');
      expect(mapProfileToLane('game_like')).toBe('run');
      expect(mapProfileToLane('competitive')).toBe('run');
      expect(mapProfileToLane('intense')).toBe('run');
      expect(mapProfileToLane('creator')).toBe('project');
      expect(mapProfileToLane('deep_creative')).toBe('project');
      expect(mapProfileToLane('calm')).toBe('clean');
      expect(mapProfileToLane('unknown')).toBe('clean');
    });
  });

  // ────────────────────────────────────────────────────────────
  // PAYWALL FEATURE HIGHLIGHT MAP
  // ────────────────────────────────────────────────────────────
  describe('paywall feature highlight map', () => {
    it('uses durable-lane keys not old economy keys', () => {
      const keys = Object.keys(FEATURE_HIGHLIGHT_MAP);
      expect(keys).toContain('deep_coach_memory');
      expect(keys).toContain('progress_intelligence');
      expect(keys).toContain('advanced_study_os');
      expect(keys).toContain('recovery_planning');
      expect(keys).toContain('premium_session_modes');
      expect(keys).toContain('visual_identity');
      // Old keys must not exist
      expect(keys).not.toContain('streak_freeze');
      expect(keys).not.toContain('xp_boost');
      expect(keys).not.toContain('season_premium_rewards');
      expect(keys).not.toContain('ai_coach_full_access');
      expect(keys).not.toContain('advanced_analytics');
      expect(keys).not.toContain('content_study');
    });

    it('every highlight entry has durable-focused benefit copy', () => {
      for (const highlight of Object.values(FEATURE_HIGHLIGHT_MAP)) {
        const copy = [highlight.title, highlight.benefit].join(' ').toLowerCase();
        for (const term of blockedEconomyTerms) {
          expect(copy).not.toMatch(new RegExp(term, 'i'));
        }
      }
    });
  });

  // ────────────────────────────────────────────────────────────
  // REVENUECAT HEALTH GATE
  // ────────────────────────────────────────────────────────────
  describe('RevenueCat health gate', () => {
    it('premium timing returns blocked_unhealthy when RC is unhealthy', () => {
      const result = resolvePremiumTiming({
        completedSessions: 100,
        revenueCatHealthy: false,
        billingConfigured: true,
      });
      expect(result.tier).toBe('blocked_unhealthy');
    });

    it('premium timing blocks CTA render when unhealthy', () => {
      const result = resolvePremiumTiming({
        completedSessions: 100,
        revenueCatHealthy: false,
        billingConfigured: true,
      });
      expect(result.canRenderPremiumCTA).toBe(false);
      expect(result.canShowCompletionMoment).toBe(false);
    });

    it('premium strategy hidden when billing not configured', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: false,
        completedSessions: 100,
      });
      expect(strategy.canShowPaywall).toBe(false);
      expect(strategy.triggerMoment).toBe('hidden_billing_unavailable');
    });
  });
});
