import {
  WeeklyInsightInputSchema,
  WeeklyIntelligenceSchema,
  InsightFindingSchema,
  type WeeklyInsightInput,
} from '../schemas';

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

// ── buildAdjustment ────────────────────────────────────────────────────────

describe('buildAdjustment', () => {
  it('suggests reviewing weak topic for student with weakTopics', () => {
    const adj = buildAdjustment(baseInput({ lane: 'student', weakTopics: ['calculus'] }));
    expect(adj).toContain('calculus');
  });

  it('suggests longer sessions for short-averaging student', () => {
    const adj = buildAdjustment(
      baseInput({ lane: 'student', avgDurationMinutes: 10, completedSessions: 4 }),
    );
    expect(adj).toContain('under 15 minutes');
  });

  it('suggests recovery run for game_like with blockerPattern', () => {
    const adj = buildAdjustment(baseInput({ lane: 'game_like', blockerPattern: 'procrastination' }));
    expect(adj).toContain('procrastination');
  });

  it('recognises recovery wins for game_like', () => {
    const adj = buildAdjustment(baseInput({ lane: 'game_like', recoveryWins: 2 }));
    expect(adj).toContain('Recovery runs work');
  });

  it('suggests naming next move for deep_creative with stale threads', () => {
    const adj = buildAdjustment(baseInput({ lane: 'deep_creative', staleThreadDays: 4 }));
    expect(adj).toContain('next concrete move');
  });

  it('stays quieter for minimal_normal with nudge dismissals', () => {
    const adj = buildAdjustment(baseInput({ lane: 'minimal_normal', nudgeDismissals: 3 }));
    expect(adj).toContain('stay quieter');
  });

  it('returns a default for unknown scenarios', () => {
    const adj = buildAdjustment(
      baseInput({ lane: 'student', completedSessions: 1, avgDurationMinutes: 30 }),
    );
    expect(adj).toBeTruthy();
  });
});
