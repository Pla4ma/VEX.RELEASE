import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';
import type { SupabaseSessionRow } from '../schemas';
import {
  buildSessionHistoryViewModel,
  getSessionHistoryViewModel,
} from '../service';
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

// ── buildSessionHistoryViewModel ───────────────────────────────────────────

describe('buildSessionHistoryViewModel', () => {
  it('returns empty stats for an empty row list', () => {
    const vm = buildSessionHistoryViewModel([]);
    expect(vm.items).toEqual([]);
    expect(vm.stats.totalSessions).toBe(0);
    expect(vm.stats.completedSessions).toBe(0);
    expect(vm.stats.totalFocusSeconds).toBe(0);
    expect(vm.stats.averageScore).toBeNull();
  });

  it('counts completed sessions correctly', () => {
    const rows = [
      makeRow({ id: 's1', status: 'COMPLETED' }),
      makeRow({ id: 's2', status: 'ABANDONED' }),
      makeRow({ id: 's3', status: 'COMPLETED' }),
    ];
    const vm = buildSessionHistoryViewModel(rows);
    expect(vm.stats.totalSessions).toBe(3);
    expect(vm.stats.completedSessions).toBe(2);
  });

  it('sums total focus seconds from effective duration', () => {
    const rows = [
      makeRow({ id: 's1', effective_duration: 1000 }),
      makeRow({ id: 's2', effective_duration: 500 }),
    ];
    const vm = buildSessionHistoryViewModel(rows);
    expect(vm.stats.totalFocusSeconds).toBe(1500);
  });

  it('computes average score across items', () => {
    const rows = [
      makeRow({ id: 's1', quality_score: 80 }),
      makeRow({ id: 's2', quality_score: 60 }),
    ];
    const vm = buildSessionHistoryViewModel(rows);
    // 80*10=800, 60*10=600 → avg = 700
    expect(vm.stats.averageScore).toBe(700);
  });

  it('produces items that validate against the schema', () => {
    const vm = buildSessionHistoryViewModel([makeRow()]);
    expect(vm.items).toHaveLength(1);
    expect(vm.items[0]?.sessionId).toBe('session-1');
  });
});

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
