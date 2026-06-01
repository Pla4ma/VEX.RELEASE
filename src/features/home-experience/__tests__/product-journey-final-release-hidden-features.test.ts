import {
  buildHomeExperienceModel,
  decideHomeSurfaces,
  featureAvailability,
  calmProfile,
  baseStats,
  visibleNonHidden,
} from './product-journey-helpers';

describe('product journey — final release hidden features', () => {
  it('does not expose shop inventory battle_pass social squads rivals', () => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: null,
      totalCompletedSessions: 25,
    });
    expect(model.mustNotRun).toContain('locked_route_registration');
    expect(model.mustNotRun).not.toContain('boss_query');

    const visible = visibleNonHidden(
      decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: calmProfile,
        behaviorStats: {
          ...baseStats(25),
          completionStreak: 10,
          coachInteractions: 8,
          studyUsageRatio: 0.2,
        },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      }),
    );
    const hasForbidden = visible.some((s) =>
      ['shop', 'inventory', 'battle_pass', 'social', 'squads', 'rivals'].some(
        (fw) => s.includes(fw),
      ),
    );
    expect(hasForbidden).toBe(false);
  });
});
