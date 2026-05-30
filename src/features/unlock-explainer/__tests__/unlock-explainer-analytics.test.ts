/**
 * Unlock Explainer — Analytics Tests
 */

import { createUnlockDecision } from "../unlock-decision";
import { trackUnlockDecisionResolved, trackUnlockDecisionDismissed } from "../analytics";

// ─── Fake timers for consistent Date.now() ───────────────────────

const NOW = 1_764_000_000_000;

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterAll(() => {
  jest.useRealTimers();
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
