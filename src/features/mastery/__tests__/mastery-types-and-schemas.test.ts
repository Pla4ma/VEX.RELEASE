/**
 * Mastery Feature — Types & Schemas Tests
 */

import type { MasteryState } from "../types";
import { MASTERY_RANK_THRESHOLDS } from "../types";
import { TECHNIQUE_KEYS, rankSchema, challengeSchema, masteryStateSchema } from "../schemas";

describe("Mastery Types & Schemas", () => {
  it("MASTERY_RANK_THRESHOLDS defines all 5 ranks", () => {
    expect(Object.keys(MASTERY_RANK_THRESHOLDS)).toEqual([
      "APPRENTICE",
      "ADEPT",
      "EXPERT",
      "MASTER",
      "GRANDMASTER",
    ]);
    expect(MASTERY_RANK_THRESHOLDS.APPRENTICE).toBe(0);
    expect(MASTERY_RANK_THRESHOLDS.GRANDMASTER).toBe(100);
  });

  it("rankSchema validates all valid ranks", () => {
    for (const rank of [
      "APPRENTICE",
      "ADEPT",
      "EXPERT",
      "MASTER",
      "GRANDMASTER",
    ]) {
      expect(rankSchema.parse(rank)).toBe(rank);
    }
    expect(() => rankSchema.parse("INVALID")).toThrow();
  });

  it("challengeSchema validates a complete challenge", () => {
    const challenge = {
      id: "ch-1",
      technique: "durationMastery",
      title: "Test",
      description: "Desc",
      difficulty: "EASY",
      target: 10,
      current: 0,
      unit: "sessions",
      masteryPoints: 3,
      status: "ACTIVE",
      completedAt: null,
    };
    expect(challengeSchema.parse(challenge)).toEqual(challenge);
  });

  it("masteryStateSchema validates a complete state", () => {
    const state: MasteryState = {
      userId: "user-1",
      totalMasteryPoints: 10,
      rank: "ADEPT",
      techniques: {
        durationMastery: 5,
        purityMastery: 2,
        consistencyMastery: 2,
        comebackMastery: 1,
        bossMastery: 0,
      },
      activeChallenges: [],
      unlockedFeatures: [],
      updatedAt: Date.now(),
    };
    expect(masteryStateSchema.parse(state)).toEqual(state);
  });

  it("masteryStateSchema rejects technique value > 25", () => {
    const bad = {
      userId: "u",
      totalMasteryPoints: 0,
      rank: "APPRENTICE",
      techniques: {
        durationMastery: 30,
        purityMastery: 0,
        consistencyMastery: 0,
        comebackMastery: 0,
        bossMastery: 0,
      },
      activeChallenges: [],
      unlockedFeatures: [],
      updatedAt: 1,
    };
    expect(() => masteryStateSchema.parse(bad)).toThrow();
  });

  it("TECHNIQUE_KEYS contains all 5 technique keys", () => {
    expect(TECHNIQUE_KEYS).toEqual([
      "durationMastery",
      "purityMastery",
      "consistencyMastery",
      "comebackMastery",
      "bossMastery",
    ]);
  });
});
