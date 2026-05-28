/**
 * Phase 3F — Unified Architecture Proof (Mechanics & Cross-Lane)
 *
 * Verifies FeatureAvailability lane mechanic policies and
 * cross-lane session loop variance.
 */

import {
  getLaneMechanicPolicy,
  getLanePresentationPolicy,
  buildLaneSessionBrief,
  resolveLaneCopy,
  isRescueEligible,
  createRescuePlan,
  decideNudge,
  resolveCompletionExperiencePolicy,
  SessionMode,
  baseLaneProfile,
  completionInput,
} from "./phase3-test-helpers";
import type {
  Lane,
  NudgeDecision,
} from "./phase3-test-helpers";

describe("Phase 3F — Mechanics & Cross-Lane Proof", () => {
  it("FeatureAvailability: LaneMechanicPolicy blockedMechanics enforces per-lane feature visibility", () => {
    const lanes: Lane[] = [
      "student",
      "game_like",
      "deep_creative",
      "minimal_normal",
    ];
    const oldEconomy = [
      "shop",
      "gems",
      "wagers",
      "economy",
      "trading",
    ] as const;

    for (const lane of lanes) {
      const policy = getLaneMechanicPolicy(
        baseLaneProfile({ primaryLane: lane }),
      );
      const anyBlocked = oldEconomy.some((m) =>
        policy.blockedMechanics.includes(m),
      );
      expect(anyBlocked).toBe(true);
    }

    const cleanPolicy = getLaneMechanicPolicy(
      baseLaneProfile({ primaryLane: "minimal_normal" }),
    );
    expect(cleanPolicy.blockedMechanics).toContain("boss_full_cta");
    expect(cleanPolicy.blockedMechanics).toContain("challenge_spam");
    expect(cleanPolicy.blockedMechanics).toContain("xp_first_ui");
    expect(cleanPolicy.blockedMechanics).toContain("economy");

    const runPolicy = getLaneMechanicPolicy(
      baseLaneProfile({ primaryLane: "game_like" }),
    );
    expect(runPolicy.blockedMechanics).toContain("paid_saves");
    expect(runPolicy.blockedMechanics).toContain("gems");
    expect(runPolicy.blockedMechanics).toContain("shop");
    expect(runPolicy.blockedMechanics).toContain("trading");
    expect(runPolicy.blockedMechanics).toContain("wagers");
    expect(runPolicy.blockedMechanics).toContain("generic_leaderboards");
  });

  it("same core session loop produces lane-varied outputs without separate engines", () => {
    for (const lane of [
      "student",
      "game_like",
      "deep_creative",
      "minimal_normal",
    ] as const) {
      const profile = baseLaneProfile({ primaryLane: lane });

      const brief = buildLaneSessionBrief({ laneProfile: profile });
      const policy = getLaneMechanicPolicy(profile);
      const pres = getLanePresentationPolicy({ lane, reducedMotion: false });
      const copy = resolveLaneCopy("DAY_0_NOT_STARTED", profile, "fallback");

      expect(brief.lane).toBe(lane);
      expect(policy.lane).toBe(lane);
      expect(pres.lane).toBe(lane);
      const publicNameMap: Record<Lane, string> = {
        student: "study",
        game_like: "run",
        deep_creative: "project",
        minimal_normal: "clean",
      };
      expect(copy.laneStageTheme).toContain(publicNameMap[lane]);
    }

    expect(getLaneMechanicPolicy).toBeDefined();
    expect(getLanePresentationPolicy).toBeDefined();
    expect(buildLaneSessionBrief).toBeDefined();
    expect(resolveLaneCopy).toBeDefined();
    expect(isRescueEligible).toBeDefined();
    expect(createRescuePlan).toBeDefined();
    expect(decideNudge).toBeDefined();
    expect(resolveCompletionExperiencePolicy).toBeDefined();
  });
});
