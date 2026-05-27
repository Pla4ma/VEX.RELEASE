import { describe, expect, it } from "@jest/globals";
import { createMockCoachInput } from "../input-contract";
import {
  generateMissionSuggestion,
  handleStreakRiskIntegration,
  shouldCoachShowSuggestion,
} from "../phase7-integration";
import type { PriorityEngine } from "../phase7-schemas";

describe("Phase 7 streak and priority integration", () => {
  it("generates streak protection suggestion for critical risk", async () => {
    const suggestion = await handleStreakRiskIntegration("user-123", {
      currentStreak: 5,
      hoursSinceLastSession: 22,
      riskLevel: "critical",
    });

    expect(suggestion?.type).toBe("STREAK_PROTECTION");
    expect(suggestion?.priority).toBe("critical");
    expect(suggestion?.canBecomeMission).toBe(true);
    expect(suggestion?.title).toBe("Protect Your Streak!");
  });

  it("does not intervene for low risk", async () => {
    await expect(
      handleStreakRiskIntegration("user-123", {
        currentStreak: 10,
        hoursSinceLastSession: 8,
        riskLevel: "low",
      }),
    ).resolves.toBeNull();
  });

  it("adjusts expiration time based on urgency", async () => {
    const suggestion = await handleStreakRiskIntegration("user-123", {
      currentStreak: 3,
      hoursSinceLastSession: 10,
      riskLevel: "high",
    });

    expect(suggestion?.expiresAt).toBeLessThan(Date.now() + 3 * 60 * 60 * 1000);
  });

  it.each([
    [{ streakCritical: true, pendingSync: false }, "high", false],
    [{ streakCritical: false, pendingSync: true }, "medium", false],
    [
      { streakCritical: false, pendingSync: false, dailyMissionReminder: true },
      "critical",
      true,
    ],
    [{ streakCritical: false, pendingSync: false }, "high", true],
    [
      { streakCritical: false, pendingSync: false, dailyMissionReminder: true },
      "low",
      false,
    ],
  ])("evaluates priority state %#", (partialState, priority, expected) => {
    const state: PriorityEngine = {
      streakCritical: false,
      pendingSync: false,
      coachNextAction: false,
      dailyMissionReminder: false,
      squadHelp: false,
      ...partialState,
    };

    expect(
      shouldCoachShowSuggestion(
        state,
        priority as "critical" | "high" | "medium" | "low",
      ),
    ).toBe(expected);
  });

  it("handles empty input contract gracefully", async () => {
    const emptyInput = createMockCoachInput({
      recentSessionGrades: [],
      streakState: {
        currentStreak: 0,
        streakAtRisk: true,
        hoursSinceLastSession: 21,
        streakRecord: 0,
        missedDays: 0,
      },
    });

    await expect(
      generateMissionSuggestion("user-123", emptyInput),
    ).resolves.toBeDefined();
  });

  it("handles malformed streak data without throwing", async () => {
    const suggestion = await handleStreakRiskIntegration("user-123", {
      currentStreak: -1,
      hoursSinceLastSession: -1,
      riskLevel: "invalid",
    });

    expect(suggestion).toBeDefined();
  });
});
