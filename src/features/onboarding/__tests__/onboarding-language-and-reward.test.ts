/**
 * Comprehensive Onboarding Feature Tests — Language Tier & Reward Alignment
 */

import "./onboarding-mock-setup";

import {
  getLanguageTier,
  getActiveLanguage,
  GENTLE_LANGUAGE,
  INTENSE_LANGUAGE,
} from "../language-tier";

import {
  getRewardAlignment,
  getRewardWhy,
  REWARD_ALIGNMENTS,
} from "../reward-alignment";

// ── Language Tier ──────────────────────────────────────────────────────────────

describe("Language Tier", () => {
  describe("getLanguageTier", () => {
    it("returns gentle for calm profile", () => {
      expect(getLanguageTier("calm")).toBe("gentle");
    });

    it("returns gentle for friendly profile", () => {
      expect(getLanguageTier("friendly")).toBe("gentle");
    });

    it("returns gentle for study_focused profile", () => {
      expect(getLanguageTier("study_focused")).toBe("gentle");
    });

    it("returns intense for game_like profile", () => {
      expect(getLanguageTier("game_like")).toBe("intense");
    });

    it("returns intense for competitive profile", () => {
      expect(getLanguageTier("competitive")).toBe("intense");
    });

    it("returns intense for intense profile", () => {
      expect(getLanguageTier("intense")).toBe("intense");
    });

    it("returns gentle for null", () => {
      expect(getLanguageTier(null)).toBe("gentle");
    });

    it("returns gentle for undefined", () => {
      expect(getLanguageTier(undefined)).toBe("gentle");
    });
  });

  describe("getActiveLanguage", () => {
    it("returns gentle language for gentle tier", () => {
      const lang = getActiveLanguage("gentle");
      expect(lang).toBe(GENTLE_LANGUAGE);
      expect(lang.streakBrokenTitle).toBe("Your streak paused");
    });

    it("returns intense language for intense tier", () => {
      const lang = getActiveLanguage("intense");
      expect(lang).toBe(INTENSE_LANGUAGE);
      expect(lang.streakBrokenTitle).toBe("Streak broken");
    });
  });
});

// ── Reward Alignment ──────────────────────────────────────────────────────────

describe("Reward Alignment", () => {
  describe("getRewardAlignment", () => {
    it("finds existing reward alignment", () => {
      const alignment = getRewardAlignment("session_complete");
      expect(alignment).toBeDefined();
      expect(alignment!.pointsTo).toBe("consistency");
    });

    it("returns undefined for unknown reward", () => {
      const alignment = getRewardAlignment("nonexistent");
      expect(alignment).toBeUndefined();
    });
  });

  describe("getRewardWhy", () => {
    it("returns earnedBecause for existing reward", () => {
      const why = getRewardWhy("session_complete");
      expect(why).toBe(
        "You showed up and focused. That is the only thing that matters.",
      );
    });

    it("returns default message for unknown reward", () => {
      const why = getRewardWhy("nonexistent");
      expect(why).toBe("You earned this through focused work.");
    });
  });

  it("has at least 5 reward alignments", () => {
    expect(REWARD_ALIGNMENTS.length).toBeGreaterThanOrEqual(5);
  });
});
