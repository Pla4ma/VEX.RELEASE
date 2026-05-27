import { buildPostSessionNextAction } from "../service";
import { createSessionSummary, SESSION_ID } from "./ledger-test-utils";

describe("post-session next action", () => {
  it("builds route params from recommendation logic", () => {
    const action = buildPostSessionNextAction({
      summary: createSessionSummary({
        createdAt: Date.UTC(2026, 4, 15, 18),
        sessionId: SESSION_ID,
        userId: "550e8400-e29b-41d4-a716-446655440099",
      }),
    });

    expect(action.ctaLabel).toBe("Start next focus");
    expect(action.routeParams.suggestedDurationSeconds).toBeGreaterThan(0);
    expect(action.routeParams.presetMode).toBeDefined();
    expect(action.routeParams.suggestedDifficulty).toBeDefined();
    expect(action.routeParams.recommendationId).toBe(action.id);
  });

  it("creates next study action when completed session has study target", () => {
    const action = buildPostSessionNextAction({
      studyContext: {
        source: "direct",
        studyTarget: "calculus exam review",
      },
      summary: createSessionSummary({
        plannedDuration: 1500,
        sessionId: SESSION_ID,
        userId: "550e8400-e29b-41d4-a716-446655440099",
      }),
    });

    expect(action.ctaLabel).toBe("Review next");
    expect(action.reason).toContain("calculus exam review");
    expect(action.routeParams.presetMode).toBe("STUDY");
  });

  it("throws for invalid recommendation input so callers can fall back", () => {
    expect(() =>
      buildPostSessionNextAction({
        summary: createSessionSummary({ userId: "not-a-uuid" }),
      }),
    ).toThrow();
  });
});
