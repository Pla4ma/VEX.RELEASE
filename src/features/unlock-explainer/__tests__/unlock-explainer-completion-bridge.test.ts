/**
 * Unlock Explainer — Completion Bridge Tests
 */

import { createUnlockDecision } from "../unlock-decision";
import { buildCompletionUnlock, unlockDecisionToCompletion } from "../completion-bridge";

// ─── Fake timers for consistent Date.now() ───────────────────────

const NOW = 1_764_000_000_000;

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterAll(() => {
  jest.useRealTimers();
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
