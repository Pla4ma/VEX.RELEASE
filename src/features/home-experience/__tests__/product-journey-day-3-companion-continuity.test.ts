import {
  buildHomeExperienceModel,
  getHomeStage,
  decideHomeSurfaces,
  featureAvailability,
  studyProfile,
  baseStats,
} from './product-journey-helpers';

describe('product journey — Day 3 companion continuity', () => {
  it('companion thread visible for friendly style', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: {
        ...studyProfile,
        motivationStyle: 'friendly',
        primaryGoal: 'creative',
      },
      behaviorStats: { ...baseStats(3), coachInteractions: 2, completionStreak: 2 },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.companion_thread).not.toBe('hidden');
  });

  it('stage transitions correctly', () => {
    expect(getHomeStage(3)).toBe('STAGE_2');
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: null,
      totalCompletedSessions: 3,
    });
    expect(model.stage).toBe('STAGE_2');
  });
});
