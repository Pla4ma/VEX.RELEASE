import {
  decideHomeSurfaces,
  featureAvailability,
  calmProfile,
  gameLikeProfile,
  baseStats,
} from './product-journey-helpers';

describe('product journey — Day 0 non-study user gets no study clutter', () => {
  it('calm user has study_layer hidden on Day 0', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: calmProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.study_layer).toBe('hidden');
  });

  it('game-like work user has study_layer hidden on Day 0', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: gameLikeProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.study_layer).toBe('hidden');
  });

  it('coach-led user has study_layer hidden on Day 0', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: {
        motivationStyle: 'coach_led' as const,
        primaryGoal: 'work' as const,
        gamificationIntensity: 'minimal' as const,
        studyLayerName: 'Deep Work Plan',
        userStage: 'new' as const,
      },
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.study_layer).toBe('hidden');
  });
});
