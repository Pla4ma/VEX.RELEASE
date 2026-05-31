import { decideHomeSurfaces } from '../../../../features/home-experience/home-surface-decision';
import { makeBaseInput } from './home-resolved-first-week-helpers';

describe('Decision hierarchy', () => {
  it('HomePriority OPEN_BOSS is filtered when boss surface blocked', () => {
    const map = decideHomeSurfaces(
      makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'calm',
          primaryGoal: 'focus',
          gamificationIntensity: 'minimal',
          studyLayerName: 'Deep Work Plan',
          userStage: 'power',
        },
        behaviorStats: {
          totalCompletedSessions: 12,
          studyUsageRatio: 0.1,
          bossChallengeEngagement: 'high',
          coachInteractions: 2,
          comebackSessions: 0,
          ignoredFeatures: [],
          premiumFeatureAttempts: [],
          completionStreak: 6,
        },
        isFirstSession: false,
      }),
    );
    expect(map.boss_full_cta).toBe('blocked');
    expect(map.start_session).toBe('primary');
  });

  it('Day 0 Home has exactly one primary CTA', () => {
    const map = decideHomeSurfaces(makeBaseInput());
    const primaries = Object.entries(map).filter(([, v]) => v === 'primary');
    expect(primaries).toHaveLength(1);
    expect(map.start_session).toBe('primary');
  });

  it('calm user does not get boss CTA', () => {
    const map = decideHomeSurfaces(
      makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'calm',
          primaryGoal: 'personal',
          gamificationIntensity: 'minimal',
          studyLayerName: 'Growth Path',
          userStage: 'power',
        },
        behaviorStats: {
          totalCompletedSessions: 15,
          studyUsageRatio: 0,
          bossChallengeEngagement: 'high',
          coachInteractions: 5,
          comebackSessions: 0,
          ignoredFeatures: [],
          premiumFeatureAttempts: [],
          completionStreak: 7,
        },
        isFirstSession: false,
      }),
    );
    expect(map.boss_full_cta).not.toBe('primary');
    expect(map.boss_full_cta).not.toBe('spotlight');
    expect(map.boss_full_cta).not.toBe('secondary');
  });

  it('study user gets Study/Deep Work CTA', () => {
    const map = decideHomeSurfaces(
      makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'study_focused',
          primaryGoal: 'study',
          gamificationIntensity: 'medium',
          studyLayerName: 'Study OS',
          userStage: 'engaged',
        },
        behaviorStats: {
          totalCompletedSessions: 5,
          studyUsageRatio: 0.8,
          bossChallengeEngagement: 'none',
          coachInteractions: 1,
          comebackSessions: 0,
          ignoredFeatures: [],
          premiumFeatureAttempts: [],
          completionStreak: 3,
        },
        hasActiveStudyPlan: true,
        isFirstSession: false,
      }),
    );
    expect(map.study_layer).toBe('spotlight');
    expect(map.start_session).toBe('secondary');
  });

  it('premium hidden before value even with premium available', () => {
    const map = decideHomeSurfaces(
      makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'game_like',
          primaryGoal: 'work',
          gamificationIntensity: 'strong',
          studyLayerName: 'Deep Work Plan',
          userStage: 'engaged',
        },
        behaviorStats: {
          totalCompletedSessions: 2,
          studyUsageRatio: 0,
          bossChallengeEngagement: 'low',
          coachInteractions: 0,
          comebackSessions: 0,
          ignoredFeatures: [],
          premiumFeatureAttempts: [],
          completionStreak: 2,
        },
        isFirstSession: false,
      }),
    );
    expect(map.premium_tease).toBe('hidden');
  });
});
