import { useLaneViewModel } from '../hooks/useLaneViewModel';
import type { HomeModelResult } from '../../screens/home/hooks/useHomeViewModel';

describe('useLaneViewModel hook', () => {
  const createMockSharedInput = (overrides = {}) => ({
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

  const wrapModel = (sharedInput = createMockSharedInput()): HomeModelResult =>
    ({ sharedInput } as HomeModelResult);

  it('calculates todayFocusMinutes from session durations', () => {
    const model = wrapModel();
    const result = useLaneViewModel(model);
    expect(result.todayFocusMinutes).toBe(40);
  });

  it('extracts streakDays from streakQuery', () => {
    const model = wrapModel();
    const result = useLaneViewModel(model);
    expect(result.streakDays).toBe(7);
  });

  it('returns defaults for optional fields', () => {
    const model = wrapModel();
    const result = useLaneViewModel(model);
    expect(result.greeting).toBeUndefined();
    expect(result.nextReward).toBeUndefined();
    expect(result.currentMood).toBeUndefined();
    expect(result.lastCreativeSession).toBeUndefined();
  });

  it('handles missing sharedInput', () => {
    const model = { sharedInput: undefined } as HomeModelResult;
    const result = useLaneViewModel(model);
    expect(result.todayFocusMinutes).toBe(0);
    expect(result.streakDays).toBe(0);
  });

  it('handles missing historyQuery', () => {
    const model = { sharedInput: { historyQuery: undefined, streakQuery: { data: { currentDays: 2 } } } } as HomeModelResult;
    const result = useLaneViewModel(model);
    expect(result.todayFocusMinutes).toBe(0);
    expect(result.streakDays).toBe(2);
  });
});