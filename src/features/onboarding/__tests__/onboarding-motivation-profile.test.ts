/**
 * Comprehensive Onboarding Feature Tests — Motivation Profile Derivation
 */

import "./onboarding-mock-setup";

import {
  deriveMotivationProfile,
} from "../store-helpers";

// ── Store Helpers ──────────────────────────────────────────────────────────────

describe("Store Helpers", () => {
  describe("deriveMotivationProfile", () => {
    it("returns explicit style when set", () => {
      const profile = deriveMotivationProfile(
        "WORK",
        "mentor",
        "FLAME",
        "competitive",
      );
      expect(profile.primary).toBe("competitive");
    });

    it("derives STUDY → study_focused", () => {
      const profile = deriveMotivationProfile("STUDY", null, null, null);
      expect(profile.primary).toBe("study_focused");
    });

    it("derives WORK → worker", () => {
      const profile = deriveMotivationProfile("WORK", null, null, null);
      expect(profile.primary).toBe("worker");
    });

    it("derives CREATIVE → creator", () => {
      const profile = deriveMotivationProfile("CREATIVE", null, null, null);
      expect(profile.primary).toBe("creator");
    });

    it("derives PERSONAL → calm", () => {
      const profile = deriveMotivationProfile("PERSONAL", null, null, null);
      expect(profile.primary).toBe("calm");
    });

    it("defaults to calm when no goal", () => {
      const profile = deriveMotivationProfile(null, null, null, null);
      expect(profile.primary).toBe("calm");
    });

    it("adds intense for drill-sergeant persona", () => {
      const profile = deriveMotivationProfile(
        "WORK",
        "drill-sergeant",
        null,
        null,
      );
      expect(profile.secondary).toContain("intense");
    });

    it("adds friendly for cheerleader persona", () => {
      const profile = deriveMotivationProfile(
        "WORK",
        "cheerleader",
        null,
        null,
      );
      expect(profile.secondary).toContain("friendly");
    });

    it("adds coach_led for mentor persona", () => {
      const profile = deriveMotivationProfile("WORK", "mentor", null, null);
      expect(profile.secondary).toContain("coach_led");
    });

    it("adds game_like and intense for FLAME element", () => {
      const profile = deriveMotivationProfile(
        "WORK",
        null,
        "FLAME",
        null,
      );
      expect(profile.secondary).toContain("game_like");
      expect(profile.secondary).toContain("intense");
    });

    it("adds calm for WAVE element", () => {
      const profile = deriveMotivationProfile("WORK", null, "WAVE", null);
      expect(profile.secondary).toContain("calm");
    });

    it("adds worker for TERRA element", () => {
      const profile = deriveMotivationProfile("WORK", null, "TERRA", null);
      expect(profile.secondary).toContain("worker");
    });

    it("adds friendly for ZEPHYR element", () => {
      const profile = deriveMotivationProfile("WORK", null, "ZEPHYR", null);
      expect(profile.secondary).toContain("friendly");
    });

    it("adds intense and competitive for VOID element", () => {
      const profile = deriveMotivationProfile("WORK", null, "VOID", null);
      expect(profile.secondary).toContain("intense");
      expect(profile.secondary).toContain("competitive");
    });

    it("adds study_focused for LUMINA element (default)", () => {
      const profile = deriveMotivationProfile(null, null, null, null);
      expect(profile.secondary).toContain("study_focused");
    });
  });
});
