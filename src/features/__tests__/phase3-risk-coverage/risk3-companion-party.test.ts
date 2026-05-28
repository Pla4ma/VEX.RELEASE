import {
  getLaneMechanicPolicy,
  buildLaneSessionBrief,
  resolveFirstWeekExperience,
  SessionMode,
  baseLaneProfile,
  baseStats,
} from "./helpers";

describe("Risk 3 — Run Companion Party-Mode Gating", () => {
  it("companion_party_member and optional_party_mode only in game_like", () => {
    const runPolicy = getLaneMechanicPolicy(
      baseLaneProfile({ primaryLane: "game_like" }),
    );
    expect(runPolicy.preferredMechanics).toContain("companion_party_member");
    expect(runPolicy.preferredMechanics).toContain("optional_party_mode");

    for (const lane of [
      "student",
      "deep_creative",
      "minimal_normal",
    ] as const) {
      const policy = getLaneMechanicPolicy(
        baseLaneProfile({ primaryLane: lane }),
      );
      expect(policy.preferredMechanics).not.toContain("companion_party_member");
      expect(policy.preferredMechanics).not.toContain("optional_party_mode");
    }
  });

  it("Clean blocks companion_chores; game_like omits chores from preferred", () => {
    const cleanPolicy = getLaneMechanicPolicy(
      baseLaneProfile({ primaryLane: "minimal_normal" }),
    );
    expect(cleanPolicy.blockedMechanics).toContain("companion_chores");

    const runPolicy = getLaneMechanicPolicy(
      baseLaneProfile({ primaryLane: "game_like" }),
    );
    expect(runPolicy.preferredMechanics).not.toContain("companion_chores");
  });

  it("Run brief has encounter CTA, no party/squad language", () => {
    const brief = buildLaneSessionBrief({ lane: "game_like" });
    expect(brief.sessionMode).toBe(SessionMode.SPRINT);
    expect(brief.ctaLabel).toBe("Start encounter");
    expect(brief.title).not.toContain("party");
  });

  it("Run Day 0: game_like gets tiny_boss_teaser, others do not", () => {
    const runDay0 = resolveFirstWeekExperience({
      behaviorStats: baseStats,
      completedSessions: 0,
      daysSinceLastSession: null,
      daysSinceOnboarding: 0,
      featureAvailability: {
        boss: true,
        premium: false,
        social: false,
        study: false,
      },
      motivationStyle: "game_like",
      premiumState: "unavailable",
      primaryGoal: "work",
      laneProfile: baseLaneProfile({ primaryLane: "game_like" }),
    });
    expect(runDay0.allowedHomeSurfaces).toContain("tiny_boss_teaser");

    for (const lane of [
      "student",
      "deep_creative",
      "minimal_normal",
    ] as const) {
      const result = resolveFirstWeekExperience({
        behaviorStats: baseStats,
        completedSessions: 0,
        daysSinceLastSession: null,
        daysSinceOnboarding: 0,
        featureAvailability: {
          boss: true,
          premium: false,
          social: false,
          study: true,
        },
        motivationStyle: "calm",
        premiumState: "unavailable",
        primaryGoal: "work",
        laneProfile: baseLaneProfile({ primaryLane: lane }),
      });
      expect(result.allowedHomeSurfaces).not.toContain("tiny_boss_teaser");
    }
  });
});
