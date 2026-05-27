import {
  decideHomeSurfaces,
  featureAvailability,
  baseStats,
} from './product-journey-helpers';

describe('product journey — Day 0 learning user', () => {
  const learningProfile = {
    motivationStyle: 'study_focused' as const,
    primaryGoal: 'learning' as const,
    gamificationIntensity: 'medium' as const,
    studyLayerName: 'Learning OS',
    userStage: 'new' as const,
  };

  it('gets study_layer as Learning cue on Day 0', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: learningProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.study_layer).toBe('tiny_tease');
  });

  it('first session remains primary for learning user', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: learningProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.start_session).toBe('primary');
  });
});
