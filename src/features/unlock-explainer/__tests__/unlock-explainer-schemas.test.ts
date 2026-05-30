/**
 * Unlock Explainer — Schema / User-Facing Reason Tests
 */

import { buildUserFacingReason } from "../schemas";

// ─── Fake timers for consistent Date.now() ───────────────────────

const NOW = 1_764_000_000_000;

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterAll(() => {
  jest.useRealTimers();
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
