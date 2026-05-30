/**
 * Unlock Explainer — Safety Tests
 */

import {
  computeFeatureSafetyGates,
  canDegradedPremiumTease,
  isPremiumGatedFeature,
  isNeverUnlockFeature,
  NEVER_UNLOCK_FEATURES,
} from "../safety";
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
