import { decideHomeSurfaces } from '../home-surface-decision';
import {
  featureAvailability,
  studyProfile,
  workProfile,
  gameLikeProfile,
  calmProfile,
  baseStats,
} from './home-surface-decision.helpers';

describe('HomeSurfaceDecision', () => {
  describe('Only one spotlight at a time', () => {
    it('ensures at most one spotlight across all surfaces', () => {
      for (const profile of [
        studyProfile,
        workProfile,
        gameLikeProfile,
        calmProfile,
      ]) {
        for (const sessions of [3, 7, 12]) {
          const map = decideHomeSurfaces({
            featureAvailability,
            personalizationProfile: profile,
            behaviorStats: {
              ...baseStats(),
              totalCompletedSessions: sessions,
              studyUsageRatio: 0.5,
              bossChallengeEngagement: 'high',
              coachInteractions: 3,
              completionStreak: 4,
            },
            hasActiveStudyPlan: true,
            hasActiveRecommendation: true,
            hasActiveBoss: false,
            isFirstSession: false,
          });

          const spotlights = Object.entries(map).filter(
            ([, v]) => v === 'spotlight',
          );
          expect(spotlights.length).toBeLessThanOrEqual(1);
        }
      }
    });
  });

  describe('Start Session remains primary CTA', () => {
    it('keeps start_session as primary for most users', () => {
      for (const profile of [workProfile, gameLikeProfile, calmProfile]) {
        for (const sessions of [0, 1, 5, 10]) {
          const map = decideHomeSurfaces({
            featureAvailability,
            personalizationProfile: profile,
            behaviorStats: {
              ...baseStats(),
              totalCompletedSessions: sessions,
              studyUsageRatio: 0.1,
            },
            hasActiveStudyPlan: false,
            hasActiveRecommendation: false,
            hasActiveBoss: false,
            isFirstSession: sessions === 0,
          });

          expect(map.start_session).toBe('primary');
        }
      }
    });

    it('downgrades start_session to secondary only for active study plan users', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: {
          ...baseStats(),
          totalCompletedSessions: 5,
          studyUsageRatio: 0.8,
        },
        hasActiveStudyPlan: true,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });

      expect(map.start_session).toBe('secondary');
      expect(map.study_layer).toBe('spotlight');
    });
  });
});
