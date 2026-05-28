import type { calculateFocusScoreUpdate } from "../score-algorithm";

export const userId = "123e4567-e89b-12d3-a456-426614174000";
export const occurredAt = "2026-05-06T10:00:00.000Z";

export function createInput(
  overrides: Partial<Parameters<typeof calculateFocusScoreUpdate>[0]> = {},
) {
  return {
    userId,
    previousScore: 600,
    eventType: "session:completed" as const,
    grade: "A" as const,
    sessionMode: "deep_work" as const,
    occurredAt,
    signals: {
      consistency: 72,
      streakStability: 68,
      sessionQuality: 84,
      intentionalDifficulty: 61,
      recency: 75,
    },
    ...overrides,
  };
}
