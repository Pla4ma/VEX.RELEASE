import { describe, expect, it, vi } from "@jest/globals";
import { createMockCoachInput } from "./input-contract-test-utils";
import { generateSessionRecommendation } from "../integration";

jest.mock("../message-quality-gate", () => ({
  validateMessageQuality: jest.fn(() => ({
    messageId: "test",
    content: "Your strongest sessions use this pattern. Try it today.",
    category: "SESSION_SUGGESTION",
    qualityElements: ["observed_behavior", "specific_recommendation"],
    isGeneric: false,
    genericReasons: [],
    passesQualityGate: true,
    confidence: 0.85,
    suggestedAction: "approve",
  })),
}));

describe("Phase 7 session recommendation integration", () => {
  it("generates session recommendation based on patterns", async () => {
    const mockInput = createMockCoachInput({
      recentSessionGrades: [
        {
          sessionId: "session-1",
          grade: 92,
          duration: 1800,
          completedAt: Date.now() - 86400000,
          difficulty: "CHALLENGING",
        },
        {
          sessionId: "session-2",
          grade: 88,
          duration: 1500,
          completedAt: Date.now() - 172800000,
          difficulty: "CHALLENGING",
        },
      ],
      preferredSessionLengths: [1800],
    });

    const suggestion = await generateSessionRecommendation(
      "user-123",
      mockInput,
    );

    expect(suggestion?.type).toBe("SESSION_RECOMMENDATION");
    expect(suggestion?.canBecomeMission).toBe(false);
    expect(suggestion?.title).toContain("30min CHALLENGING");
  });

  it("returns null with insufficient session data", async () => {
    const mockInput = createMockCoachInput({ recentSessionGrades: [] });

    await expect(
      generateSessionRecommendation("user-123", mockInput),
    ).resolves.toBeNull();
  });

  it("adjusts difficulty based on performance", async () => {
    const highPerformanceInput = createMockCoachInput({
      recentSessionGrades: [
        {
          sessionId: "session-1",
          grade: 95,
          duration: 1800,
          completedAt: Date.now() - 86400000,
          difficulty: "CHALLENGING",
        },
      ],
    });

    const suggestion = await generateSessionRecommendation(
      "user-123",
      highPerformanceInput,
    );

    expect(suggestion?.title).toContain("CHALLENGING");
  });
});
