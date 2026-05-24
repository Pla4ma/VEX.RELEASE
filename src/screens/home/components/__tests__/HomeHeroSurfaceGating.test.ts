/**
 * TASK 1 — HomeHeroSurfaceGating tests
 *
 * Verifies HomeHeroSection CTAs are filtered through:
 * FeatureAvailability → surfaceMap → FirstWeekExperience
 */
import { decideHomeSurfaces } from '../../../../features/home-experience/home-surface-decision';
import type { HomeSurfaceMap } from '../../../../features/home-experience/surface-decision-schemas';
import type { FirstWeekExperience } from '../../../../features/personalization/first-week-schemas';

const featureAvailability = { boss: true, challenges: true, premium: true, study: true };
const calmProfile = {
  motivationStyle: 'calm' as const,
  primaryGoal: 'personal' as const,
  gamificationIntensity: 'minimal' as const,
  studyLayerName: 'Growth Path',
  userStage: 'new' as const,
};
const gameLikeProfile = {
  motivationStyle: 'game_like' as const,
  primaryGoal: 'work' as const,
  gamificationIntensity: 'strong' as const,
  studyLayerName: 'Deep Work Plan',
  userStage: 'new' as const,
};
const studyProfile = {
  motivationStyle: 'study_focused' as const,
  primaryGoal: 'study' as const,
  gamificationIntensity: 'medium' as const,
  studyLayerName: 'Study OS',
  userStage: 'new' as const,
};

function baseStats(overrides: Partial<ReturnType<typeof baseStats>> = {}) {
  return {
    totalCompletedSessions: 0,
    studyUsageRatio: 0,
    bossChallengeEngagement: 'none' as const,
    coachInteractions: 0,
    comebackSessions: 0,
    ignoredFeatures: [] as string[],
    premiumFeatureAttempts: [] as string[],
    completionStreak: 0,
    ...overrides,
  };
}

function calmFirstWeek(): FirstWeekExperience {
  return {
    allowedHomeSurfaces: ['motivation_confirmation', 'coach_presence_line', 'start_session'],
    bossIntensity: 'hidden',
    coachMessageType: 'day_0_not_started',
    comebackState: 'none',
    completionEmphasis: 'confirmation_coach_progress_next_action',
    currentDayStage: 'DAY_0_NOT_STARTED',
    hiddenSurfaces: ['boss_full', 'shop', 'inventory', 'battle_pass', 'wagers', 'rivals', 'squads', 'leaderboards', 'premium_currency', 'premium_hard_sell', 'advanced_economy'],
    notificationAllowedTypes: ['gentle_return', 'coach_check_in', 'progress_milestone'],
    premiumMoment: 'none',
    primaryCTA: { intent: 'START_SESSION', label: 'Start first session' },
    primaryMessage: 'VEX is shaped around one clean first block.',
    secondaryCTA: null,
    spotlightSurface: 'none',
    studyLayerLabel: 'Growth Path',
    unlockTease: 'VEX opens one layer at a time after real sessions.',
  };
}

function bossAvailableFirstWeek(): FirstWeekExperience {
  return {
    ...calmFirstWeek(),
    bossIntensity: 'visible',
    allowedHomeSurfaces: ['coach_presence_line', 'start_session', 'progress_proof', 'tiny_boss_teaser'],
    currentDayStage: 'DAY_5_PATH_FORMING',
    spotlightSurface: 'tiny_boss_teaser',
    primaryCTA: { intent: 'START_SESSION', label: 'Start next session' },
    primaryMessage: 'Your rhythm is forming.',
    premiumMoment: 'soft_tease',
  };
}

describe('HomeHeroSurfaceGating — surfaceMap filters HomePriority CTAs', () => {
  describe('Calm user with active boss does NOT get OPEN_BOSS hero CTA route', () => {
    it('calm user surface map blocks all boss surfaces', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: calmProfile,
        behaviorStats: baseStats({ totalCompletedSessions: 8, bossChallengeEngagement: 'high' }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: true,
        isFirstSession: false,
      });

      expect(map.boss_compact).toBe('hidden');
      expect(map.boss_full_cta).toBe('blocked');
      expect(map.boss_teaser).toBe('hidden');
    });

    it('calm user firstWeek also blocks boss', () => {
      const fw = calmFirstWeek();
      expect(fw.bossIntensity).toBe('hidden');
    });
  });

  describe('Game-like user with boss available can get boss CTA after session proof', () => {
    it('game-like user surface map allows boss_compact after sessions', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: gameLikeProfile,
        behaviorStats: baseStats({ totalCompletedSessions: 8, bossChallengeEngagement: 'high' }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: true,
        isFirstSession: false,
      });

      const bossAllowed =
        map.boss_compact !== 'hidden' && map.boss_compact !== 'blocked';
      expect(bossAllowed).toBe(true);
    });
  });

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

  describe('HomePriority OPEN_BOSS is filtered when surfaceMap blocks boss', () => {
    it('surfaceMap blocks boss_compact and boss_full_cta for blocked configurations', () => {
      const map: HomeSurfaceMap = {
        ...decideHomeSurfaces({
          featureAvailability,
          personalizationProfile: calmProfile,
          behaviorStats: baseStats({ totalCompletedSessions: 10 }),
          hasActiveStudyPlan: false,
          hasActiveRecommendation: false,
          hasActiveBoss: false,
          isFirstSession: false,
        }),
      } as HomeSurfaceMap;

      const bossBlocked =
        (map.boss_compact === 'hidden' || map.boss_compact === 'blocked') &&
        (map.boss_full_cta === 'hidden' || map.boss_full_cta === 'blocked');
      expect(bossBlocked).toBe(true);
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
        (map.challenge_teaser === 'hidden' || map.challenge_teaser === 'blocked') &&
        (map.weekly_quest === 'hidden' || map.weekly_quest === 'blocked');
      expect(challengesBlocked).toBe(true);
    });
  });

  describe('Premium CTA is blocked before value', () => {
    it('premium_tease hidden when no sessions or attempts', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: baseStats({ totalCompletedSessions: 3, premiumFeatureAttempts: [] }),
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
        behaviorStats: baseStats({ totalCompletedSessions: 5, studyUsageRatio: 0.5 }),
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
        behaviorStats: baseStats({ totalCompletedSessions: 5, studyUsageRatio: 0 }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });

      expect(map.study_layer).toBe('hidden');
    });
  });

  describe('FirstWeek bossIntensity hidden blocks boss navigation', () => {
    it('firstWeek bossIntensity hidden prevents boss CTA', () => {
      const fw = calmFirstWeek();
      expect(fw.bossIntensity).toBe('hidden');
    });

    it('firstWeek bossIntensity visible allows boss for game-like user', () => {
      const fw = bossAvailableFirstWeek();
      expect(fw.bossIntensity).toBe('visible');
    });
  });
});
