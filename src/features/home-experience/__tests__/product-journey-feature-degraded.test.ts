import {
  decideHomeSurfaces,
  featureAvailability,
  gameLikeProfile,
  studyProfile,
  baseStats,
} from './product-journey-helpers';

describe('product journey — feature degraded', () => {
  it('content study degraded hides upload CTA', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability: { ...featureAvailability, study: false },
      personalizationProfile: studyProfile,
      behaviorStats: { ...baseStats(3), studyUsageRatio: 0.5 },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.study_layer).toBe('hidden');
  });

  it('premium degraded hides premium_tease regardless of user intent', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability: { ...featureAvailability, premium: false },
      personalizationProfile: studyProfile,
      behaviorStats: { ...baseStats(7), premiumFeatureAttempts: ['deep_coach_memory'] },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.premium_tease).toBe('hidden');
  });

  it('boss degraded shows fallback', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability: { ...featureAvailability, boss: false },
      personalizationProfile: gameLikeProfile,
      behaviorStats: { ...baseStats(10), bossChallengeEngagement: 'high' },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.boss_compact).toBe('hidden');
    expect(surfaces.boss_teaser).toBe('hidden');
    expect(surfaces.boss_full_cta).toBe('hidden');
  });
});
