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

// ── buildWeeklyIntelligence ────────────────────────────────────────────────

describe('buildWeeklyIntelligence', () => {
  it('returns hasEnoughData=false when totalSessions < 3', () => {
    const result = buildWeeklyIntelligence(baseInput({ totalSessions: 2, totalFocusMinutes: 20 }));
    expect(result.hasEnoughData).toBe(false);
    expect(result.whatHelped).toEqual([]);
    expect(result.whatGotInWay).toEqual([]);
    expect(result.disclaimer).toContain('Not enough data');
  });

  it('returns hasEnoughData=false when totalFocusMinutes < 30', () => {
    const result = buildWeeklyIntelligence(baseInput({ totalSessions: 5, totalFocusMinutes: 20 }));
    expect(result.hasEnoughData).toBe(false);
  });

  it('returns hasEnoughData=true when thresholds are met', () => {
    const result = buildWeeklyIntelligence(baseInput());
    expect(result.hasEnoughData).toBe(true);
    expect(result.generatedAt).toBeGreaterThan(0);
  });

  it('generates a unique id per call', () => {
    const r1 = buildWeeklyIntelligence(baseInput());
    // Small delay to avoid same timestamp
    const r2 = buildWeeklyIntelligence(baseInput({ userId: 'user-2' }));
    expect(r1.id).not.toBe(r2.id);
  });

  it("sets weekLabel to 'First Week'", () => {
    const result = buildWeeklyIntelligence(baseInput());
    expect(result.weekLabel).toBe('First Week');
  });

  it('passes the lane through to the output', () => {
    const result = buildWeeklyIntelligence(baseInput({ lane: 'game_like' }));
    expect(result.lane).toBe('game_like');
  });

  it('includes a disclaimer', () => {
    const result = buildWeeklyIntelligence(baseInput());
    expect(result.disclaimer).toBeTruthy();
    expect(typeof result.disclaimer).toBe('string');
  });

  it('returns valid WeeklyIntelligence output', () => {
    const result = buildWeeklyIntelligence(baseInput());
    expect(() => WeeklyIntelligenceSchema.parse(result)).not.toThrow();
  });

  it('caps whatHelped and whatGotInWay to max 3 findings', () => {
    const result = buildWeeklyIntelligence(
      baseInput({
        completedSessions: 6,
        totalSessions: 7,
        avgFocusScore: 80,
        cleanStarts: 3,
        rescueCompleted: 2,
        bestDurationMinutes: 30,
        interruptionsAvg: 5,
        staleThreadDays: 5,
        nudgeDismissals: 4,
        avgDurationMinutes: 10,
      }),
    );
    expect(result.whatHelped.length).toBeLessThanOrEqual(3);
    expect(result.whatGotInWay.length).toBeLessThanOrEqual(3);
  });

  it('includes bestTimeWindow as suggestedFocusWindow when available', () => {
    const result = buildWeeklyIntelligence(baseInput({ bestTimeWindow: '9am-11am' }));
    expect(result.suggestedFocusWindow).toBe('9am-11am');
  });
});
