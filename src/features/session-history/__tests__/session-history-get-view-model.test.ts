import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';
import type { SupabaseSessionRow } from '../schemas';
import { getSessionHistoryViewModel } from '../service';
import * as repository from '../repository';

jest.mock('../repository');

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

// ── getSessionHistoryViewModel (async with mocked repo) ────────────────────

describe('getSessionHistoryViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches rows from the repository and maps them', async () => {
    jest
      .mocked(repository.fetchSessionHistoryRows)
      .mockResolvedValue([makeRow()]);

    const vm = await getSessionHistoryViewModel('user-1', 10);
    expect(repository.fetchSessionHistoryRows).toHaveBeenCalledWith('user-1', 10);
    expect(vm.items).toHaveLength(1);
  });

  it('passes default limit of 50 when not specified', async () => {
    jest.mocked(repository.fetchSessionHistoryRows).mockResolvedValue([]);

    await getSessionHistoryViewModel('user-1');
    expect(repository.fetchSessionHistoryRows).toHaveBeenCalledWith('user-1', 50);
  });
});
