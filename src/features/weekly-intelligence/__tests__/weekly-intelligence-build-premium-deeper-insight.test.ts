import {
  WeeklyInsightInputSchema,
  type WeeklyInsightInput,
} from '../schemas';

import { buildPremiumDeeperInsight } from '../insight-builders/insight-builders';

// ── Helpers ────────────────────────────────────────────────────────────────

function baseInput(overrides: Partial<WeeklyInsightInput> = {}): WeeklyInsightInput {
  return WeeklyInsightInputSchema.parse({
    userId: 'user-1',
    lane: 'student',
    totalSessions: 5,
    totalFocusMinutes: 120,
    completedSessions: 4,
    avgDurationMinutes: 25,
    bestDurationMinutes: 40,
    rescueCompleted: 0,
    reflectionCount: 2,
    ...overrides,
  });
}

// ────────────────────────────────────────────────

describe('', () => {
  it.each(['student', 'game_like', 'deep_creative', 'minimal_normal'] as const)(
    'returns a premium insight string for %s lane',
    (lane) => {
      const insight = buildPremiumDeeperInsight(baseInput({ lane }));
      expect(typeof insight).toBe('string');
      expect(insight!.length).toBeGreaterThan(0);
    },
  );
});
