import {
  CoachRecommendationSchema,
  generateRecommendations,
} from "../recommendation-pipeline";
import { mockContext } from "./recommendation-test-fixtures";

describe("CoachRecommendationSchema", () => {
  it("validates valid recommendation", () => {
    const validRecommendation = {
      id: "rec-123",
      userId: "user-123",
      type: "session",
      title: "Protect Your Streak",
      description: "Complete a session to keep your streak",
      reasoning: "Streak at risk",
      confidence: 0.95,
      priority: "critical",
      actionType: "start_session",
      suggestedDuration: 15,
      suggestedDifficulty: "easy",
      expiresAt: Date.now() + 6 * 60 * 60 * 1000,
    };
    expect(CoachRecommendationSchema.parse(validRecommendation)).toEqual(
      validRecommendation,
    );
  });
  it("rejects invalid type", () => {
    expect(() =>
      CoachRecommendationSchema.parse({
        id: "rec-123",
        userId: "user-123",
        type: "invalid_type",
        title: "Test",
        description: "Test",
        reasoning: "Test",
        confidence: 0.5,
        priority: "low",
        actionType: "start_session",
        expiresAt: Date.now(),
      }),
    ).toThrow();
  });
  it("rejects confidence out of range", () => {
    expect(() =>
      CoachRecommendationSchema.parse({
        id: "rec-123",
        userId: "user-123",
        type: "session",
        title: "Test",
        description: "Test",
        reasoning: "Test",
        confidence: 1.5,
        priority: "low",
        actionType: "start_session",
        expiresAt: Date.now(),
      }),
    ).toThrow();
  });
});

describe("generateRecommendations", () => {
  it("generates recommendations based on context", async () => {
    const recommendations = await generateRecommendations(
      "user-123",
      mockContext,
    );
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0]).toHaveProperty("title");
    expect(recommendations[0]).toHaveProperty("priority");
  });
  it("includes boss recommendation when boss active", async () => {
    const recommendations = await generateRecommendations(
      "user-123",
      mockContext,
    );
    const bossRec = recommendations.find((r) => r.title.includes("Boss"));
    expect(bossRec).toBeDefined();
    expect(bossRec?.priority).toBe("high");
  });
  it("includes squad war recommendation when war active", async () => {
    const recommendations = await generateRecommendations(
      "user-123",
      mockContext,
    );
    const warRec = recommendations.find((r) => r.title.includes("War"));
    expect(warRec).toBeDefined();
  });
  it("sorts by priority (critical first)", async () => {
    const contextWithStreakRisk = {
      ...mockContext,
      streakContext: { ...mockContext.streakContext, streakAtRisk: true },
    };
    const recommendations = await generateRecommendations(
      "user-123",
      contextWithStreakRisk,
    );
    expect(recommendations[0].priority).toBe("critical");
  });
});
