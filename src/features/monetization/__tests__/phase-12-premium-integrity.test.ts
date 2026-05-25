import { resolvePremiumStrategy } from '../../../shared/monetization/premium-strategy';
import { resolvePersonalizedPremium } from '../personalized-premium';
import { FEATURE_GATES, PAYWALL_CONTEXTS, TIERS, getPaywallContext } from '../PremiumTierSystem';

const blockedTerms = [
  'coin',
  'coins',
  'gem',
  'gems',
  'inventory',
  'battle pass',
  'rewards',
  'chest',
  'chests',
  'boss tier',
  'boss tiers',
  'squad',
  'squads',
  'raid',
  'shop',
  'discount',
];

function personalizedCopy(): string {
  const result = resolvePersonalizedPremium({
    billingConfigured: true,
    completedSessions: 10,
    primaryGoal: 'study',
    motivationStyle: 'calm',
    studyUsageRatio: 0.5,
    hasTriedAdvancedStudy: false,
    hasTriedWeeklyReport: false,
    hasTriedVisualIdentity: false,
    currentStreakDays: 5,
    daysSinceOnboarding: 10,
  });
  return [result.premiumHeadline, result.premiumBody, ...result.premiumFeatures].join(' ').toLowerCase();
}

describe('phase 12 premium integrity', () => {
  it.each(blockedTerms)('keeps "%s" out of paywall context copy', (term) => {
    const contextTypes = Object.keys(PAYWALL_CONTEXTS) as Array<keyof typeof PAYWALL_CONTEXTS>;
    const allCopy = contextTypes.flatMap((ctx) => {
      const data = getPaywallContext(ctx);
      return [data.title, data.headline, data.subtext, data.benefit1, data.benefit2];
    }).join(' ').toLowerCase();
    expect(allCopy).not.toMatch(new RegExp(term, 'i'));
  });

  it('keeps premium tier and strategy copy free of forbidden economy language', () => {
    const strategy = resolvePremiumStrategy({ billingConfigured: true, completedSessions: 40 });
    const strategyCopy = [
      strategy.paywallHeadline,
      strategy.paywallBody,
      ...strategy.premiumFeatures,
      ...TIERS.free.highlightedFeatures,
      ...TIERS.premium.highlightedFeatures,
    ].join(' ').toLowerCase();

    for (const term of blockedTerms) {
      expect(strategyCopy).not.toMatch(new RegExp(term, 'i'));
      expect(personalizedCopy()).not.toMatch(new RegExp(term, 'i'));
    }
  });

  it('maps premium feature gates to expected contexts', () => {
    const featureToContext = {
      advancedStudyOS: 'ADVANCED_STUDY_OS',
      deepCoachMemory: 'DEEP_COACH_MEMORY',
      premiumSessionModes: 'PREMIUM_SESSION_MODES',
      progressIntelligence: 'PROGRESS_INTELLIGENCE',
      recoveryPlanning: 'RECOVERY_PLANNING',
      visualIdentity: 'VISUAL_IDENTITY',
    } as const;

    for (const [feature, expectedContext] of Object.entries(featureToContext)) {
      const gate = FEATURE_GATES.find((g) => g.feature === feature);
      expect(gate).toBeDefined();
      expect(gate?.paywallContext).toBe(expectedContext);
    }
  });
});
