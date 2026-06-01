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

// ── Schema validation ──────────────────────────────────────────────────────

describe('weekly-intelligence schemas', () => {
  it('parses a valid WeeklyInsightInput', () => {
    const input = baseInput();
    expect(() => WeeklyInsightInputSchema.parse(input)).not.toThrow();
  });

  it('rejects negative totalSessions', () => {
    expect(() =>
      WeeklyInsightInputSchema.parse({ ...baseInput(), totalSessions: -1 }),
    ).toThrow();
  });

  it('rejects avgFocusScore above 100', () => {
    expect(() =>
      WeeklyInsightInputSchema.parse({ ...baseInput(), avgFocusScore: 101 }),
    ).toThrow();
  });

  it('parses a valid InsightFinding', () => {
    const finding = InsightFindingSchema.parse({
      category: 'helped',
      observation: 'Strong focus this week.',
      confidence: 'medium',
    });
    expect(finding.category).toBe('helped');
  });

  it('rejects an InsightFinding with empty observation', () => {
    expect(() =>
      InsightFindingSchema.parse({
        category: 'blocked',
        observation: '',
        confidence: 'weak',
      }),
    ).toThrow();
  });
});
