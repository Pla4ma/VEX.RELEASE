import {
  decideHomeSurfaces,
  featureAvailability,
  studyProfile,
  gameLikeProfile,
  calmProfile,
  baseStats,
  makeDay0Map,
  visibleCount,
} from './helpers';

describe('Day 0 Surface Policy', () => {
  describe('decideHomeSurfaces enforces policy', () => {
    it('Day 0 Home renders 3-5 visible elements', () => {
      const map = makeDay0Map();
      const count = visibleCount(map);
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(5);
    });

    it('Day 0 has exactly one primary CTA', () => {
      const map = makeDay0Map();
      const primaries = Object.entries(map).filter(([, v]) => v === 'primary');
      expect(primaries).toHaveLength(1);
      expect(map.start_session).toBe('primary');
    });

    it('Day 0 does not render battle pass / shop / squad', () => {
      const map = makeDay0Map();
      expect(map.study_layer).not.toBe('secondary');
      expect(map.study_layer).not.toBe('primary');
      expect(map.boss_compact).not.toBe('secondary');
      expect(map.boss_compact).not.toBe('primary');
      expect(map.challenge_teaser).toMatch(/hidden|blocked/);
      expect(map.weekly_quest).toMatch(/hidden|blocked/);
    });

    it('Day 0 does not render full boss card', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: gameLikeProfile,
        behaviorStats: { ...baseStats(), bossChallengeEngagement: 'high' },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: true,
        isFirstSession: true,
      });
      expect(map.boss_full_cta).toMatch(/hidden|blocked/);
      expect(map.boss_compact).toMatch(/hidden|blocked/);
    });

    it('Day 0 does not render premium paywall', () => {
      const map = makeDay0Map();
      expect(map.premium_tease).toMatch(/hidden|blocked/);
    });

    it('Game-like Day 0 can show tiny boss teaser', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: gameLikeProfile,
        behaviorStats: { ...baseStats(), bossChallengeEngagement: 'medium' },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: true,
      });
      expect(map.boss_teaser).toBe('tiny_tease');
    });

    it('Calm Day 0 hides boss entirely', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: calmProfile,
        behaviorStats: { ...baseStats(), bossChallengeEngagement: 'medium' },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: true,
      });
      expect(map.boss_teaser).toBe('hidden');
      expect(map.boss_compact).toBe('hidden');
    });

    it('Study Day 0 can show study_layer as tiny_tease but not as full card', () => {
      const map = makeDay0Map();
      const val = map.study_layer as string;
      expect(val === 'hidden' || val === 'tiny_tease').toBe(true);
      expect(val).not.toBe('secondary');
      expect(val).not.toBe('primary');
    });
  });
});
