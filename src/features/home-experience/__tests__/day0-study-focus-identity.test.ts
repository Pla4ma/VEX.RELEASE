import { decideHomeSurfaces } from '../home-surface-decision';
import { buildHomeExperienceModel } from '../service';
import type { HomeSurfaceMap } from '../surface-decision-schemas';
import type { z } from 'zod';
import type { SurfaceDecisionInputSchema } from '../surface-decision-schemas';

type MotivationStyle = z.infer<typeof SurfaceDecisionInputSchema>['personalizationProfile']['motivationStyle'];
type PrimaryGoal = z.infer<typeof SurfaceDecisionInputSchema>['personalizationProfile']['primaryGoal'];
type GamificationIntensity = z.infer<typeof SurfaceDecisionInputSchema>['personalizationProfile']['gamificationIntensity'];

const featureAvailability = { boss: true, challenges: true, premium: true, study: true };

function profile(
  motivationStyle: MotivationStyle = 'friendly',
  primaryGoal: PrimaryGoal = 'focus',
  studyLayerName = 'Focus Plan',
  gamificationIntensity: GamificationIntensity = 'medium',
) {
  return {
    motivationStyle,
    primaryGoal,
    gamificationIntensity,
    studyLayerName,
    userStage: 'new' as const,
  };
}

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
  prof: ReturnType<typeof profile>,
  overrides: Partial<ReturnType<typeof baseStats>> = {},
  hasActiveStudyPlan = false,
): HomeSurfaceMap {
  return decideHomeSurfaces({
    featureAvailability,
    personalizationProfile: prof,
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
    const map = decideDay0(profile('study_focused', 'study', 'Study OS'));
    expect(map.study_layer).toBe('tiny_tease');
    expect(map.start_session).toBe('primary');
  });

  it('learning user gets tiny Learning cue', () => {
    const map = decideDay0(profile('friendly', 'learning', 'Learning Plan'));
    expect(map.study_layer).toBe('tiny_tease');
  });

  it('explicit study intent gets tiny cue without full Study OS card', () => {
    const map = decideDay0(profile(), {}, true);
    expect(map.study_layer).toBe('tiny_tease');
    expect(map.study_layer).not.toBe('secondary');
    expect(map.study_layer).not.toBe('primary');
  });

  it('non-study user does not see Study clutter', () => {
    const map = decideDay0(profile());
    expect(map.study_layer).toBe('hidden');
  });

  it('game-like user can get tiny boss cue', () => {
    const map = decideDay0(
      profile('game_like', 'work', 'Deep Work Plan', 'strong'),
      { bossChallengeEngagement: 'medium' },
    );
    expect(map.boss_teaser).toBe('tiny_tease');
    expect(map.boss_compact).toBe('hidden');
  });

  it('never shows premium, social, shop, economy, or content upload on Day 0', () => {
    const map = decideDay0(
      profile('study_focused', 'study', 'Study OS'),
      { bossChallengeEngagement: 'medium' },
    );
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
    const map = decideDay0(
      profile('study_focused', 'study', 'Study OS', 'strong'),
      { bossChallengeEngagement: 'medium' },
    );
    expect(visibleCount(map)).toBeLessThanOrEqual(7);
    expect(Object.values(map).filter((value) => value === 'primary')).toHaveLength(1);
    expect(Object.values(map).filter((value) => value === 'spotlight')).toHaveLength(0);
  });

  it('student motivation style gets study_layer as tiny_tease on Day 0', () => {
    const map = decideDay0(profile('student', 'study', 'Study OS'));
    expect(map.study_layer).toBe('tiny_tease');
    expect(map.start_session).toBe('primary');
  });

  it('student + learning goal gets study_layer tiny_tease on Day 0', () => {
    const map = decideDay0(profile('student', 'learning', 'Learning Plan'));
    expect(map.study_layer).toBe('tiny_tease');
  });

  it('student style with work goal still gets study cue (student identity)', () => {
    const map = decideDay0(profile('student', 'work', 'Deep Work Plan'));
    expect(map.study_layer).toBe('tiny_tease');
  });

  it('day 0 study-focused user cannot open ContentStudy', () => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: 'study_focused',
      totalCompletedSessions: 0,
    });
    expect(model.allowedRoutes).not.toContain('ContentStudy');
    expect(model.mustNotRun).toContain('study_plan_query');
  });

  it('day 0 study-focused user gets simple SessionSetup route', () => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: 'study_focused',
      totalCompletedSessions: 0,
    });
    expect(model.allowedRoutes).toContain('SessionStack.SessionSetup');
  });

  it('day 0 Home for student stays under density cap', () => {
    const map = decideDay0(
      profile('student', 'study', 'Study OS', 'strong'),
      { bossChallengeEngagement: 'medium' },
    );
    expect(visibleCount(map)).toBeLessThanOrEqual(7);
    expect(Object.values(map).filter((value) => value === 'spotlight')).toHaveLength(0);
  });
});
