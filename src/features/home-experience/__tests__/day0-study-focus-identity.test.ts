import { decideHomeSurfaces } from '../home-surface-decision';
import { buildHomeExperienceModel } from '../service';
import type { HomeSurfaceMap } from '../surface-decision-schemas';

const featureAvailability = { boss: true, challenges: true, premium: true, study: true };

const baseProfile = {
  motivationStyle: 'friendly' as const,
  primaryGoal: 'focus' as const,
  gamificationIntensity: 'medium' as const,
  studyLayerName: 'Focus Plan',
  userStage: 'new' as const,
};

function baseStats() {
  return {
    totalCompletedSessions: 0,
    studyUsageRatio: 0,
    learningUsageRatio: 0,
    bossChallengeEngagement: 'none' as const,
    coachInteractions: 0,
    comebackSessions: 0,
    ignoredFeatures: [],
    premiumFeatureAttempts: [],
    completionStreak: 0,
  };
}

function decideDay0(
  profile: typeof baseProfile,
  overrides: Partial<ReturnType<typeof baseStats>> = {},
  hasActiveStudyPlan = false,
): HomeSurfaceMap {
  return decideHomeSurfaces({
    featureAvailability,
    personalizationProfile: profile,
    behaviorStats: { ...baseStats(), ...overrides },
    hasActiveStudyPlan,
    hasActiveRecommendation: false,
    hasActiveBoss: false,
    isFirstSession: true,
  });
}

function visibleCount(map: HomeSurfaceMap): number {
  return Object.values(map).filter((value) => value !== 'hidden' && value !== 'blocked').length;
}

describe('Day 0 Study/Focus identity', () => {
  it('study user gets tiny Study cue', () => {
    const map = decideDay0({
      ...baseProfile,
      motivationStyle: 'study_focused',
      primaryGoal: 'study',
      studyLayerName: 'Study OS',
    });
    expect(map.study_layer).toBe('tiny_tease');
    expect(map.start_session).toBe('primary');
  });

  it('learning user gets tiny Learning cue', () => {
    const map = decideDay0({
      ...baseProfile,
      primaryGoal: 'learning',
      studyLayerName: 'Learning Plan',
    });
    expect(map.study_layer).toBe('tiny_tease');
  });

  it('explicit study intent gets tiny cue without full Study OS card', () => {
    const map = decideDay0(baseProfile, {}, true);
    expect(map.study_layer).toBe('tiny_tease');
    expect(map.study_layer).not.toBe('secondary');
    expect(map.study_layer).not.toBe('primary');
  });

  it('non-study user does not see Study clutter', () => {
    const map = decideDay0(baseProfile);
    expect(map.study_layer).toBe('hidden');
  });

  it('game-like user can get tiny boss cue', () => {
    const map = decideDay0({
      ...baseProfile,
      motivationStyle: 'game_like',
      primaryGoal: 'work',
      gamificationIntensity: 'strong',
      studyLayerName: 'Deep Work Plan',
    }, { bossChallengeEngagement: 'medium' });
    expect(map.boss_teaser).toBe('tiny_tease');
    expect(map.boss_compact).toBe('hidden');
  });

  it('never shows premium, social, shop, economy, or content upload on Day 0', () => {
    const map = decideDay0({
      ...baseProfile,
      motivationStyle: 'study_focused',
      primaryGoal: 'study',
      studyLayerName: 'Study OS',
    }, { bossChallengeEngagement: 'medium' });
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: 'study_focused',
      totalCompletedSessions: 0,
    });
    expect(map.premium_tease).toBe('hidden');
    expect(model.allowedRoutes).not.toContain('ContentStudy');
    expect(model.mustNotRun).toEqual(expect.arrayContaining(['study_plan_query', 'squad_query']));
    expect(Object.keys(map).some((key) => /social|shop|economy|upload/.test(key))).toBe(false);
  });

  it('keeps Day 0 capped with one primary CTA and no spotlight', () => {
    const map = decideDay0({
      ...baseProfile,
      motivationStyle: 'study_focused',
      primaryGoal: 'study',
      gamificationIntensity: 'strong',
      studyLayerName: 'Study OS',
    }, { bossChallengeEngagement: 'medium' });
    expect(visibleCount(map)).toBeLessThanOrEqual(7);
    expect(Object.values(map).filter((value) => value === 'primary')).toHaveLength(1);
    expect(Object.values(map).filter((value) => value === 'spotlight')).toHaveLength(0);
  });
});
