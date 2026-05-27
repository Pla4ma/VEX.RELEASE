import {
  decideHomeSurfaces,
  featureAvailability,
  calmProfile,
  gameLikeProfile,
  calmFirstWeek,
  bossAvailableFirstWeek,
  baseStats,
} from './HomeHeroSurfaceGating-helpers';

describe('HomeHeroSurfaceGating — boss CTA gating', () => {
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

  describe('HomePriority OPEN_BOSS is filtered when surfaceMap blocks boss', () => {
    it('surfaceMap blocks boss_compact and boss_full_cta for blocked configurations', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: calmProfile,
        behaviorStats: baseStats({ totalCompletedSessions: 10 }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });

      const bossBlocked =
        (map.boss_compact === 'hidden' || map.boss_compact === 'blocked') &&
        (map.boss_full_cta === 'hidden' || map.boss_full_cta === 'blocked');
      expect(bossBlocked).toBe(true);
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
