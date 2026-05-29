/**
 * Mastery Feature — Comprehensive Tests
 *
 * Covers: types, schemas, xp-calculator, mastery-helpers, service,
 *         unlock-gate-data, SGradeStreakTracker, analytics, challenge-generator
 */

import type { MasteryRank, MasteryState } from "../types";
import { MASTERY_RANK_THRESHOLDS, getMasteryRankDisplay } from "../types";
import { calculateTechniqueXp } from "../xp-calculator";
import {
  resolveRank,
  createDefaultState,
  updateChallengeProgress,
  type TechniqueXpGains,
} from "../mastery-helpers";
import {
  isFeatureUnlocked,
  getRequiredRank,
  getPointsToUnlock,
  RANK_UNLOCKS,
} from "../components/mastery-unlock-gate-data";
import { isSGradeMilestone } from "../SGradeStreakTracker";
import { TECHNIQUE_KEYS, rankSchema, challengeSchema, masteryStateSchema } from "../schemas";
import { MasteryService, recordSessionMasteryProgress } from "../service";

// ─── Mock repository ─────────────────────────────────────────────
jest.mock("../repository", () => ({
  loadStoredMasteryState: jest.fn().mockReturnValue(null),
  loadMasteryState: jest.fn().mockResolvedValue(null),
  persistMasteryState: jest.fn((state: Record<string, unknown>) => ({ ...state, updatedAt: Date.now() })),
}));

jest.mock("../../../persistence/MMKVStorageAdapter", () => ({
  getDefaultStorageAdapter: () => ({
    getJSONSync: jest.fn().mockReturnValue(null),
    setJSONSync: jest.fn(),
  }),
}));

jest.mock("../../../persistence/MMKVStorage", () => ({
  getMMKVStorage: () => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock("../../../config/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      upsert: jest.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

jest.mock("../../../utils/silent-failure", () => ({
  captureSilentFailure: jest.fn(),
}));

jest.mock("../challenge-generator", () => ({
  generateMasteryChallenges: jest.fn().mockReturnValue([
    {
      id: "test-challenge-1",
      technique: "durationMastery",
      title: "Test Challenge",
      description: "A test challenge",
      difficulty: "EASY",
      target: 10,
      current: 0,
      unit: "sessions",
      masteryPoints: 3,
      status: "ACTIVE",
      completedAt: null,
    },
    {
      id: "test-challenge-2",
      technique: "purityMastery",
      title: "Test Challenge 2",
      description: "Another test challenge",
      difficulty: "MEDIUM",
      target: 5,
      current: 0,
      unit: "sessions",
      masteryPoints: 5,
      status: "ACTIVE",
      completedAt: null,
    },
    {
      id: "test-challenge-3",
      technique: "consistencyMastery",
      title: "Test Challenge 3",
      description: "Third test challenge",
      difficulty: "EASY",
      target: 3,
      current: 0,
      unit: "days",
      masteryPoints: 3,
      status: "ACTIVE",
      completedAt: null,
    },
  ]),
}));

// ─── Types & Schemas ─────────────────────────────────────────────

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

// ─── getMasteryRankDisplay ───────────────────────────────────────

describe("getMasteryRankDisplay", () => {
  it("returns valid display for each rank", () => {
    const ranks: MasteryRank[] = [
      "APPRENTICE",
      "ADEPT",
      "EXPERT",
      "MASTER",
      "GRANDMASTER",
    ];
    for (const rank of ranks) {
      const display = getMasteryRankDisplay(rank);
      expect(display).toHaveProperty("title");
      expect(display).toHaveProperty("color");
      expect(display).toHaveProperty("icon");
      expect(typeof display.title).toBe("string");
      expect(typeof display.color).toBe("string");
      expect(typeof display.icon).toBe("string");
    }
  });

  it("APPRENTICE has seedling icon", () => {
    expect(getMasteryRankDisplay("APPRENTICE").icon).toBe("🌱");
  });

  it("GRANDMASTER has star icon", () => {
    expect(getMasteryRankDisplay("GRANDMASTER").icon).toBe("⭐");
  });
});

// ─── calculateTechniqueXp ────────────────────────────────────────

describe("calculateTechniqueXp", () => {
  it("returns zero XP for interrupted session", () => {
    const xp = calculateTechniqueXp(60, 95, true, 5, true, 0.5);
    expect(xp.durationMastery).toBe(0);
  });

  it("calculates durationMastery based on minutes and purity", () => {
    const xp = calculateTechniqueXp(50, 90, false, 0, false, 1);
    expect(xp.durationMastery).toBe(Math.floor(50 * (90 / 100)));
  });

  it("purityMastery only if purity >= 90", () => {
    expect(calculateTechniqueXp(30, 95, false, 0, false, 1).purityMastery).toBe(
      Math.floor(95 / 10),
    );
    expect(calculateTechniqueXp(30, 80, false, 0, false, 1).purityMastery).toBe(0);
  });

  it("consistencyMastery awards 2 if streakDays > 0", () => {
    expect(
      calculateTechniqueXp(30, 80, false, 3, false, 1).consistencyMastery,
    ).toBe(2);
    expect(
      calculateTechniqueXp(30, 80, false, 0, false, 1).consistencyMastery,
    ).toBe(0);
  });

  it("comebackMastery awards 10 only on first day of streak", () => {
    expect(
      calculateTechniqueXp(30, 80, false, 1, false, 1).comebackMastery,
    ).toBe(10);
    expect(
      calculateTechniqueXp(30, 80, false, 2, false, 1).comebackMastery,
    ).toBe(0);
  });

  it("bossMastery scales with remaining boss health", () => {
    const fullHealth = calculateTechniqueXp(30, 80, false, 0, true, 1.0);
    expect(fullHealth.bossMastery).toBe(20);
    const halfHealth = calculateTechniqueXp(30, 80, false, 0, true, 0.5);
    expect(halfHealth.bossMastery).toBe(Math.floor(20 * 1.5));
  });

  it("bossMastery is 0 when boss not defeated", () => {
    expect(
      calculateTechniqueXp(30, 80, false, 0, false, 1).bossMastery,
    ).toBe(0);
  });
});

// ─── resolveRank ─────────────────────────────────────────────────

describe("resolveRank", () => {
  it.each([
    [0, "APPRENTICE"],
    [5, "APPRENTICE"],
    [10, "ADEPT"],
    [24, "ADEPT"],
    [25, "EXPERT"],
    [49, "EXPERT"],
    [50, "MASTER"],
    [99, "MASTER"],
    [100, "GRANDMASTER"],
    [500, "GRANDMASTER"],
  ] as const)("resolveRank(%i) returns %s", (points, expected) => {
    expect(resolveRank(points)).toBe(expected);
  });
});

// ─── createDefaultState ──────────────────────────────────────────

describe("createDefaultState", () => {
  it("returns default state with zero techniques and APPRENTICE rank", () => {
    const state = createDefaultState("user-1");
    expect(state.userId).toBe("user-1");
    expect(state.rank).toBe("APPRENTICE");
    expect(state.totalMasteryPoints).toBe(0);
    expect(state.techniques).toEqual({
      durationMastery: 0,
      purityMastery: 0,
      consistencyMastery: 0,
      comebackMastery: 0,
      bossMastery: 0,
    });
    expect(state.activeChallenges).toHaveLength(3);
    expect(state.unlockedFeatures).toEqual([]);
  });
});

// ─── updateChallengeProgress ─────────────────────────────────────

describe("updateChallengeProgress", () => {
  it("updates ACTIVE challenge progress with XP gains", () => {
    const state = createDefaultState("user-1");
    const xpGains: TechniqueXpGains = {
      durationMastery: 5,
      purityMastery: 0,
      consistencyMastery: 0,
      comebackMastery: 0,
      bossMastery: 0,
    };
    const updated = updateChallengeProgress(state, xpGains);
    const durationChallenge = updated.activeChallenges.find(
      (c) => c.technique === "durationMastery",
    );
    expect(durationChallenge?.current).toBe(5);
    expect(durationChallenge?.status).toBe("ACTIVE");
  });

  it("completes challenge when target is met", () => {
    const state = createDefaultState("user-1");
    const firstChallenge = state.activeChallenges[0];
    if (!firstChallenge) throw new Error("No challenge found");

    const xpGains: TechniqueXpGains = {
      durationMastery: firstChallenge.target + 10,
      purityMastery: 0,
      consistencyMastery: 0,
      comebackMastery: 0,
      bossMastery: 0,
    };
    const updated = updateChallengeProgress(state, xpGains);
    const target = updated.activeChallenges.find(
      (c) => c.id === firstChallenge.id,
    );
    expect(target?.status).toBe("COMPLETED");
    expect(target?.completedAt).toBeTruthy();
    expect(target?.current).toBe(firstChallenge.target);
  });

  it("does not update COMPLETED or CLAIMED challenges", () => {
    const state = createDefaultState("user-1");
    const completedChallenge = {
      ...state.activeChallenges[0]!,
      status: "COMPLETED" as const,
      current: state.activeChallenges[0]!.target,
      completedAt: Date.now(),
    };
    const stateWithCompleted = {
      ...state,
      activeChallenges: [
        completedChallenge,
        ...state.activeChallenges.slice(1),
      ],
    };
    const xpGains: TechniqueXpGains = {
      durationMastery: 100,
      purityMastery: 0,
      consistencyMastery: 0,
      comebackMastery: 0,
      bossMastery: 0,
    };
    const updated = updateChallengeProgress(stateWithCompleted, xpGains);
    expect(updated.activeChallenges[0]!.current).toBe(
      completedChallenge.current,
    );
  });
});

// ─── MasteryService ──────────────────────────────────────────────

describe("MasteryService", () => {
  describe("getOrCreateMasteryState", () => {
    it("returns a valid state for new user", () => {
      const state = MasteryService.getOrCreateMasteryState("user-new");
      expect(state.userId).toBe("user-new");
      expect(state.rank).toBe("APPRENTICE");
      expect(state.activeChallenges).toHaveLength(3);
    });
  });

  describe("applySessionXp", () => {
    it("applies XP gains and returns updated state", () => {
      const result = MasteryService.applySessionXp("user-xp", {
        durationMastery: 2,
        purityMastery: 1,
        consistencyMastery: 1,
        comebackMastery: 0,
        bossMastery: 0,
      });
      expect(result.pointsGained).toBeGreaterThanOrEqual(0);
      expect(result.updatedState).toBeDefined();
    });

    it("caps technique values at 25", () => {
      const result = MasteryService.applySessionXp("user-cap", {
        durationMastery: 100,
        purityMastery: 100,
        consistencyMastery: 100,
        comebackMastery: 100,
        bossMastery: 100,
      });
      expect(result.updatedState.techniques.durationMastery).toBeLessThanOrEqual(25);
      expect(result.updatedState.techniques.purityMastery).toBeLessThanOrEqual(25);
      expect(result.updatedState.techniques.bossMastery).toBeLessThanOrEqual(25);
    });

    it("returns updated state with correct rank", () => {
      const result = MasteryService.applySessionXp("user-rank", {
        durationMastery: 5,
        purityMastery: 5,
        consistencyMastery: 5,
        comebackMastery: 5,
        bossMastery: 5,
      });
      expect(result.updatedState.rank).toBeDefined();
      expect(typeof result.updatedState.totalMasteryPoints).toBe("number");
    });
  });

  describe("claimChallenge", () => {
    it("returns false for non-existent challenge", () => {
      expect(
        MasteryService.claimChallenge("user-claim", "non-existent-id"),
      ).toBe(false);
    });
  });

  describe("refreshChallenges", () => {
    it("returns state with refreshed challenges", () => {
      const state = MasteryService.refreshChallenges("user-refresh");
      expect(state.activeChallenges).toHaveLength(3);
    });
  });
});

// ─── Unlock Gate Data ────────────────────────────────────────────

describe("Unlock Gate Data", () => {
  it("isFeatureUnlocked returns true when rank meets requirement", () => {
    expect(isFeatureUnlocked("ADEPT", "DEEP_WORK")).toBe(true);
    expect(isFeatureUnlocked("EXPERT", "DEEP_WORK")).toBe(true);
    expect(isFeatureUnlocked("GRANDMASTER", "CUSTOM_CHALLENGE")).toBe(true);
  });

  it("isFeatureUnlocked returns false when rank is too low", () => {
    expect(isFeatureUnlocked("APPRENTICE", "DEEP_WORK")).toBe(false);
    expect(isFeatureUnlocked("APPRENTICE", "NIGHTMARE_MODE")).toBe(false);
    expect(isFeatureUnlocked("ADEPT", "MASTERY_DUEL")).toBe(false);
  });

  it("getRequiredRank returns correct rank for each feature", () => {
    expect(getRequiredRank("DEEP_WORK")).toBe("ADEPT");
    expect(getRequiredRank("NIGHTMARE_MODE")).toBe("EXPERT");
    expect(getRequiredRank("MASTERY_DUEL")).toBe("MASTER");
    expect(getRequiredRank("CUSTOM_CHALLENGE")).toBe("GRANDMASTER");
  });

  it("getPointsToUnlock returns 0 when already at required rank", () => {
    expect(getPointsToUnlock("DEEP_WORK", 100)).toBe(0);
  });

  it("getPointsToUnlock returns positive number when below threshold", () => {
    const needed = getPointsToUnlock("NIGHTMARE_MODE", 0);
    expect(needed).toBe(MASTERY_RANK_THRESHOLDS.EXPERT);
  });

  it("RANK_UNLOCKS defines unlocks for all 5 ranks", () => {
    expect(Object.keys(RANK_UNLOCKS)).toEqual([
      "APPRENTICE",
      "ADEPT",
      "EXPERT",
      "MASTER",
      "GRANDMASTER",
    ]);
    for (const rank of Object.keys(RANK_UNLOCKS)) {
      expect(
        RANK_UNLOCKS[rank as keyof typeof RANK_UNLOCKS].length,
      ).toBeGreaterThan(0);
    }
  });
});

// ─── Challenge Generator (real implementation) ───────────────────

describe("generateMasteryChallenges (real implementation)", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const actual = jest.requireActual("../challenge-generator") as {
    generateMasteryChallenges: (techniques: MasteryState["techniques"], rank: MasteryRank) => Array<{ technique: string; difficulty: string; status: string; current: number; completedAt: null }>;
  };

  it("generates 1-2 challenges", () => {
    const techniques = {
      durationMastery: 0,
      purityMastery: 5,
      consistencyMastery: 10,
      comebackMastery: 15,
      bossMastery: 20,
    };
    const challenges = actual.generateMasteryChallenges(techniques, "APPRENTICE");
    expect(challenges.length).toBeGreaterThanOrEqual(1);
    expect(challenges.length).toBeLessThanOrEqual(2);
  });

  it("focuses on the lowest technique", () => {
    const techniques = {
      durationMastery: 0,
      purityMastery: 10,
      consistencyMastery: 10,
      comebackMastery: 10,
      bossMastery: 10,
    };
    const challenges = actual.generateMasteryChallenges(techniques, "APPRENTICE");
    expect(challenges[0]?.technique).toBe("durationMastery");
  });

  it("uses EASY difficulty for lowest technique level < 5 when EASY template exists", () => {
    // consistencyMastery has an EASY template
    const techniques = {
      durationMastery: 10,
      purityMastery: 10,
      consistencyMastery: 2,
      comebackMastery: 10,
      bossMastery: 10,
    };
    const challenges = actual.generateMasteryChallenges(techniques, "APPRENTICE");
    expect(challenges[0]?.difficulty).toBe("EASY");
  });

  it("falls back to first template when no matching difficulty exists", () => {
    // durationMastery has no EASY template — falls back to first (MEDIUM)
    const techniques = {
      durationMastery: 2,
      purityMastery: 10,
      consistencyMastery: 10,
      comebackMastery: 10,
      bossMastery: 10,
    };
    const challenges = actual.generateMasteryChallenges(techniques, "APPRENTICE");
    expect(challenges[0]?.difficulty).toBe("MEDIUM");
  });

  it("all generated challenges have status ACTIVE and current 0", () => {
    const techniques = {
      durationMastery: 3,
      purityMastery: 10,
      consistencyMastery: 10,
      comebackMastery: 10,
      bossMastery: 10,
    };
    const challenges = actual.generateMasteryChallenges(techniques, "ADEPT");
    for (const c of challenges) {
      expect(c.status).toBe("ACTIVE");
      expect(c.current).toBe(0);
      expect(c.completedAt).toBeNull();
    }
  });
});

// ─── SGradeStreakTracker ─────────────────────────────────────────

describe("SGradeStreakTracker", () => {
  it("isSGradeMilestone returns 3 for count 3", () => {
    expect(isSGradeMilestone(3)).toBe(3);
  });

  it("isSGradeMilestone returns 5 for count 5", () => {
    expect(isSGradeMilestone(5)).toBe(5);
  });

  it("isSGradeMilestone returns 10 for count 10", () => {
    expect(isSGradeMilestone(10)).toBe(10);
  });

  it("isSGradeMilestone returns null for non-milestone counts", () => {
    expect(isSGradeMilestone(0)).toBeNull();
    expect(isSGradeMilestone(1)).toBeNull();
    expect(isSGradeMilestone(2)).toBeNull();
    expect(isSGradeMilestone(4)).toBeNull();
    expect(isSGradeMilestone(7)).toBeNull();
  });
});

// ─── recordSessionMasteryProgress ────────────────────────────────

describe("recordSessionMasteryProgress", () => {
  it("completes without throwing for valid input", async () => {
    await expect(
      recordSessionMasteryProgress("user-1", {
        effectiveDuration: 3600000,
        focusQuality: 95,
        purityScore: 90,
        streak: 5,
        hasBossActive: true,
      }),
    ).resolves.toBeUndefined();
  });

  it("handles zero values gracefully", async () => {
    await expect(
      recordSessionMasteryProgress("user-2", {
        effectiveDuration: 0,
        focusQuality: 0,
        purityScore: 0,
        streak: 0,
        hasBossActive: false,
      }),
    ).resolves.toBeUndefined();
  });
});
