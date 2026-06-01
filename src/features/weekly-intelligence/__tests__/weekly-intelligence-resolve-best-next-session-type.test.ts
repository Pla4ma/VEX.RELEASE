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

// ── resolveBestNextSessionType ─────────────────────────────────────────────

describe('resolveBestNextSessionType', () => {
  it('returns STUDY for student lane with avg >= 20', () => {
    expect(resolveBestNextSessionType(baseInput({ lane: 'student', avgDurationMinutes: 25 }))).toBe('STUDY');
  });

  it('returns REVIEW for student lane with avg < 20', () => {
    expect(resolveBestNextSessionType(baseInput({ lane: 'student', avgDurationMinutes: 15 }))).toBe('REVIEW');
  });

  it('returns SPRINT for game_like lane with cleanStarts >= 3', () => {
    expect(
      resolveBestNextSessionType(baseInput({ lane: 'game_like', cleanStarts: 3 })),
    ).toBe('SPRINT');
  });

  it('returns RECOVERY for game_like lane with cleanStarts < 3', () => {
    expect(
      resolveBestNextSessionType(baseInput({ lane: 'game_like', cleanStarts: 1 })),
    ).toBe('RECOVERY');
  });

  it('returns DEEP_WORK for deep_creative lane with avg >= 25', () => {
    expect(
      resolveBestNextSessionType(baseInput({ lane: 'deep_creative', avgDurationMinutes: 30 })),
    ).toBe('DEEP_WORK');
  });

  it('returns LIGHT_FOCUS for deep_creative lane with avg < 25', () => {
    expect(
      resolveBestNextSessionType(baseInput({ lane: 'deep_creative', avgDurationMinutes: 20 })),
    ).toBe('LIGHT_FOCUS');
  });

  it('returns LIGHT_FOCUS for minimal_normal lane', () => {
    expect(resolveBestNextSessionType(baseInput({ lane: 'minimal_normal' }))).toBe('LIGHT_FOCUS');
  });
});
