import { decideHomeSurfaces } from '../home-surface-decision';
import {
  featureAvailability,
  workProfile,
  baseStats,
} from './home-surface-decision.helpers';

describe('HomeSurfaceDecision', () => {
  describe('Premium rules', () => {
    it('hides premium before value is proven', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: workProfile,
        behaviorStats: {
          ...baseStats(),
          totalCompletedSessions: 3,
          premiumFeatureAttempts: [],
        },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });

      expect(map.premium_tease).toBe('hidden');
    });

    it('shows premium tiny_tease after user shows intent', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: workProfile,
        behaviorStats: {
          ...baseStats(),
          totalCompletedSessions: 6,
          premiumFeatureAttempts: ['weekly_intelligence'],
        },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });

      expect(map.premium_tease).toBe('tiny_tease');
    });
  });
});
