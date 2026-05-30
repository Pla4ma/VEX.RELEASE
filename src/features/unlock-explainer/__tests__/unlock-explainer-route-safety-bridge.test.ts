/**
 * Unlock Explainer — Route Safety Bridge Tests
 */

import {
  checkRouteSafety,
  canRegisterFeatureRouteWithSafety,
  canNavigateToRouteWithSafety,
} from "../route-safety-bridge";
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
