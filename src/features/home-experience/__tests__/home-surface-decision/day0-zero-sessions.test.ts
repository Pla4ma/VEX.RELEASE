import {
  decideHomeSurfaces,
  featureAvailability,
  studyProfile,
  workProfile,
  gameLikeProfile,
  calmProfile,
  baseStats,
  surfaceNames,
} from "./helpers";

describe("HomeSurfaceDecision", () => {
  describe("Day 0 (zero sessions)", () => {
    it("shows exactly one primary CTA on Day 0", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: baseStats(),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: true,
      });

      const primaries = Object.entries(map).filter(([, v]) => v === "primary");
      expect(primaries).toHaveLength(1);
      expect(map.start_session).toBe("primary");
    });

    it("shows at most tiny teasers, never a spotlight on Day 0", () => {
      for (const profile of [
        studyProfile,
        workProfile,
        gameLikeProfile,
        calmProfile,
      ]) {
        const map = decideHomeSurfaces({
          featureAvailability,
          personalizationProfile: profile,
          behaviorStats: baseStats(),
          hasActiveStudyPlan: false,
          hasActiveRecommendation: false,
          hasActiveBoss: false,
          isFirstSession: true,
        });

        const spotlights = Object.entries(map).filter(
          ([, v]) => v === "spotlight",
        );
        expect(spotlights).toHaveLength(0);

        const visible = surfaceNames(map);
        const hasHeavy = visible.some(
          (s) =>
            s.includes("boss_compact") ||
            s.includes("boss_full_cta") ||
            s.includes("spotlight"),
        );
        expect(hasHeavy).toBe(false);
      }
    });

    it("shows unlock strip as tiny_tease on Day 0", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: baseStats(),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: true,
      });

      expect(map.unlock_strip).toBe("tiny_tease");
    });
  });
});
