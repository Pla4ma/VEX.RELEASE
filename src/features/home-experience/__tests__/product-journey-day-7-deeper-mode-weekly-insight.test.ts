import {
  buildHomeExperienceModel,
  decideHomeSurfaces,
  getSpotlightSurface,
  featureAvailability,
  gameLikeProfile,
  studyProfile,
  baseStats,
} from './product-journey-helpers';

describe('product journey — Day 7 deeper mode / weekly insight', () => {
  it('game-like user with high boss engagement gets boss spotlight', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: gameLikeProfile,
      behaviorStats: { ...baseStats(7), bossChallengeEngagement: 'high' },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: true,
      isFirstSession: false,
    });
    const spot = getSpotlightSurface(surfaces);
    expect(['boss_compact', 'boss_teaser'].includes(spot ?? '')).toBe(true);
  });

  it('premium only if real', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: {
        ...baseStats(7),
        premiumFeatureAttempts: [],
        studyUsageRatio: 0.3,
      },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.premium_tease).toBe('hidden');
  });

  it('weekly insight surfaced for engaged user', () => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: 'coach_led',
      totalCompletedSessions: 7,
    });
    expect(model.stage).toBe('STAGE_3');
    expect(model.spotlight).toBe('coach');
  });
});
