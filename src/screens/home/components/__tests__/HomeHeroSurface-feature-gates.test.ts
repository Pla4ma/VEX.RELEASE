import {
  decideHomeSurfaces,
  featureAvailability,
  gameLikeProfile,
  studyProfile,
  calmFirstWeek,
  baseStats,
} from './HomeHeroSurfaceGating-helpers';

describe('HomeHeroSurfaceGating — feature surface gates', () => {
  describe('Day 0 user always gets Start First Session as primary', () => {
    it('Day 0 surface map has start_session as primary', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: gameLikeProfile,
        behaviorStats: baseStats(),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: true,
      });
      expect(map.start_session).toBe('primary');
    });

    it('Day 0 firstWeek has START_SESSION primary CTA', () => {
      const fw = calmFirstWeek();
      expect(fw.currentDayStage).toBe('DAY_0_NOT_STARTED');
      expect(fw.primaryCTA.intent).toBe('START_SESSION');
    });
  });

  describe('HomePriority OPEN_CHALLENGES is filtered when challenges surface blocked', () => {
    it('challenges surface blocked when feature unavailable', () => {
      const map = decideHomeSurfaces({
        featureAvailability: { ...featureAvailability, challenges: false },
        personalizationProfile: gameLikeProfile,
        behaviorStats: baseStats({ totalCompletedSessions: 8 }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });
      const challengesBlocked =
        (map.challenge_teaser === 'hidden' ||
          map.challenge_teaser === 'blocked') &&
        (map.weekly_quest === 'hidden' || map.weekly_quest === 'blocked');
      expect(challengesBlocked).toBe(true);
    });
  });

  describe('Premium CTA is blocked before value', () => {
    it('premium_tease hidden when no sessions or attempts', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: baseStats({
          totalCompletedSessions: 3,
          premiumFeatureAttempts: [],
        }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });
      expect(map.premium_tease).toBe('hidden');
    });
  });

  describe('Study CTA only appears when study_layer surface allowed', () => {
    it('study_layer visible for study user', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: baseStats({
          totalCompletedSessions: 5,
          studyUsageRatio: 0.5,
        }),
        hasActiveStudyPlan: true,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });
      expect(map.study_layer).toBe('spotlight');
    });

    it('study_layer hidden for non-study user', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: gameLikeProfile,
        behaviorStats: baseStats({
          totalCompletedSessions: 5,
          studyUsageRatio: 0,
        }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });
      expect(map.study_layer).toBe('hidden');
    });
  });
});
