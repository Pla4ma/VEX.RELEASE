import {
  buildHomeExperienceModel,
  decideHomeSurfaces,
  featureAvailability,
  calmProfile,
  baseStats,
} from './product-journey-helpers';

describe('product journey — Day 1 return', () => {
  const model = buildHomeExperienceModel({
    explicitMotivationStyle: null,
    totalCompletedSessions: 1,
  });

  it('shows progress proof', () => {
    expect(model.visibleSections).toContain('progress_signal');
    expect(model.progressPlacement).not.toContain('Hidden');
    expect(model.visibleSections).toContain('session_reflection');
  });

  it('shows coach reflection', () => {
    expect(model.visibleSections).toContain('coach_line');
    expect(model.secondaryCta).toBe('Review progress');
  });

  it('next session CTA is primary', () => {
    expect(model.primaryCta).toBe('Start Next Session');
    expect(model.stage).toBe('STAGE_1');
  });

  it('progress signal appears on surfaces', () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: calmProfile,
      behaviorStats: { ...baseStats(1), completionStreak: 1 },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.progress_proof).toBe('secondary');
  });
});
