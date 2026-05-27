import {
  buildFallbackResponse,
  generateAIResponse,
  handleAIRequest,
  renderPromptTemplate,
} from "../edge-function-service";
import type { GenerateStreakRiskNudgeRequest } from "../ai-types";

const streakNudgeRequest: GenerateStreakRiskNudgeRequest = {
  requestType: "GENERATE_STREAK_RISK_NUDGE",
  userId: "550e8400-e29b-41d4-a716-446655440000",
  context: {
    currentStreak: 7,
    hoursRemaining: 3,
    riskLevel: "high",
    lastSessionQuality: 82,
  },
};

describe("edge-function-service", () => {
  it("validates route and request type alignment", async () => {
    const result = await handleAIRequest("coach-message", streakNudgeRequest, {
      getEnv: () => undefined,
    });

    expect(result.status).toBe(400);
    expect(result.body).toEqual({
      error:
        "Route expects GENERATE_COACH_MESSAGE, received GENERATE_STREAK_RISK_NUDGE",
    });
  });

  it("returns fallback content when Gemini is unavailable", async () => {
    const response = await generateAIResponse(streakNudgeRequest, {
      getEnv: () => undefined,
      now: () => 1000,
    });

    expect(response.success).toBe(true);
    expect(response.metadata.model).toBe("fallback");
    expect(response.error?.code).toBe("FALLBACK_USED");
    expect(response.content).toContain("streak");
  });

  it("generates a streak nudge through the Gemini path end to end", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: "🔥 Your 7-day streak is close-call territory. Lock in 15 minutes now.",
                },
              ],
              role: "model",
            },
            finishReason: "STOP",
            index: 0,
            safetyRatings: [],
          },
        ],
        usageMetadata: {
          promptTokenCount: 12,
          candidatesTokenCount: 18,
          totalTokenCount: 30,
        },
      }),
    });

    const result = await handleAIRequest("streak-nudge", streakNudgeRequest, {
      fetchImpl,
      getEnv: (name) => {
        if (name === "GEMINI_API_KEY") {
          return "test-key";
        }
        if (name === "GEMINI_MODEL_FLASH") {
          return "gemini-2.5-flash";
        }
        return undefined;
      },
      now: () => 5000,
    });

    expect(result.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(result.body).toMatchObject({
      success: true,
      requestType: "GENERATE_STREAK_RISK_NUDGE",
      content:
        "🔥 Your 7-day streak is close-call territory. Lock in 15 minutes now.",
      structuredData: {
        streakCount: 7,
        suggestedDuration: 15,
        emoji: "🔥",
      },
    });
  });

  it("renders prompt templates with request context", () => {
    const rendered = renderPromptTemplate(streakNudgeRequest);

    expect(rendered).toContain("Current Streak: 7 days");
    expect(rendered).toContain("Hours Remaining: 3");
    expect(rendered).toContain("Risk Level: high");
  });

  it("builds a typed fallback response shape", () => {
    const response = buildFallbackResponse(streakNudgeRequest, "timeout", 42);

    expect(response.metadata.processingTimeMs).toBe(42);
    expect(response.structuredData).toMatchObject({
      streakCount: 7,
      suggestedDuration: 15,
    });
  });
});
