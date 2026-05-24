/**
 * TASK 4 — Feature Health Surface Gating tests
 *
 * Verifies degraded features block unsafe surfaces.
 */
import { decideHomeSurfaces } from '../../home-experience/home-surface-decision';
import { getFeatureAvailability, isFeatureAvailableForNavigation, type DegradedFeatureKey, getDegradedBlockedSurfaces, shouldBlockFullSurface, getDegradedFallbackSurface } from '../feature-availability';

const featureAvailability = { boss: true, challenges: true, premium: true, study: true };
const studyProfile = {
  motivationStyle: 'study_focused' as const,
  primaryGoal: 'study' as const,
  gamificationIntensity: 'medium' as const,
  studyLayerName: 'Study OS',
  userStage: 'new' as const,
};
const gameLikeProfile = {
  motivationStyle: 'game_like' as const,
  primaryGoal: 'work' as const,
  gamificationIntensity: 'strong' as const,
  studyLayerName: 'Deep Work Plan',
  userStage: 'new' as const,
};
const workProfile = {
  motivationStyle: 'coach_led' as const,
  primaryGoal: 'work' as const,
  gamificationIntensity: 'minimal' as const,
  studyLayerName: 'Deep Work Plan',
  userStage: 'new' as const,
};

function baseStats(overrides: Partial<ReturnType<typeof baseStats>> = {}) {
  return {
    totalCompletedSessions: 8,
    studyUsageRatio: 0.2,
    bossChallengeEngagement: 'medium' as const,
    coachInteractions: 2,
    comebackSessions: 0,
    ignoredFeatures: [],
    premiumFeatureAttempts: [],
    completionStreak: 3,
    ...overrides,
  };
}

describe('FeatureHealth surface gating', () => {
  describe('Degraded Content Study hides upload CTA / study layer', () => {
    it('study_layer blocked when content_study is degraded', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: baseStats({ totalCompletedSessions: 5, studyUsageRatio: 0.5 }),
        hasActiveStudyPlan: true,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        degradedFeatures: ['content_study'],
      });

      expect(map.study_layer === 'hidden' || map.study_layer === 'blocked').toBe(true);
    });

    it('study_layer visible when content_study is healthy', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: baseStats({ totalCompletedSessions: 5, studyUsageRatio: 0.5 }),
        hasActiveStudyPlan: true,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        degradedFeatures: [],
      });

      expect(map.study_layer).toBe('spotlight');
    });
  });

  describe('Degraded AI Coach Advanced falls back to basic coach', () => {
    it('coach_presence downgraded when ai_coach_advanced is degraded', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: workProfile,
        behaviorStats: baseStats({ coachInteractions: 3 }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: true,
        hasActiveBoss: false,
        isFirstSession: false,
        degradedFeatures: ['ai_coach_advanced'],
      });

      expect(map.coach_presence).not.toBe('spotlight');
    });

    it('coach_presence can be spotlight when healthy', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: workProfile,
        behaviorStats: baseStats({ coachInteractions: 3 }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: true,
        hasActiveBoss: false,
        isFirstSession: false,
        degradedFeatures: [],
      });

      // coach_presence can be spotlight or tiny_tease depending on home surface algorithm
      expect(['spotlight', 'tiny_tease', 'compact']).toContain(map.coach_presence);
    });
  });

  describe('Degraded Premium hides purchasable plans', () => {
    it('premium_tease hidden when premium_paywall is degraded', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: baseStats({ totalCompletedSessions: 6, premiumFeatureAttempts: ['weekly_intelligence'] }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        degradedFeatures: ['premium_paywall'],
      });

      expect(map.premium_tease).toBe('hidden');
    });

    it('premium_tease visible when premium is healthy and user shows intent', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: baseStats({ totalCompletedSessions: 6, premiumFeatureAttempts: ['weekly_intelligence'] }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        degradedFeatures: [],
      });

      expect(map.premium_tease).toBe('tiny_tease');
    });
  });

  describe('Degraded Boss blocks full boss route', () => {
    it('boss_full_cta blocked when boss_tab is degraded', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: gameLikeProfile,
        behaviorStats: baseStats({ bossChallengeEngagement: 'high' }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: true,
        isFirstSession: false,
        degradedFeatures: ['boss_tab'],
      });

      expect(map.boss_full_cta).toBe('blocked');
    });

    it('boss_compact downgraded from spotlight when boss_tab is degraded', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: gameLikeProfile,
        behaviorStats: baseStats({ bossChallengeEngagement: 'high' }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: true,
        isFirstSession: false,
        degradedFeatures: ['boss_tab'],
      });

      expect(map.boss_compact).not.toBe('spotlight');
    });
  });

  describe('FeatureAvailability downgrades every degraded feature', () => {
    it('degraded feature blocks navigation', () => {
      const degradedAccess = {
        isUnlocked: true,
        isVisible: true,
        isDegraded: true,
        lockedDescription: 'Degraded due to health check',
        unlockReason: 'Feature is available but running in limited mode',
        releaseState: 'final_release_progressive' as const,
      };

      const availability = getFeatureAvailability(degradedAccess);
      expect(isFeatureAvailableForNavigation(availability)).toBe(false);
      expect(availability.canNavigate).toBe(false);
      expect(availability.state).toBe('degraded');
    });

    it('healthy feature allows navigation', () => {
      const healthyAccess = {
        isUnlocked: true,
        isVisible: true,
        lockedDescription: '',
        unlockReason: 'Unlocked',
        releaseState: 'final_release_progressive' as const,
      };

      const availability = getFeatureAvailability(healthyAccess);
      expect(isFeatureAvailableForNavigation(availability)).toBe(true);
      expect(availability.state).toBe('unlocked');
    });
  });

  describe('DegradedFeatureKey utility functions', () => {
    it('getDegradedBlockedSurfaces returns correct surfaces', () => {
      const blocked = getDegradedBlockedSurfaces(['content_study', 'premium_paywall']);
      expect(blocked).toContain('study_layer');
      expect(blocked).toContain('upload_cta');
      expect(blocked).toContain('premium_tease');
      expect(blocked).toContain('purchasable_plan');
    });

    it('shouldBlockFullSurface returns true for degraded features', () => {
      expect(shouldBlockFullSurface('content_study', true)).toBe(true);
      expect(shouldBlockFullSurface('content_study', false)).toBe(false);
    });

    it('getDegradedFallbackSurface returns correct fallback', () => {
      expect(getDegradedFallbackSurface('content_study')).toBe('start_session');
      expect(getDegradedFallbackSurface('ai_coach_advanced')).toBe('coach_presence');
      expect(getDegradedFallbackSurface('premium_paywall')).toBe('start_session');
      expect(getDegradedFallbackSurface('boss_tab')).toBe('boss_teaser');
    });
  });
});
