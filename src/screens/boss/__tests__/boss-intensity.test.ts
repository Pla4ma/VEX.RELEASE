import {
  resolveBossIntensity,
  calmProfile,
  gameLikeProfile,
  intenseProfile,
  studyFocusedProfile,
  baseStats,
} from "./boss-helpers";
import type {
  BehaviorStats,
  VexPersonalizationProfile,
} from "../../../features/personalization/schemas";

describe("boss intensity with real engagement signals", () => {
  it("game-like + high boss engagement = game-like intensity", () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: "high",
    };
    expect(resolveBossIntensity(gameLikeProfile, stats)).toBe("game-like");
  });

  it("game-like + low boss engagement = game-like (profile driven)", () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: "low",
    };
    expect(resolveBossIntensity(gameLikeProfile, stats)).toBe("game-like");
  });

  it("calm + any boss engagement = subtle", () => {
    const highEngagement: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: "high",
    };
    expect(resolveBossIntensity(calmProfile, highEngagement)).toBe("subtle");
  });

  it("intense + high boss engagement = intense (full boss)", () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: "high",
    };
    expect(resolveBossIntensity(intenseProfile, stats)).toBe("intense");
  });

  it("ignored boss is reflected via bossChallengeEngagement none", () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: "none",
      ignoredFeatures: ["boss_tab"],
    };
    expect(resolveBossIntensity(gameLikeProfile, stats)).toBe("game-like");
  });

  it("study-heavy user defaults to subtle regardless of engagement", () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: "high",
      studyUsageRatio: 0.8,
    };
    expect(resolveBossIntensity(studyFocusedProfile, stats)).toBe("subtle");
  });

  it("calm with ignored boss stays subtle", () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: "none",
      ignoredFeatures: ["boss_tab"],
    };
    expect(resolveBossIntensity(calmProfile, stats)).toBe("subtle");
  });

  it("medium engagement on friendly profile returns standard (engagement-driven)", () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: "medium",
    };
    const friendlyProfile: VexPersonalizationProfile = {
      ...calmProfile,
      motivationStyle: "friendly",
    };
    expect(resolveBossIntensity(friendlyProfile, stats)).toBe("standard");
  });

  it("high engagement on coach_led profile returns game-like", () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: "high",
    };
    const coachProfile: VexPersonalizationProfile = {
      ...calmProfile,
      motivationStyle: "coach_led",
      preferredTone: "strategic",
      coachMode: "mentor",
    };
    expect(resolveBossIntensity(coachProfile, stats)).toBe("game-like");
  });
});
