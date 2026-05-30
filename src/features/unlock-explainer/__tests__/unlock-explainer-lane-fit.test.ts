/**
 * Unlock Explainer — Lane Fit Tests
 */

import { resolveLaneFit, resolveMinSessions, LANE_FEATURE_FIT, NEVER_UNLOCK } from "../lane-fit";

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
