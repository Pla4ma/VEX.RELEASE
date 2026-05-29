/**
 * Unlock Explainer — Comprehensive Tests
 *
 * Covers: unlock-decision, service, safety, lane-fit, completion-bridge,
 *         route-safety-bridge, schemas, hooks
 */

import { createUnlockDecision } from "../unlock-decision";
import { getUnlockExplainerCopy, isFeatureVisible } from "../service";
import {
  computeFeatureSafetyGates,
  canDegradedPremiumTease,
  isPremiumGatedFeature,
  isNeverUnlockFeature,
  NEVER_UNLOCK_FEATURES,
} from "../safety";
import { resolveLaneFit, resolveMinSessions, LANE_FEATURE_FIT, NEVER_UNLOCK } from "../lane-fit";
import { buildCompletionUnlock, unlockDecisionToCompletion } from "../completion-bridge";
import {
  checkRouteSafety,
  canRegisterFeatureRouteWithSafety,
  canNavigateToRouteWithSafety,
} from "../route-safety-bridge";
import { buildUserFacingReason } from "../schemas";
import { trackUnlockDecisionResolved, trackUnlockDecisionDismissed } from "../analytics";
import type { UnlockDecision } from "../types";

// ─── Fake timers for consistent Date.now() ───────────────────────

const NOW = 1_764_000_000_000;

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterAll(() => {
  jest.useRealTimers();
});

// ─── resolveLaneFit ──────────────────────────────────────────────

describe("resolveLaneFit", () => {
  it("returns strong for study_os + student", () => {
    expect(resolveLaneFit("study_os", "student")).toBe("strong");
  });

  it("returns blocked for run_board + minimal_normal", () => {
    expect(resolveLaneFit("run_board", "minimal_normal")).toBe("blocked");
  });

  it("returns medium for unknown feature with known lane", () => {
    expect(resolveLaneFit("unknown_feature", "student")).toBe("medium");
  });

  it("returns weak when no lane provided", () => {
    expect(resolveLaneFit("study_os")).toBe("weak");
  });

  it("returns medium for known feature with unknown lane value", () => {
    expect(resolveLaneFit("study_os", "unknown_lane")).toBe("medium");
  });

  it("boss_tab is strong for game_like lane", () => {
    expect(resolveLaneFit("boss_tab", "game_like")).toBe("strong");
  });

  it("rescue_cta is strong for student and deep_creative", () => {
    expect(resolveLaneFit("rescue_cta", "student")).toBe("strong");
    expect(resolveLaneFit("rescue_cta", "deep_creative")).toBe("strong");
  });
});

// ─── resolveMinSessions ──────────────────────────────────────────

describe("resolveMinSessions", () => {
  it("strong fit requires 1 session", () => {
    expect(resolveMinSessions("strong")).toBe(1);
  });

  it("medium fit requires 3 sessions", () => {
    expect(resolveMinSessions("medium")).toBe(3);
  });

  it("weak fit requires 5 sessions", () => {
    expect(resolveMinSessions("weak")).toBe(5);
  });

  it("minimal_normal lane requires 7 sessions even for weak", () => {
    expect(resolveMinSessions("weak", "minimal_normal")).toBe(7);
  });
});

// ─── createUnlockDecision ────────────────────────────────────────

describe("createUnlockDecision", () => {
  it("hides never-unlock features", () => {
    for (const key of NEVER_UNLOCK) {
      const result = createUnlockDecision({ featureKey: key, sessionCount: 10 });
      expect(result.decision).toBe("hidden");
      expect(result.reasonCode).toBe("final_release_deactivated");
    }
  });

  it("unlocks core features on Day 0", () => {
    for (const key of ["focus_session", "home_tab", "profile_tab", "focus_tab"]) {
      const result = createUnlockDecision({ featureKey: key, sessionCount: 0 });
      expect(result.decision).toBe("unlocked");
      expect(result.reasonCode).toBe("day_zero_core");
    }
  });

  it("teases non-core features on Day 0", () => {
    const result = createUnlockDecision({
      featureKey: "study_os",
      sessionCount: 0,
    });
    expect(result.decision).toBe("teased");
    expect(result.reasonCode).toBe("day_zero_tease");
  });

  it("Day 0 non-core features can hide and reconsider at session 1", () => {
    const result = createUnlockDecision({
      featureKey: "study_os",
      sessionCount: 0,
    });
    expect(result.canHide).toBe(true);
    expect(result.canReconsiderAtSessionCount).toBe(1);
  });

  it("Day 0 core features cannot hide", () => {
    const result = createUnlockDecision({
      featureKey: "focus_session",
      sessionCount: 0,
    });
    expect(result.canHide).toBe(false);
    expect(result.canReconsiderAtSessionCount).toBeNull();
  });

  it("blocks features when lane fit is blocked", () => {
    const result = createUnlockDecision({
      featureKey: "run_board",
      laneProfile: "minimal_normal",
      sessionCount: 5,
    });
    expect(result.decision).toBe("blocked");
    expect(result.laneFit).toBe("blocked");
    expect(result.canHide).toBe(false);
  });

  it("blocked features reconsider after currentSession + 3", () => {
    const result = createUnlockDecision({
      featureKey: "boss_tab",
      laneProfile: "minimal_normal",
      sessionCount: 2,
    });
    expect(result.canReconsiderAtSessionCount).toBe(5);
  });

  it("unlocks strong lane features after 1 session", () => {
    const result = createUnlockDecision({
      featureKey: "study_os",
      laneProfile: "student",
      sessionCount: 1,
    });
    expect(result.decision).toBe("unlocked");
    expect(result.laneFit).toBe("strong");
    expect(result.reasonCode).toBe("unlocked_after_sessions");
  });

  it("teases medium-fit features before threshold", () => {
    const result = createUnlockDecision({
      featureKey: "study_os",
      laneProfile: "deep_creative",
      sessionCount: 1,
    });
    expect(result.decision).toBe("teased");
    expect(result.laneFit).toBe("medium");
    expect(result.canReconsiderAtSessionCount).toBe(3);
  });

  it("respects manual override", () => {
    const result = createUnlockDecision({
      featureKey: "boss_tab",
      sessionCount: 0,
      manualOverride: "unlocked",
    });
    expect(result.decision).toBe("unlocked");
    expect(result.reasonCode).toBe("manual_override");
  });

  it("manual override hidden makes canHide false", () => {
    const result = createUnlockDecision({
      featureKey: "boss_tab",
      sessionCount: 0,
      manualOverride: "hidden",
    });
    expect(result.decision).toBe("hidden");
    expect(result.canHide).toBe(false);
  });

  it("returns weak fit when no lane provided", () => {
    const result = createUnlockDecision({
      featureKey: "study_os",
      sessionCount: 5,
    });
    expect(result.laneFit).toBe("weak");
  });

  it("returns medium fit for unknown features", () => {
    const result = createUnlockDecision({
      featureKey: "unknown_feature_xyz",
      laneProfile: "student",
      sessionCount: 5,
    });
    expect(result.laneFit).toBe("medium");
    expect(result.decision).toBe("unlocked");
  });

  it("always includes at least one evidence entry", () => {
    const result = createUnlockDecision({
      featureKey: "study_os",
      sessionCount: 5,
    });
    expect(result.evidence.length).toBeGreaterThanOrEqual(1);
  });

  it("evidence has required fields", () => {
    const result = createUnlockDecision({
      featureKey: "study_os",
      sessionCount: 5,
    });
    for (const e of result.evidence) {
      expect(e).toHaveProperty("source");
      expect(e).toHaveProperty("detail");
      expect(e).toHaveProperty("observedAt");
      expect(typeof e.detail).toBe("string");
      expect(e.detail.length).toBeGreaterThan(0);
    }
  });
});

// ─── isFeatureVisible ────────────────────────────────────────────

describe("isFeatureVisible", () => {
  it("returns false for hidden decisions", () => {
    const hidden = createUnlockDecision({ featureKey: "shop", sessionCount: 10 });
    expect(isFeatureVisible(hidden)).toBe(false);
  });

  it("returns true for unlocked decisions", () => {
    const unlocked = createUnlockDecision({
      featureKey: "focus_session",
      sessionCount: 0,
    });
    expect(isFeatureVisible(unlocked)).toBe(true);
  });

  it("returns true for teased decisions", () => {
    const teased = createUnlockDecision({
      featureKey: "study_os",
      sessionCount: 0,
    });
    expect(isFeatureVisible(teased)).toBe(true);
  });

  it("returns true for blocked decisions", () => {
    const blocked = createUnlockDecision({
      featureKey: "run_board",
      laneProfile: "minimal_normal",
      sessionCount: 5,
    });
    expect(isFeatureVisible(blocked)).toBe(true);
  });
});

// ─── getUnlockExplainerCopy ──────────────────────────────────────

describe("getUnlockExplainerCopy", () => {
  it("returns unlocked title for unlocked decisions", () => {
    const decision = createUnlockDecision({
      featureKey: "focus_session",
      sessionCount: 0,
    });
    const copy = getUnlockExplainerCopy(decision);
    expect(copy.title).toContain("unlocked");
    expect(copy.body).toBeTruthy();
  });

  it("returns 'coming soon' for teased decisions", () => {
    const decision = createUnlockDecision({
      featureKey: "study_os",
      sessionCount: 0,
    });
    const copy = getUnlockExplainerCopy(decision);
    expect(copy.title).toContain("coming soon");
  });

  it("returns 'unavailable' for blocked decisions", () => {
    const decision = createUnlockDecision({
      featureKey: "run_board",
      laneProfile: "minimal_normal",
      sessionCount: 5,
    });
    const copy = getUnlockExplainerCopy(decision);
    expect(copy.title).toContain("unavailable");
  });

  it("includes CTA 'Got it' when canHide is true", () => {
    const decision = createUnlockDecision({
      featureKey: "study_os",
      sessionCount: 0,
    });
    const copy = getUnlockExplainerCopy(decision);
    expect(copy.cta).toBe("Got it");
  });

  it("CTA is null when canHide is false", () => {
    const decision = createUnlockDecision({
      featureKey: "focus_session",
      sessionCount: 0,
    });
    const copy = getUnlockExplainerCopy(decision);
    expect(copy.cta).toBeNull();
  });
});

// ─── buildUserFacingReason ───────────────────────────────────────

describe("buildUserFacingReason", () => {
  const baseCtx = {
    featureKey: "study_os",
    lane: "student",
    sessionCount: 2,
    minSessions: 5,
    laneFit: "strong" as const,
    isPremium: false,
    hasRelatedBehavior: false,
  };

  it("day_zero_core mentions essential and first session", () => {
    const reason = buildUserFacingReason("day_zero_core", baseCtx);
    expect(reason).toContain("essential");
    expect(reason).toContain("first session");
  });

  it("day_zero_tease says warming up", () => {
    const reason = buildUserFacingReason("day_zero_tease", baseCtx);
    expect(reason).toContain("warming up");
  });

  it("lane_blocked mentions settings for minimal_normal", () => {
    const reason = buildUserFacingReason("lane_blocked", {
      ...baseCtx,
      lane: "minimal_normal",
      laneFit: "blocked",
    });
    expect(reason).toContain("settings");
  });

  it("manual_override says 'You chose this'", () => {
    const reason = buildUserFacingReason("manual_override", baseCtx);
    expect(reason).toContain("You chose");
  });

  it("degraded_premium_blocked says stays quiet", () => {
    const reason = buildUserFacingReason("degraded_premium_blocked", baseCtx);
    expect(reason).toContain("premium");
    expect(reason).toContain("quiet");
  });

  it("hidden_by_user mentions settings", () => {
    const reason = buildUserFacingReason("hidden_by_user", baseCtx);
    expect(reason).toContain("Settings");
  });

  it("never_unlock_baseline mentions no monetization", () => {
    const reason = buildUserFacingReason("never_unlock_baseline", baseCtx);
    expect(reason).toContain("never unlock");
  });

  it("teased_before_sessions includes session count for student study_os", () => {
    const reason = buildUserFacingReason("teased_before_sessions", {
      ...baseCtx,
      lane: "student",
      featureKey: "study_os",
    });
    expect(reason).toContain("2");
    expect(reason).toContain("3");
  });

  it("unlocked_after_sessions for student study_os includes session count", () => {
    const reason = buildUserFacingReason("unlocked_after_sessions", {
      ...baseCtx,
      lane: "student",
      featureKey: "study_os",
      sessionCount: 5,
    });
    expect(reason).toContain("5");
    expect(reason).toContain("Study tools");
  });
});

// ─── Safety ──────────────────────────────────────────────────────

describe("computeFeatureSafetyGates", () => {
  const makeDecision = (decision: string): UnlockDecision =>
    ({
      featureKey: "test",
      decision,
      reasonCode: "test",
      userFacingReason: "test reason",
      evidence: [],
      laneFit: "medium",
      canHide: true,
      canReconsiderAtSessionCount: null,
    }) as unknown as UnlockDecision;

  it("user-hidden returns fully inert", () => {
    const gates = computeFeatureSafetyGates(makeDecision("unlocked"), true, false);
    expect(gates.canRender).toBe(false);
    expect(gates.canNavigate).toBe(false);
    expect(gates.canQuery).toBe(false);
    expect(gates.canSubscribe).toBe(false);
    expect(gates.canNotify).toBe(false);
    expect(gates.canLoadScript).toBe(false);
  });

  it("null decision returns fully inert", () => {
    const gates = computeFeatureSafetyGates(null, false, false);
    expect(gates.canRender).toBe(false);
    expect(gates.canNavigate).toBe(false);
  });

  it("hidden decision returns fully inert", () => {
    const gates = computeFeatureSafetyGates(makeDecision("hidden"), false, false);
    expect(gates.canRender).toBe(false);
    expect(gates.canNavigate).toBe(false);
  });

  it("blocked decision returns render-only", () => {
    const gates = computeFeatureSafetyGates(makeDecision("blocked"), false, false);
    expect(gates.canRender).toBe(true);
    expect(gates.canNavigate).toBe(false);
    expect(gates.canQuery).toBe(false);
  });

  it("teased decision returns render-only (no navigate/query)", () => {
    const gates = computeFeatureSafetyGates(makeDecision("teased"), false, false);
    expect(gates.canRender).toBe(true);
    expect(gates.canNavigate).toBe(false);
    expect(gates.canQuery).toBe(false);
    expect(gates.canSubscribe).toBe(false);
  });

  it("unlocked decision returns fully active", () => {
    const gates = computeFeatureSafetyGates(makeDecision("unlocked"), false, false);
    expect(gates.canRender).toBe(true);
    expect(gates.canNavigate).toBe(true);
    expect(gates.canQuery).toBe(true);
    expect(gates.canSubscribe).toBe(true);
    expect(gates.canNotify).toBe(true);
    expect(gates.canLoadScript).toBe(true);
  });

  it("degraded premium with degraded decision returns blockedDisplayOnly", () => {
    const gates = computeFeatureSafetyGates(makeDecision("degraded"), false, true);
    expect(gates.canRender).toBe(true);
    expect(gates.canNavigate).toBe(false);
    expect(gates.canQuery).toBe(false);
  });
});

describe("canDegradedPremiumTease", () => {
  it("always returns false", () => {
    expect(canDegradedPremiumTease("ai_coach_advanced")).toBe(false);
    expect(canDegradedPremiumTease("random_feature")).toBe(false);
  });
});

describe("isPremiumGatedFeature", () => {
  it("returns true for known premium features", () => {
    expect(isPremiumGatedFeature("ai_coach_advanced")).toBe(true);
    expect(isPremiumGatedFeature("streak_insurance")).toBe(true);
  });

  it("returns false for non-premium features", () => {
    expect(isPremiumGatedFeature("focus_session")).toBe(false);
    expect(isPremiumGatedFeature("study_os")).toBe(false);
  });
});

describe("isNeverUnlockFeature", () => {
  it("returns true for never-unlock features", () => {
    expect(isNeverUnlockFeature("shop")).toBe(true);
    expect(isNeverUnlockFeature("wagers")).toBe(true);
    expect(isNeverUnlockFeature("battle_pass")).toBe(true);
  });

  it("returns false for normal features", () => {
    expect(isNeverUnlockFeature("focus_session")).toBe(false);
    expect(isNeverUnlockFeature("study_os")).toBe(false);
  });

  it("NEVER_UNLOCK_FEATURES is a non-empty set", () => {
    expect(NEVER_UNLOCK_FEATURES.size).toBeGreaterThan(0);
  });
});

// ─── Completion Bridge ───────────────────────────────────────────

describe("buildCompletionUnlock", () => {
  it("returns available status for unlocked features", () => {
    const result = buildCompletionUnlock("study_os", 10, "student");
    expect(result.status).toBe("available");
    expect(result.hidden).toBe(false);
  });

  it("returns blocked status for hidden features", () => {
    const result = buildCompletionUnlock("study_os", 10, "student", ["study_os"]);
    expect(result.status).toBe("blocked");
    expect(result.hidden).toBe(true);
  });

  it("returns teased status for features below threshold", () => {
    const result = buildCompletionUnlock("study_os", 0, "game_like");
    expect(result.status).toBe("teased");
    expect(result.hidden).toBe(false);
  });

  it("includes a reason string", () => {
    const result = buildCompletionUnlock("study_os", 5, "student");
    expect(typeof result.reason).toBe("string");
    expect(result.reason.length).toBeGreaterThan(0);
  });
});

describe("unlockDecisionToCompletion", () => {
  it("maps unlocked to available", () => {
    const decision = createUnlockDecision({
      featureKey: "study_os",
      laneProfile: "student",
      sessionCount: 5,
    });
    const result = unlockDecisionToCompletion(decision, false);
    expect(result.status).toBe("available");
    expect(result.hidden).toBe(false);
  });

  it("maps hidden to blocked when isHidden=true", () => {
    const decision = createUnlockDecision({
      featureKey: "study_os",
      laneProfile: "student",
      sessionCount: 5,
    });
    const result = unlockDecisionToCompletion(decision, true);
    expect(result.status).toBe("blocked");
    expect(result.hidden).toBe(true);
  });

  it("maps teased decision to teased status", () => {
    const decision = createUnlockDecision({
      featureKey: "study_os",
      sessionCount: 0,
    });
    const result = unlockDecisionToCompletion(decision, false);
    expect(result.status).toBe("teased");
  });
});

// ─── Route Safety Bridge ─────────────────────────────────────────

describe("checkRouteSafety", () => {
  const makeDecision = (decision: string): UnlockDecision =>
    ({
      featureKey: "test",
      decision,
      reasonCode: "test",
      userFacingReason: "test reason",
      evidence: [],
      laneFit: "medium",
      canHide: true,
      canReconsiderAtSessionCount: null,
    }) as unknown as UnlockDecision;

  it("hidden feature cannot register or navigate", () => {
    const result = checkRouteSafety(makeDecision("hidden"), false, false);
    expect(result.canRegisterRoute).toBe(false);
    expect(result.canNavigate).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it("user-hidden feature cannot register or navigate", () => {
    const result = checkRouteSafety(makeDecision("unlocked"), true, false);
    expect(result.canRegisterRoute).toBe(false);
    expect(result.canNavigate).toBe(false);
  });

  it("teased feature cannot register or navigate", () => {
    const result = checkRouteSafety(makeDecision("teased"), false, false);
    expect(result.canRegisterRoute).toBe(false);
    expect(result.canNavigate).toBe(false);
  });

  it("unlocked feature can register and navigate", () => {
    const result = checkRouteSafety(makeDecision("unlocked"), false, false);
    expect(result.canRegisterRoute).toBe(true);
    expect(result.canNavigate).toBe(true);
    expect(result.reason).toBeNull();
  });

  it("null decision cannot register or navigate", () => {
    const result = checkRouteSafety(null, false, false);
    expect(result.canRegisterRoute).toBe(false);
    expect(result.canNavigate).toBe(false);
  });
});

describe("canRegisterFeatureRouteWithSafety", () => {
  const makeDecision = (decision: string): UnlockDecision =>
    ({
      featureKey: "test",
      decision,
      reasonCode: "test",
      userFacingReason: "test reason",
      evidence: [],
      laneFit: "medium",
      canHide: true,
      canReconsiderAtSessionCount: null,
    }) as unknown as UnlockDecision;

  it("returns true only when both safety and availability agree", () => {
    expect(
      canRegisterFeatureRouteWithSafety(
        makeDecision("unlocked"),
        false,
        false,
        true,
      ),
    ).toBe(true);
  });

  it("returns false when safety denies even if availability allows", () => {
    expect(
      canRegisterFeatureRouteWithSafety(
        makeDecision("hidden"),
        false,
        false,
        true,
      ),
    ).toBe(false);
  });

  it("returns false when availability denies even if safety allows", () => {
    expect(
      canRegisterFeatureRouteWithSafety(
        makeDecision("unlocked"),
        false,
        false,
        false,
      ),
    ).toBe(false);
  });
});

describe("canNavigateToRouteWithSafety", () => {
  const makeDecision = (decision: string): UnlockDecision =>
    ({
      featureKey: "test",
      decision,
      reasonCode: "test",
      userFacingReason: "test reason",
      evidence: [],
      laneFit: "medium",
      canHide: true,
      canReconsiderAtSessionCount: null,
    }) as unknown as UnlockDecision;

  it("returns true only when both safety and availability agree", () => {
    expect(
      canNavigateToRouteWithSafety(
        makeDecision("unlocked"),
        false,
        false,
        true,
      ),
    ).toBe(true);
  });

  it("returns false when safety denies", () => {
    expect(
      canNavigateToRouteWithSafety(
        makeDecision("teased"),
        false,
        false,
        true,
      ),
    ).toBe(false);
  });
});

// ─── Analytics ───────────────────────────────────────────────────

describe("analytics", () => {
  it("trackUnlockDecisionResolved is callable without error", () => {
    const decision = createUnlockDecision({
      featureKey: "study_os",
      sessionCount: 5,
    });
    expect(() => trackUnlockDecisionResolved(decision)).not.toThrow();
  });

  it("trackUnlockDecisionDismissed is callable without error", () => {
    expect(() => trackUnlockDecisionDismissed("study_os")).not.toThrow();
  });
});

// ─── LANE_FEATURE_FIT matrix ─────────────────────────────────────

describe("LANE_FEATURE_FIT", () => {
  it("contains all expected feature keys", () => {
    const expectedFeatures = [
      "study_os",
      "run_board",
      "project_thread",
      "today_strip",
      "boss_tab",
      "rescue_cta",
    ];
    for (const key of expectedFeatures) {
      expect(LANE_FEATURE_FIT).toHaveProperty(key);
    }
  });

  it("each feature has 4 lane entries", () => {
    for (const [, lanes] of Object.entries(LANE_FEATURE_FIT)) {
      expect(Object.keys(lanes)).toHaveLength(4);
    }
  });
});

// ─── NEVER_UNLOCK set ────────────────────────────────────────────

describe("NEVER_UNLOCK", () => {
  it("includes shop and economy-related features", () => {
    expect(NEVER_UNLOCK.has("shop")).toBe(true);
    expect(NEVER_UNLOCK.has("inventory")).toBe(true);
    expect(NEVER_UNLOCK.has("wagers")).toBe(true);
    expect(NEVER_UNLOCK.has("battle_pass")).toBe(true);
  });

  it("does not include normal features", () => {
    expect(NEVER_UNLOCK.has("focus_session")).toBe(false);
    expect(NEVER_UNLOCK.has("study_os")).toBe(false);
  });
});
