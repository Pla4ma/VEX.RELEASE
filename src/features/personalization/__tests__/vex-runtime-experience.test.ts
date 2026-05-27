import { describe, it, expect } from "@jest/globals";
import {
  computeVexRuntimeExperience,
  type VexRuntimeInput,
} from "../vex-runtime-experience";

const baseInput: VexRuntimeInput = {
  completedSessions: 0,
  daysSinceOnboarding: 0,
  daysSinceLastSession: null,
  motivationStyle: "calm",
  primaryGoal: "focus",
  bossEngagement: "none",
  studyUsageRatio: 0,
  coachInteractions: 0,
  completionStreak: 0,
  isPremium: false,
  featureAvailable: {
    boss: true,
    premium: true,
    social: false,
    study: true,
  },
};

describe("useVexRuntimeExperience", () => {
  it("Day 0 calm user sees only first-session path", () => {
    const result = computeVexRuntimeExperience(baseInput);
    expect(result.premiumMoment.canShow).toBe(false);
    expect(result.notificationPolicy.maxPerDay).toBe(0);
    expect(result.notificationPolicy.allowedTypes).toHaveLength(0);
    expect(result.completionSequence.steps).toContain(
      "coach_companion_reflection",
    );
    expect(result.completionSequence.steps).toContain("next_action");
    expect(result.completionSequence.showWeeklyInsight).toBe(false);
  });

  it("Day 0 game-like user gets only tiny boss tease, not full boss", () => {
    const input: VexRuntimeInput = {
      ...baseInput,
      motivationStyle: "game_like",
      featureAvailable: { ...baseInput.featureAvailable, boss: true },
    };
    const result = computeVexRuntimeExperience(input);
    expect(result.bossIntensity).not.toBe("visible");
  });

  it("Day 1 user sees progress proof", () => {
    const input: VexRuntimeInput = {
      ...baseInput,
      completedSessions: 1,
      daysSinceOnboarding: 1,
      motivationStyle: "calm",
    };
    const result = computeVexRuntimeExperience(input);
    expect(result.completionSequence.showProgressProof).toBe(true);
    expect(result.completionSequence.steps).toContain("streak_progress");
  });

  it("Day 3 user sees companion continuity", () => {
    const input: VexRuntimeInput = {
      ...baseInput,
      completedSessions: 3,
      daysSinceOnboarding: 4,
      motivationStyle: "friendly",
    };
    const result = computeVexRuntimeExperience(input);
    expect(result.completionSequence.emphasis).toBe(
      "confirmation_coach_progress_next_action",
    );
    expect(result.completionSequence.showCoachReflection).toBe(true);
  });

  it("Day 5 user sees one path, not multiple systems", () => {
    const input: VexRuntimeInput = {
      ...baseInput,
      completedSessions: 5,
      daysSinceOnboarding: 6,
      motivationStyle: "study_focused",
      primaryGoal: "study",
    };
    const result = computeVexRuntimeExperience(input);
    expect(result.studyLayerLabel).toBe("Study OS");
  });

  it("Day 7 user sees deeper mode only if configured", () => {
    const input: VexRuntimeInput = {
      ...baseInput,
      completedSessions: 7,
      daysSinceOnboarding: 8,
      motivationStyle: "friendly",
      featureAvailable: { ...baseInput.featureAvailable, premium: true },
    };
    const result = computeVexRuntimeExperience(input);
    expect(result.completionSequence.showWeeklyInsight).toBe(true);
  });

  it("premium hidden before value", () => {
    const input: VexRuntimeInput = {
      ...baseInput,
      completedSessions: 2,
      daysSinceOnboarding: 2,
      isPremium: false,
    };
    const result = computeVexRuntimeExperience(input);
    expect(result.premiumMoment.canShow).toBe(false);
  });

  it("notifications respect first-week stage", () => {
    const day0Result = computeVexRuntimeExperience(baseInput);
    expect(day0Result.notificationPolicy.maxPerDay).toBe(0);

    const day3Input: VexRuntimeInput = {
      ...baseInput,
      completedSessions: 3,
      daysSinceOnboarding: 4,
    };
    const day3Result = computeVexRuntimeExperience(day3Input);
    expect(day3Result.notificationPolicy.maxPerDay).toBe(2);
    expect(day3Result.notificationPolicy.allowedTypes.length).toBeGreaterThan(
      0,
    );
  });

  it("completion sequence changes by first-week stage", () => {
    const day0Result = computeVexRuntimeExperience(baseInput);
    expect(day0Result.completionSequence.steps.length).toBe(2);

    const day5Input: VexRuntimeInput = {
      ...baseInput,
      completedSessions: 5,
      daysSinceOnboarding: 6,
    };
    const day5Result = computeVexRuntimeExperience(day5Input);
    expect(day5Result.completionSequence.steps.length).toBeGreaterThan(
      day0Result.completionSequence.steps.length,
    );
  });

  it("coach presence tone reflects comeback state", () => {
    const comebackInput: VexRuntimeInput = {
      ...baseInput,
      completedSessions: 5,
      daysSinceOnboarding: 14,
      daysSinceLastSession: 5,
    };
    const result = computeVexRuntimeExperience(comebackInput);
    expect(result.coachPresenceTone.tone).toBe("recovering");
    expect(result.coachPresenceTone.isComeback).toBe(true);
  });
});
