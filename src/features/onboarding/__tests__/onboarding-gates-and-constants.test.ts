/**
 * Comprehensive Onboarding Feature Tests — Onboarding Gates & Constants
 */

import "./onboarding-mock-setup";

import {
  STEP_ORDER,
  FEATURE_UNLOCK_GATES,
  STEP_CONTENT,
} from "../onboarding-gates";

import { ONBOARDING_GOALS } from "../constants";

// ── Onboarding Gates ──────────────────────────────────────────────────────────

describe("Onboarding Gates", () => {
  it("has correct step order", () => {
    expect(STEP_ORDER).toContain("WELCOME");
    expect(STEP_ORDER).toContain("QUICK_START");
    expect(STEP_ORDER).toContain("FIRST_SESSION");
    expect(STEP_ORDER).toContain("POST_SESSION");
    expect(STEP_ORDER).toContain("HOME_INTRO");
    expect(STEP_ORDER).toContain("FEATURE_UNLOCK");
    expect(STEP_ORDER).toContain("COMPLETE");
    expect(STEP_ORDER.length).toBe(7);
  });

  it("has feature unlock gates sorted by session requirement", () => {
    for (let i = 1; i < FEATURE_UNLOCK_GATES.length; i++) {
      expect(FEATURE_UNLOCK_GATES[i]!.requiresSessions).toBeGreaterThanOrEqual(
        FEATURE_UNLOCK_GATES[i - 1]!.requiresSessions,
      );
    }
  });

  it("has step content for every step", () => {
    STEP_ORDER.forEach((step) => {
      expect(STEP_CONTENT[step]).toBeDefined();
      expect(STEP_CONTENT[step].title).toBeTruthy();
      expect(STEP_CONTENT[step].primaryAction).toBeTruthy();
      expect(STEP_CONTENT[step].content).toBeTruthy();
    });
  });

  it("has at least 4 feature unlock gates", () => {
    expect(FEATURE_UNLOCK_GATES.length).toBeGreaterThanOrEqual(4);
  });
});

// ── Constants ─────────────────────────────────────────────────────────────────

describe("Onboarding Constants", () => {
  it("has 4 onboarding goals", () => {
    expect(ONBOARDING_GOALS.length).toBe(4);
  });

  it("has all required goal fields", () => {
    ONBOARDING_GOALS.forEach((goal) => {
      expect(goal.id).toBeTruthy();
      expect(goal.label).toBeTruthy();
      expect(goal.description).toBeTruthy();
    });
  });

  it("covers all focus goal types", () => {
    const ids = ONBOARDING_GOALS.map((g) => g.id);
    expect(ids).toContain("WORK");
    expect(ids).toContain("STUDY");
    expect(ids).toContain("CREATIVE");
    expect(ids).toContain("PERSONAL");
  });
});
