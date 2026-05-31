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

// ── buildWhatGotInWay ──────────────────────────────────────────────────────

describe('buildWhatGotInWay', () => {
  it('includes missed sessions when total > completed', () => {
    const findings = buildWhatGotInWay(baseInput({ totalSessions: 6, completedSessions: 3 }));
    const missed = findings.find((f) => f.observation.includes('not completed'));
    expect(missed).toBeDefined();
  });

  it('includes interruptions finding when avg >= 3', () => {
    const findings = buildWhatGotInWay(baseInput({ interruptionsAvg: 4 }));
    const interruptions = findings.find((f) => f.observation.includes('Interruptions'));
    expect(interruptions).toBeDefined();
  });

  it('includes stale thread finding when staleThreadDays >= 3', () => {
    const findings = buildWhatGotInWay(baseInput({ staleThreadDays: 5 }));
    const stale = findings.find((f) => f.observation.includes('stale'));
    expect(stale).toBeDefined();
  });

  it('includes nudge dismissals finding when nudgeDismissals >= 2', () => {
    const findings = buildWhatGotInWay(baseInput({ nudgeDismissals: 3 }));
    const nudge = findings.find((f) => f.observation.includes('Dismissed'));
    expect(nudge).toBeDefined();
  });

  it('includes short sessions finding when avg < 15 and completed >= 3', () => {
    const findings = buildWhatGotInWay(
      baseInput({ avgDurationMinutes: 10, completedSessions: 4, totalSessions: 5 }),
    );
    const short = findings.find((f) => f.observation.includes('under 15 minutes'));
    expect(short).toBeDefined();
  });

  it('returns empty when all sessions are completed and no blockers', () => {
    const findings = buildWhatGotInWay(
      baseInput({ totalSessions: 3, completedSessions: 3, avgDurationMinutes: 25 }),
    );
    expect(findings).toEqual([]);
  });
});
