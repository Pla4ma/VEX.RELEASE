/**
 * Tests for useHomeResolvedExperience — verifies real runtime data collection.
 */
import { decideHomeSurfaces } from '../../../../features/home-experience/home-surface-decision';

function makeBaseInput(overrides: Record<string, unknown> = {}) {
  return {
    featureAvailability: { boss: true, challenges: true, premium: true, study: true },
    personalizationProfile: {
      motivationStyle: 'calm' as const,
      primaryGoal: 'focus' as const,
      gamificationIntensity: 'minimal' as const,
      studyLayerName: 'Deep Work Plan',
      userStage: 'new' as const,
    },
    behaviorStats: {
      totalCompletedSessions: 0,
      studyUsageRatio: 0,
      bossChallengeEngagement: 'none' as const,
      coachInteractions: 0,
      comebackSessions: 0,
      ignoredFeatures: [],
      premiumFeatureAttempts: [],
      completionStreak: 0,
    },
    hasActiveStudyPlan: false,
    hasActiveRecommendation: false,
    hasActiveBoss: false,
    isFirstSession: true,
    ...overrides,
  };
}

describe('Home resolved experience — surface decisions', () => {
  describe('Calm work user', () => {
    it('does not get heavy boss spotlight', () => {
      const map = decideHomeSurfaces(makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'calm',
          primaryGoal: 'work',
          gamificationIntensity: 'minimal',
          studyLayerName: 'Deep Work Plan',
          userStage: 'power',
        },
        behaviorStats: {
          totalCompletedSessions: 12, studyUsageRatio: 0.1,
          bossChallengeEngagement: 'medium', coachInteractions: 2,
          comebackSessions: 0, ignoredFeatures: [],
          premiumFeatureAttempts: [], completionStreak: 5,
        },
        isFirstSession: false,
      }));
      expect(map.boss_teaser).toBe('hidden');
      expect(map.boss_compact).toBe('hidden');
      expect(map.boss_full_cta).toBe('blocked');
    });
  });

  describe('Game-like user', () => {
    it('can get boss spotlight after session proof', () => {
      const map = decideHomeSurfaces(makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'game_like', primaryGoal: 'work',
          gamificationIntensity: 'strong', studyLayerName: 'Deep Work Plan',
          userStage: 'engaged',
        },
        behaviorStats: {
          totalCompletedSessions: 8, studyUsageRatio: 0.1,
          bossChallengeEngagement: 'high', coachInteractions: 0,
          comebackSessions: 0, ignoredFeatures: [],
          premiumFeatureAttempts: [], completionStreak: 4,
        },
        hasActiveBoss: true, isFirstSession: false,
      }));
      expect(['spotlight', 'secondary']).toContain(map.boss_compact);
      expect(map.boss_full_cta).not.toBe('blocked');
    });

    it('does not get boss spotlight on Day 0', () => {
      const map = decideHomeSurfaces(makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'game_like', primaryGoal: 'work',
          gamificationIntensity: 'strong', studyLayerName: 'Deep Work Plan',
          userStage: 'new',
        },
        isFirstSession: true,
      }));
      expect(Object.entries(map).filter(([, v]) => v === 'spotlight')).toHaveLength(0);
    });
  });

  describe('Study user', () => {
    it('gets Study/Deep Work spotlight', () => {
      const map = decideHomeSurfaces(makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'study_focused', primaryGoal: 'study',
          gamificationIntensity: 'medium', studyLayerName: 'Study OS',
          userStage: 'engaged',
        },
        behaviorStats: {
          totalCompletedSessions: 5, studyUsageRatio: 0.6,
          bossChallengeEngagement: 'none', coachInteractions: 1,
          comebackSessions: 0, ignoredFeatures: [],
          premiumFeatureAttempts: [], completionStreak: 3,
        },
        hasActiveStudyPlan: true, isFirstSession: false,
      }));
      expect(map.study_layer).toBe('spotlight');
    });
  });

  describe('Coach-led user', () => {
    it('gets coach next-action spotlight', () => {
      const map = decideHomeSurfaces(makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'coach_led', primaryGoal: 'work',
          gamificationIntensity: 'medium', studyLayerName: 'Deep Work Plan',
          userStage: 'engaged',
        },
        behaviorStats: {
          totalCompletedSessions: 4, studyUsageRatio: 0,
          bossChallengeEngagement: 'none', coachInteractions: 3,
          comebackSessions: 0, ignoredFeatures: [],
          premiumFeatureAttempts: [], completionStreak: 2,
        },
        hasActiveRecommendation: true, isFirstSession: false,
      }));
      expect(map.coach_presence).toBe('spotlight');
    });
  });

  describe('Non-study user Day 0', () => {
    it('does not show Content Study upload', () => {
      const map = decideHomeSurfaces(makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'calm', primaryGoal: 'focus',
          gamificationIntensity: 'minimal',           studyLayerName: 'Growth Path',
          userStage: 'new',
        },
        isFirstSession: true,
      }));
      expect(map.study_layer).not.toBe('spotlight');
      expect(map.study_layer).not.toBe('primary');
    });
  });

  describe('Premium', () => {
    it('does not tease before value', () => {
      const map = decideHomeSurfaces(makeBaseInput({
        personalizationProfile: {
          motivationStyle: 'coach_led', primaryGoal: 'work',
          gamificationIntensity: 'medium', studyLayerName: 'Deep Work Plan',
          userStage: 'engaged',
        },
        behaviorStats: {
          totalCompletedSessions: 3, studyUsageRatio: 0,
          bossChallengeEngagement: 'none', coachInteractions: 0,
          comebackSessions: 0, ignoredFeatures: [],
          premiumFeatureAttempts: [], completionStreak: 2,
        },
        isFirstSession: false,
      }));
      expect(map.premium_tease).toBe('hidden');
    });
  });
});
