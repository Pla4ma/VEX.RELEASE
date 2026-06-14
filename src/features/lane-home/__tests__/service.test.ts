import { buildLaneViewModel } from '../service';
import type { HomeModelResult } from '../../screens/home/hooks/useHomeViewModel';

describe('lane-home service', () => {
  const createMockHomeModel = (overrides: Partial<HomeModelResult['sharedInput']> = {}): HomeModelResult['sharedInput'] => ({
    historyQuery: {
      history: [
        { id: '1', duration: 1500, createdAt: '2026-06-14T10:00:00.000Z' },
        { id: '2', duration: 900, createdAt: '2026-06-14T09:00:00.000Z' },
      ],
    },
    streakQuery: {
      data: { currentDays: 7 },
    },
    ...overrides,
  });

  const wrapModel = (sharedInput: HomeModelResult['sharedInput'] = createMockHomeModel()): HomeModelResult =>
    ({ sharedInput } as HomeModelResult);

  it('calculates todayFocusMinutes from session durations', () => {
    const model = wrapModel();
    const result = buildLaneViewModel(model);
    expect(result.todayFocusMinutes).toBe(40);
  });

  it('extracts streakDays from streakQuery', () => {
    const model = wrapModel();
    const result = buildLaneViewModel(model);
    expect(result.streakDays).toBe(7);
  });

  it('returns streakDays=0 when streakQuery missing', () => {
    const model = wrapModel({
      historyQuery: { history: [] },
      streakQuery: { data: undefined },
    });
    const result = buildLaneViewModel(model);
    expect(result.streakDays).toBe(0);
  });

  it('returns todayFocusMinutes=0 for empty history', () => {
    const model = wrapModel({
      historyQuery: { history: [] },
      streakQuery: { data: { currentDays: 5 } },
    });
    const result = buildLaneViewModel(model);
    expect(result.todayFocusMinutes).toBe(0);
  });

  it('formats lastSession from first history entry', () => {
    const model = wrapModel();
    const result = buildLaneViewModel(model);
    expect(result.lastSession).toBe('25m session');
  });

  it('returns undefined lastSession for empty history', () => {
    const model = wrapModel({
      historyQuery: { history: [] },
      streakQuery: { data: { currentDays: 1 } },
    });
    const result = buildLaneViewModel(model);
    expect(result.lastSession).toBeUndefined();
  });

  it('returns default values for computed fields', () => {
    const model = wrapModel();
    const result = buildLaneViewModel(model);
    expect(result.hasStudyPlan).toBe(false);
    expect(result.todayTasks).toEqual([]);
    expect(result.weekProgress).toBe(0);
    expect(result.bossHealth).toBe(0);
    expect(result.bossMaxHealth).toBe(100);
    expect(result.currentRank).toBe('Novice');
    expect(result.weeklyDamage).toBe(0);
    expect(result.activeProjects).toEqual([]);
    expect(result.inspirationPrompt).toBe('What are you creating today?');
    expect(result.nextSuggestedDuration).toBe(25);
  });

  it('handles missing sharedInput gracefully', () => {
    const model = { sharedInput: undefined } as HomeModelResult;
    const result = buildLaneViewModel(model);
    expect(result.todayFocusMinutes).toBe(0);
    expect(result.streakDays).toBe(0);
    expect(result.lastSession).toBeUndefined();
  });

  it('handles missing historyQuery gracefully', () => {
    const model = { sharedInput: { historyQuery: undefined, streakQuery: { data: { currentDays: 3 } } } } as HomeModelResult;
    const result = buildLaneViewModel(model);
    expect(result.todayFocusMinutes).toBe(0);
    expect(result.streakDays).toBe(3);
  });
});