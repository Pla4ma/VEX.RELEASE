/**
 * Streaks Comprehensive Tests — Helpers
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect } from '@jest/globals';

import {
  determineStreakState,
  calculateHoursUntilStreakBreak,
  getStreakStateInfo,
  getStreakVisualIndicator,
} from '../helpers';

import type { StreakState } from '../types';

describe('determineStreakState', () => {
  it('returns PROTECTED when has insurance', () => {
    expect(determineStreakState(5, true, 10)).toBe('PROTECTED');
  });

  it('returns BROKEN when hoursRemaining is null', () => {
    expect(determineStreakState(5, false, null)).toBe('BROKEN');
  });

  it('returns BROKEN when hoursRemaining <= 0', () => {
    expect(determineStreakState(5, false, 0)).toBe('BROKEN');
  });

  it('returns RECOVERING when streakDays is 0', () => {
    expect(determineStreakState(0, false, 10)).toBe('RECOVERING');
  });

  it('returns AT_RISK when hoursRemaining <= 20', () => {
    expect(determineStreakState(5, false, 15)).toBe('AT_RISK');
  });

  it('returns ACTIVE when hoursRemaining > 20 and streakDays > 0', () => {
    expect(determineStreakState(5, false, 21)).toBe('ACTIVE');
  });

  it('returns AT_RISK at exact boundary of 20', () => {
    expect(determineStreakState(5, false, 20)).toBe('AT_RISK');
  });
});

// ============================================================================
// calculateHoursUntilStreakBreak
// ============================================================================
describe('calculateHoursUntilStreakBreak', () => {
  it('returns a non-negative number', () => {
    const result = calculateHoursUntilStreakBreak();
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('returns fewer hours later in the day', () => {
    const morning = new Date();
    morning.setHours(8, 0, 0, 0);
    const evening = new Date();
    evening.setHours(20, 0, 0, 0);
    const morningHours = calculateHoursUntilStreakBreak(morning.getTime());
    const eveningHours = calculateHoursUntilStreakBreak(evening.getTime());
    expect(morningHours).toBeGreaterThan(eveningHours);
  });

  it('returns 0 at end of day', () => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    expect(calculateHoursUntilStreakBreak(endOfDay.getTime())).toBe(0);
  });
});

// ============================================================================
// getStreakStateInfo
// ============================================================================
describe('getStreakStateInfo', () => {
  it('returns correct info for ACTIVE', () => {
    const info = getStreakStateInfo('ACTIVE');
    expect(info.label).toBe('Active');
    expect(info.icon).toBe('🔥');
    expect(info.urgency).toBe('none');
  });

  it('returns correct info for AT_RISK', () => {
    const info = getStreakStateInfo('AT_RISK');
    expect(info.label).toBe('At Risk');
    expect(info.urgency).toBe('medium');
  });

  it('returns correct info for CRITICAL', () => {
    const info = getStreakStateInfo('CRITICAL');
    expect(info.label).toBe('Critical');
    expect(info.urgency).toBe('critical');
  });

  it('returns correct info for BROKEN', () => {
    const info = getStreakStateInfo('BROKEN');
    expect(info.label).toBe('Broken');
    expect(info.icon).toBe('💔');
  });

  it('returns correct info for RECOVERING', () => {
    const info = getStreakStateInfo('RECOVERING');
    expect(info.label).toBe('Recovering');
  });

  it('returns correct info for PROTECTED', () => {
    const info = getStreakStateInfo('PROTECTED');
    expect(info.label).toBe('Protected');
    expect(info.icon).toBe('🛡️');
  });

  it('returns fallback for unknown state', () => {
    const info = getStreakStateInfo('UNKNOWN' as StreakState);
    expect(info.label).toBe('Unknown');
  });
});

// ============================================================================
// getStreakVisualIndicator
// ============================================================================
describe('getStreakVisualIndicator', () => {
  it('returns flame type for ACTIVE', () => {
    const indicator = getStreakVisualIndicator('ACTIVE', 5);
    expect(indicator.type).toBe('flame');
    expect(indicator.intensity).toBeGreaterThan(0);
  });

  it('returns milestone-glow animation for streak >= 7', () => {
    const indicator = getStreakVisualIndicator('ACTIVE', 7);
    expect(indicator.animation).toBe('milestone-glow');
  });

  it('returns glow animation for streak < 7', () => {
    const indicator = getStreakVisualIndicator('ACTIVE', 3);
    expect(indicator.animation).toBe('glow');
  });

  it('returns pulse for AT_RISK', () => {
    const indicator = getStreakVisualIndicator('AT_RISK', 5);
    expect(indicator.type).toBe('pulse');
    expect(indicator.animation).toBe('warning-pulse');
  });

  it('returns shake for CRITICAL', () => {
    const indicator = getStreakVisualIndicator('CRITICAL', 5);
    expect(indicator.type).toBe('critical');
    expect(indicator.animation).toBe('shake');
  });

  it('returns broken for BROKEN', () => {
    const indicator = getStreakVisualIndicator('BROKEN', 0);
    expect(indicator.type).toBe('broken');
    expect(indicator.intensity).toBe(0);
  });

  it('returns shield for PROTECTED', () => {
    const indicator = getStreakVisualIndicator('PROTECTED', 5);
    expect(indicator.type).toBe('shield');
  });

  it('intensity increases with streak days (ACTIVE)', () => {
    const low = getStreakVisualIndicator('ACTIVE', 1);
    const high = getStreakVisualIndicator('ACTIVE', 20);
    expect(high.intensity).toBeGreaterThanOrEqual(low.intensity);
  });
});

