import { formatRecommendation } from "../recommendation-pipeline";

describe("formatRecommendation", () => {
  it("formats session recommendation", () => {
    const recommendation = {
      id: "rec-1",
      userId: "user-123",
      type: "session" as const,
      title: "Protect Streak",
      description: "Keep your streak alive",
      reasoning: "Test",
      confidence: 0.9,
      priority: "critical" as const,
      actionType: "start_session" as const,
      suggestedDuration: 15,
      suggestedDifficulty: "easy" as const,
      expiresAt: Date.now() + 60 * 60 * 1000,
    };
    const formatted = formatRecommendation(recommendation);
    expect(formatted.title).toBe("Protect Streak");
    expect(formatted.subtitle).toBe("Keep your streak alive");
    expect(formatted.cta).toContain("Easy Start");
    expect(formatted.cta).toContain("15m");
  });
  it("formats break recommendation", () => {
    const recommendation = {
      id: "rec-1",
      userId: "user-123",
      type: "break" as const,
      title: "Take a Break",
      description: "Rest and recover",
      reasoning: "Test",
      confidence: 0.9,
      priority: "low" as const,
      actionType: "take_break" as const,
      expiresAt: Date.now() + 60 * 60 * 1000,
    };
    const formatted = formatRecommendation(recommendation);
    expect(formatted.cta).toBe("Take Break");
  });
  it("formats squad recommendation", () => {
    const recommendation = {
      id: "rec-1",
      userId: "user-123",
      type: "social" as const,
      title: "Join Squad War",
      description: "Help your squad win",
      reasoning: "Test",
      confidence: 0.9,
      priority: "medium" as const,
      actionType: "join_squad" as const,
      expiresAt: Date.now() + 60 * 60 * 1000,
    };
    const formatted = formatRecommendation(recommendation);
    expect(formatted.cta).toBe("View Squad");
  });
});
