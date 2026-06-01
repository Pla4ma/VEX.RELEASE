import {
  WeeklyInsightInputSchema,
  WeeklyIntelligenceSchema,
  InsightFindingSchema,
  type WeeklyInsightInput,
} from '../schemas';
import { buildWeeklyIntelligence } from '../service';
import {
  buildWhatHelped,
  buildWhatGotInWay,
  resolveBestNextSessionType,
  buildAdjustment,
  buildPremiumDeeperInsight,
} from '../insight-builders/insight-builders';

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

// ── Narrative for each lane ────────────────────────────────────────────────

describe('lane narratives', () => {
  it('includes student-specific parts when cleanStarts >= 2', () => {
    const result = buildWeeklyIntelligence(baseInput({ lane: 'student', cleanStarts: 3 }));
    expect(result.recommendedAdjustment).toContain('Clean starts');
  });

  it('includes game_like recovery narrative when rescueCompleted >= 1', () => {
    const result = buildWeeklyIntelligence(baseInput({ lane: 'game_like', rescueCompleted: 1 }));
    expect(result.recommendedAdjustment).toContain('Recovery');
  });

  it('includes deep_creative stale thread narrative', () => {
    const result = buildWeeklyIntelligence(
      baseInput({ lane: 'deep_creative', staleThreadDays: 4 }),
    );
    expect(result.recommendedAdjustment).toContain('quiet');
  });

  it('includes minimal_normal quiet nudge narrative', () => {
    const result = buildWeeklyIntelligence(
      baseInput({ lane: 'minimal_normal', nudgeDismissals: 3 }),
    );
    expect(result.recommendedAdjustment).toContain('quieter');
  });
});
