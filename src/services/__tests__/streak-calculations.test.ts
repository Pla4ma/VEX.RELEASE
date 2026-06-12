import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { calculateStreakUpdate } from '../streak-calculations';
import type { StreakData } from '../streak-types';

jest.mock('../../utils/debug', () => ({
  createDebugger: () => ({
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('calculateStreakUpdate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts streak at 1 on first session (no prior session)', () => {
    const data: StreakData = {
      currentStreak: 0, longestStreak: 0, lastSessionDate: null,
      streakHistory: [], isAtRisk: false, hoursRemaining: 0,
    };
    const result = calculateStreakUpdate(data, new Date('2025-01-15T10:00:00Z'));
    expect(result.newStreak).toBe(1);
    expect(result.streakMaintained).toBe(true);
    expect(result.streakBroken).toBe(false);
  });

  it('keeps streak same when session is today with prior session', () => {
    const data: StreakData = {
      currentStreak: 5, longestStreak: 10,
      lastSessionDate: '2025-01-10T10:00:00Z',
      streakHistory: [], isAtRisk: false, hoursRemaining: 12,
    };
    const result = calculateStreakUpdate(data, new Date('2025-01-15T10:00:00Z'));
    expect(result.newStreak).toBe(5);
    expect(result.streakMaintained).toBe(true);
    expect(result.streakBroken).toBe(false);
  });

  it('increments streak when session was yesterday', () => {
    const data: StreakData = {
      currentStreak: 5, longestStreak: 10,
      lastSessionDate: '2025-01-13T10:00:00Z',
      streakHistory: [], isAtRisk: false, hoursRemaining: 12,
    };
    const result = calculateStreakUpdate(data, new Date('2025-01-14T10:00:00Z'));
    expect(result.newStreak).toBe(6);
    expect(result.streakMaintained).toBe(true);
    expect(result.streakBroken).toBe(false);
  });

  it('breaks streak when gap > 1 day from last session', () => {
    const data: StreakData = {
      currentStreak: 10, longestStreak: 15,
      lastSessionDate: '2025-01-10T10:00:00Z',
      streakHistory: [], isAtRisk: false, hoursRemaining: 12,
    };
    // Session on Jan 13 (2 days ago). Today is Jan 15.
    // sessionDay < today - 1 day → enters branch 4
    // daysSinceLast = floor((Jan15 - Jan10) / 1day) = 5 > 1 → broken
    const result = calculateStreakUpdate(data, new Date('2025-01-13T10:00:00Z'));
    expect(result.newStreak).toBe(1);
    expect(result.streakBroken).toBe(true);
    expect(result.streakMaintained).toBe(false);
  });

  it('detects new longest streak after increment from yesterday', () => {
    const data: StreakData = {
      currentStreak: 10, longestStreak: 10,
      lastSessionDate: '2025-01-13T10:00:00Z',
      streakHistory: [], isAtRisk: false, hoursRemaining: 12,
    };
    const result = calculateStreakUpdate(data, new Date('2025-01-14T10:00:00Z'));
    expect(result.newStreak).toBe(11);
    expect(result.newLongestStreak).toBe(true);
  });

  it('detects when longest streak not exceeded', () => {
    const data: StreakData = {
      currentStreak: 5, longestStreak: 10,
      lastSessionDate: '2025-01-13T10:00:00Z',
      streakHistory: [], isAtRisk: false, hoursRemaining: 12,
    };
    const result = calculateStreakUpdate(data, new Date('2025-01-14T10:00:00Z'));
    expect(result.newStreak).toBe(6);
    expect(result.newLongestStreak).toBe(false);
  });

  it('returns unchanged for future session date', () => {
    const data: StreakData = {
      currentStreak: 5, longestStreak: 10,
      lastSessionDate: '2025-01-10T10:00:00Z',
      streakHistory: [], isAtRisk: false, hoursRemaining: 12,
    };
    const result = calculateStreakUpdate(data, new Date('2025-01-16T10:00:00Z'));
    expect(result.newStreak).toBe(5);
    expect(result.streakMaintained).toBe(false);
    expect(result.streakBroken).toBe(false);
    expect(result.newLongestStreak).toBe(false);
  });

  it('handles year boundary correctly', () => {
    jest.setSystemTime(new Date('2025-01-02T12:00:00Z'));
    const data: StreakData = {
      currentStreak: 3, longestStreak: 5,
      lastSessionDate: '2024-12-31T10:00:00Z',
      streakHistory: [], isAtRisk: false, hoursRemaining: 12,
    };
    const result = calculateStreakUpdate(data, new Date('2025-01-01T10:00:00Z'));
    expect(result.newStreak).toBe(4);
    expect(result.streakMaintained).toBe(true);
  });

  it('handles month boundary correctly', () => {
    jest.setSystemTime(new Date('2025-02-01T12:00:00Z'));
    const data: StreakData = {
      currentStreak: 5, longestStreak: 10,
      lastSessionDate: '2025-01-30T10:00:00Z',
      streakHistory: [], isAtRisk: false, hoursRemaining: 12,
    };
    const result = calculateStreakUpdate(data, new Date('2025-01-31T10:00:00Z'));
    expect(result.newStreak).toBe(6);
    expect(result.streakMaintained).toBe(true);
  });

  it('resets to 1 with large gap', () => {
    jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    const data: StreakData = {
      currentStreak: 30, longestStreak: 30,
      lastSessionDate: '2024-12-01T10:00:00Z',
      streakHistory: [], isAtRisk: false, hoursRemaining: 12,
    };
    // Session on Jan 10 (5 days ago). Today is Jan 15.
    // sessionDay < today - 1 day → branch 4
    // daysSinceLast = floor((Jan15 - Dec01) / 1day) = 45 > 1 → broken
    const result = calculateStreakUpdate(data, new Date('2025-01-10T10:00:00Z'));
    expect(result.streakBroken).toBe(true);
    expect(result.newStreak).toBe(1);
  });

  it('maintains without incrementing when session same day as last', () => {
    const data: StreakData = {
      currentStreak: 5, longestStreak: 10,
      lastSessionDate: '2025-01-15T08:00:00Z',
      streakHistory: [], isAtRisk: false, hoursRemaining: 12,
    };
    const result = calculateStreakUpdate(data, new Date('2025-01-15T14:00:00Z'));
    expect(result.newStreak).toBe(5);
    expect(result.streakMaintained).toBe(true);
  });

  it('increments when session day is 2 days ago but last session was yesterday', () => {
    const data: StreakData = {
      currentStreak: 5, longestStreak: 10,
      lastSessionDate: '2025-01-14T10:00:00Z',
      streakHistory: [], isAtRisk: false, hoursRemaining: 12,
    };
    const result = calculateStreakUpdate(data, new Date('2025-01-13T10:00:00Z'));
    expect(result.streakBroken).toBe(false);
    expect(result.streakMaintained).toBe(true);
    expect(result.newStreak).toBe(6);
  });
});
