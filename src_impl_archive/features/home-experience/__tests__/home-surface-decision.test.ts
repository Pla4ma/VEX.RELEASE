import { decideHomeSurfaces, getPrimarySurface, getSpotlightSurface } from '../home-surface-decision';
import type { HomeSurfaceMap } from '../surface-decision-schemas';

const featureAvailability = { boss: true, challenges: true, premium: true, study: true };

const studyProfile = {
  motivationStyle: 'study_focused' as const,
  primaryGoal: 'study' as const,
  gamificationIntensity: 'medium' as const,
  studyLayerName: 'Study OS',
  userStage: 'new' as const,
};

const workProfile = {
  motivationStyle: 'coach_led' as const,
  primaryGoal: 'work' as const,
  gamificationIntensity: 'minimal' as const,
  studyLayerName: 'Deep Work Plan',
  userStage: 'new' as const,
};

const gameLikeProfile = {
  motivationStyle: 'game_like' as const,
  primaryGoal: 'work' as const,
  gamificationIntensity: 'strong' as const,
  studyLayerName: 'Deep Work Plan',
  userStage: 'new' as const,
};

const calmProfile = {
  motivationStyle: 'calm' as const,
  primaryGoal: 'personal' as const,
  gamificationIntensity: 'minimal' as const,
  studyLayerName: 'Growth Path',
  userStage: 'new' as const,
};

function baseStats() {
  return {
    totalCompletedSessions: 0,
    studyUsageRatio: 0,
    bossChallengeEngagement: 'none' as const,
    coachInteractions: 0,
    comebackSessions: 0,
    ignoredFeatures: [],
    premiumFeatureAttempts: [],
    completionStreak: 0,
  };
}

function surfaceNames(map: HomeSurfaceMap): string[] {
  return Object.entries(map)
    .filter(([, v]) => v !== 'hidden' && v !== 'blocked')
    .map(([k, v]) => `${k}:${v}`);
}

describe('HomeSurfaceDecision', () => {
  describe('Day 0 (zero sessions)', () => {
    it('shows exactly one primary CTA on Day 0', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: baseStats(),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: true,
      });

      const primaries = Object.entries(map).filter(([, v]) => v === 'primary');
      expect(primaries).toHaveLength(1);
      expect(map.start_session).toBe('primary');
    });

    it('shows at most tiny teasers, never a spotlight on Day 0', () => {
      for (const profile of [studyProfile, workProfile, gameLikeProfile, calmProfile]) {
        const map = decideHomeSurfaces({
          featureAvailability,
          personalizationProfile: profile,
          behaviorStats: baseStats(),
          hasActiveStudyPlan: false,
          hasActiveRecommendation: false,
          hasActiveBoss: false,
          isFirstSession: true,
        });

        const spotlights = Object.entries(map).filter(([, v]) => v === 'spotlight');
        expect(spotlights).toHaveLength(0);

        const visible = surfaceNames(map);
        const hasHeavy = visible.some((s) => s.includes('boss_compact') || s.includes('boss_full_cta') || s.includes('spotlight'));
        expect(hasHeavy).toBe(false);
      }
    });

    it('shows unlock strip as tiny_tease on Day 0', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: baseStats(),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: true,
      });

      expect(map.unlock_strip).toBe('tiny_tease');
    });
  });

  describe('Spotlight selection by motivation style', () => {
    it('study-focused user gets study_layer spotlight on engaged', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: { ...baseStats(), totalCompletedSessions: 5, studyUsageRatio: 0.7 },
        hasActiveStudyPlan: true,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });

      expect(getSpotlightSurface(map)).toBe('study_layer');
    });

    it('game-like user with high boss engagement gets boss_compact spotlight', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: gameLikeProfile,
        behaviorStats: { ...baseStats(), totalCompletedSessions: 8, bossChallengeEngagement: 'high' },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: true,
        isFirstSession: false,
      });

      const spot = getSpotlightSurface(map);
      expect(spot === 'boss_compact' || spot === 'boss_teaser').toBe(true);
    });

    it('coach-led user with active recommendation gets coach_presence spotlight', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: workProfile,
        behaviorStats: { ...baseStats(), totalCompletedSessions: 4, coachInteractions: 2 },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: true,
        hasActiveBoss: false,
        isFirstSession: false,
      });

      expect(getSpotlightSurface(map)).toBe('coach_presence');
    });

    it('calm user does not get boss teaser in any form', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: calmProfile,
        behaviorStats: { ...baseStats(), totalCompletedSessions: 10, bossChallengeEngagement: 'high' },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });

      expect(map.boss_teaser).toBe('hidden');
      expect(map.boss_compact).toBe('hidden');
      expect(map.boss_full_cta).toBe('blocked');
    });

    it('calm user with completion streak sees progress spotlight', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: calmProfile,
        behaviorStats: { ...baseStats(), totalCompletedSessions: 7, completionStreak: 5 },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });

      expect(getSpotlightSurface(map)).toBe('progress_proof');
    });
  });

  describe('Only one spotlight at a time', () => {
    it('ensures at most one spotlight across all surfaces', () => {
      for (const profile of [studyProfile, workProfile, gameLikeProfile, calmProfile]) {
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

          const spotlights = Object.entries(map).filter(([, v]) => v === 'spotlight');
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
            behaviorStats: { ...baseStats(), totalCompletedSessions: sessions, studyUsageRatio: 0.1 },
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
        behaviorStats: { ...baseStats(), totalCompletedSessions: 5, studyUsageRatio: 0.8 },
        hasActiveStudyPlan: true,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });

      expect(map.start_session).toBe('secondary');
      expect(map.study_layer).toBe('spotlight');
    });
  });

  describe('Premium rules', () => {
    it('hides premium before value is proven', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: workProfile,
        behaviorStats: { ...baseStats(), totalCompletedSessions: 3, premiumFeatureAttempts: [] },
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
        behaviorStats: { ...baseStats(), totalCompletedSessions: 6, premiumFeatureAttempts: ['weekly_intelligence'] },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });

      expect(map.premium_tease).toBe('tiny_tease');
    });
  });
});
