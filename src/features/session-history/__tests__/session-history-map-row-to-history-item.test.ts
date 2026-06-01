import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';
import type { SupabaseSessionRow } from '../schemas';
import { mapSessionRowToHistoryItem } from '../service';

// ── Fixtures ───────────────────────────────────────────────────────────────

function makeRow(overrides: Partial<SupabaseSessionRow> = {}): SupabaseSessionRow {
  return {
    id: 'session-1',
    user_id: 'user-1',
    status: 'COMPLETED',
    duration: 1500,
    effective_duration: 1320,
    quality_score: 91,
    mode: 'DEEP_WORK',
    difficulty: 'MEDIUM',
    metadata: {},
    started_at: '2026-05-20T14:00:00.000Z',
    completed_at: '2026-05-20T14:25:00.000Z',
    ended_at: '2026-05-20T14:25:00.000Z',
    created_at: '2026-05-20T13:59:00.000Z',
    updated_at: '2026-05-20T14:25:00.000Z',
    ...overrides,
  };
}

function makeSummary(overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    sessionId: 'session-1',
    userId: 'user-1',
    status: 'COMPLETED',
    sessionMode: SessionMode.DEEP_WORK,
    plannedDuration: 1500,
    actualDuration: 1500,
    effectiveDuration: 1320,
    pausedDuration: 0,
    completionPercentage: 100,
    focusQuality: 91,
    focusPurityScore: 91,
    interruptions: 0,
    pauses: 0,
    pausedTime: 0,
    streakMaintained: true,
    modeBonus: 0,
    baseScore: 910,
    timeBonus: 0,
    finalScore: 910,
    createdAt: Date.parse('2026-05-20T13:59:00.000Z'),
    streakIncreased: true,
    streakDays: 4,
    xpEarned: 120,
    coinsEarned: 16,
    gemsEarned: 0,
    userLevel: 3,
    bonuses: [],
    damageTaken: 0,
    penaltiesApplied: [],
    vsAverage: 0,
    vsBest: 0,
    ...overrides,
  };
}

// ── mapSessionRowToHistoryItem ─────────────────────────────────────────────

describe('mapSessionRowToHistoryItem', () => {
  it('maps basic row fields correctly', () => {
    const item = mapSessionRowToHistoryItem(makeRow());
    expect(item.sessionId).toBe('session-1');
    expect(item.userId).toBe('user-1');
    expect(item.mode).toBe(SessionMode.DEEP_WORK);
    expect(item.status).toBe('COMPLETED');
  });

  it('converts quality_score ≤100 into a ×10 finalScore', () => {
    const item = mapSessionRowToHistoryItem(makeRow({ quality_score: 85 }));
    expect(item.finalScore).toBe(850);
  });

  it('uses quality_score directly when > 100 (already scaled)', () => {
    const item = mapSessionRowToHistoryItem(makeRow({ quality_score: 910 }));
    expect(item.finalScore).toBe(910);
  });

  it('defaults to 0 when quality_score is null', () => {
    const item = mapSessionRowToHistoryItem(makeRow({ quality_score: null }));
    expect(item.finalScore).toBe(0);
  });

  it('assigns grade S for scores >= 900', () => {
    const item = mapSessionRowToHistoryItem(makeRow({ quality_score: 95 }));
    expect(item.grade).toBe('S');
  });

  it('assigns grade A for scores >= 800', () => {
    const item = mapSessionRowToHistoryItem(makeRow({ quality_score: 82 }));
    expect(item.grade).toBe('A');
  });

  it('assigns grade B for scores >= 700', () => {
    const item = mapSessionRowToHistoryItem(makeRow({ quality_score: 75 }));
    expect(item.grade).toBe('B');
  });

  it('assigns grade C for scores >= 600', () => {
    const item = mapSessionRowToHistoryItem(makeRow({ quality_score: 65 }));
    expect(item.grade).toBe('C');
  });

  it('assigns grade D for scores >= 500', () => {
    const item = mapSessionRowToHistoryItem(makeRow({ quality_score: 55 }));
    expect(item.grade).toBe('D');
  });

  it('assigns grade F for scores < 500', () => {
    const item = mapSessionRowToHistoryItem(makeRow({ quality_score: 40 }));
    expect(item.grade).toBe('F');
  });

  it('normalizes unknown status to DEGRADED', () => {
    const item = mapSessionRowToHistoryItem(makeRow({ status: 'MYSTERY' }));
    expect(item.status).toBe('DEGRADED');
  });

  it('preserves validated summary from metadata', () => {
    const summary = makeSummary({ xpEarned: 200 });
    const item = mapSessionRowToHistoryItem({
      ...makeRow(),
      metadata: { summary },
    });
    expect(item.summary?.xpEarned).toBe(200);
    expect(item.finalScore).toBe(910);
  });

  it('uses summary.effectiveDuration over row effective_duration', () => {
    const summary = makeSummary({ effectiveDuration: 1100 });
    const item = mapSessionRowToHistoryItem({
      ...makeRow({ effective_duration: 1320 }),
      metadata: { summary },
    });
    expect(item.effectiveDurationSeconds).toBe(1100);
  });

  it('falls back to row.effective_duration when no summary', () => {
    const item = mapSessionRowToHistoryItem(
      makeRow({ effective_duration: 900 }),
    );
    expect(item.effectiveDurationSeconds).toBe(900);
  });

  it('falls back to row.duration when effective_duration is null and no summary', () => {
    const item = mapSessionRowToHistoryItem(
      makeRow({ effective_duration: null, duration: 1500 }),
    );
    expect(item.effectiveDurationSeconds).toBe(1500);
  });

  it('uses metadata name as title when present', () => {
    const item = mapSessionRowToHistoryItem({
      ...makeRow(),
      metadata: { name: 'Morning focus' },
    });
    expect(item.title).toBe('Morning focus');
  });

  it('derives a mode-based title when no metadata name', () => {
    const item = mapSessionRowToHistoryItem(makeRow({ mode: 'STUDY' }));
    expect(item.title).toBe('Study focus');
  });

  it('handles null started_at by falling back to created_at', () => {
    const item = mapSessionRowToHistoryItem(
      makeRow({ started_at: null, created_at: '2026-05-20T13:59:00.000Z' }),
    );
    expect(item.startedAtMs).toBe(Date.parse('2026-05-20T13:59:00.000Z'));
  });

  it('sets completedAtMs to null when completed_at is null', () => {
    const item = mapSessionRowToHistoryItem(makeRow({ completed_at: null }));
    expect(item.completedAtMs).toBeNull();
  });

  it('defaults streakMaintained to false when no summary or metadata hint', () => {
    const item = mapSessionRowToHistoryItem(makeRow({ metadata: {} }));
    expect(item.streakMaintained).toBe(false);
  });

  it('uses metadata.streakMaintained when no summary', () => {
    const item = mapSessionRowToHistoryItem({
      ...makeRow(),
      metadata: { streakMaintained: true },
    });
    expect(item.streakMaintained).toBe(true);
  });
});
