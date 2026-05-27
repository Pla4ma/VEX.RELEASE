import {
  decideHomeSurfaces,
  featureAvailability,
  studyProfile,
  gameLikeProfile,
  calmProfile,
  coachProfile,
  baseStats,
  makeDay0Map,
} from './helpers';

describe('Day 0 Surface Policy', () => {
  describe('Day 0 personalization', () => {
    it('coach_led gets coach_presence as tiny_tease', () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: coachProfile,
        behaviorStats: baseStats(),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: true,
      });
      expect(map.coach_presence).toBe('tiny_tease');
    });

    it('shows unlock_strip on Day 0', () => {
      const map = makeDay0Map();
      expect(map.unlock_strip).toBe('tiny_tease');
    });

    it('all visible surfaces are valid decision values', () => {
      const map = makeDay0Map();
      const allowed = ['primary', 'secondary', 'spotlight', 'tiny_tease', 'hidden', 'blocked'];
      for (const [, val] of Object.entries(map)) {
        expect(allowed).toContain(val);
      }
    });

    it('start_session is always primary on Day 0', () => {
      for (const profile of [studyProfile, gameLikeProfile, calmProfile, coachProfile]) {
        const map = decideHomeSurfaces({
          featureAvailability,
          personalizationProfile: profile,
          behaviorStats: baseStats(),
          hasActiveStudyPlan: false,
          hasActiveRecommendation: false,
          hasActiveBoss: false,
          isFirstSession: true,
        });
        expect(map.start_session).toBe('primary');
      }
    });
  });
});
