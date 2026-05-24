/**
 * useStreakNarrative Hook Tests
 * Integration tests for the narrative hook
 */

import { renderHook } from '@testing-library/react-hooks';
import { useStreakNarrative } from '../useStreakNarrative';

describe('useStreakNarrative Hook', () => {
  it('should return narrative for active streak', () => {
    const { result } = renderHook(() =>
      useStreakNarrative({
        streakDays: 7,
        maxStreak: 7,
        totalSessions: 15,
        hoursSinceLastSession: 2,
        comebackTokens: 0,
        _hasInsurance: false,
      })
    );

    expect(result.current.narrative).toBeDefined();
    expect(result.current.narrative.currentBoss).toBeDefined();
    expect(result.current.narrative.currentChapter).toBeDefined();
  });

  it('should not show risk warning for fresh streak', () => {
    const { result } = renderHook(() =>
      useStreakNarrative({
        streakDays: 7,
        maxStreak: 7,
        totalSessions: 15,
        hoursSinceLastSession: 2,
        comebackTokens: 0,
        _hasInsurance: false,
      })
    );

    expect(result.current.riskWarning).toBeNull();
  });

  it('should show risk warning when streak at risk', () => {
    const { result } = renderHook(() =>
      useStreakNarrative({
        streakDays: 7,
        maxStreak: 7,
        totalSessions: 15,
        hoursSinceLastSession: 22,
        comebackTokens: 0,
        _hasInsurance: false,
      })
    );

    expect(result.current.riskWarning).not.toBeNull();
    expect(result.current.riskWarning?.show).toBe(true);
  });

  it('should not show risk warning for short streaks', () => {
    const { result } = renderHook(() =>
      useStreakNarrative({
        streakDays: 2,
        maxStreak: 2,
        totalSessions: 5,
        hoursSinceLastSession: 22,
        comebackTokens: 0,
        _hasInsurance: false,
      })
    );

    expect(result.current.riskWarning).toBeNull();
  });

  it('should show break recovery when streak is broken', () => {
    const { result } = renderHook(() =>
      useStreakNarrative({
        streakDays: 0,
        maxStreak: 7,
        totalSessions: 15,
        hoursSinceLastSession: 48,
        comebackTokens: 1,
        _hasInsurance: false,
      })
    );

    expect(result.current.breakRecovery).not.toBeNull();
    expect(result.current.breakRecovery?.comebackQuest).toContain('Token');
  });

  it('should not show break recovery when streak is active', () => {
    const { result } = renderHook(() =>
      useStreakNarrative({
        streakDays: 3,
        maxStreak: 7,
        totalSessions: 15,
        hoursSinceLastSession: 2,
        comebackTokens: 0,
        _hasInsurance: false,
      })
    );

    expect(result.current.breakRecovery).toBeNull();
  });

  it('should memoize narrative to prevent recalculation', () => {
    const { result, rerender } = renderHook(
      ({ streakDays }) =>
        useStreakNarrative({
          streakDays,
          maxStreak: 7,
          totalSessions: 15,
          hoursSinceLastSession: 2,
          comebackTokens: 0,
          _hasInsurance: false,
        }),
      { initialProps: { streakDays: 7 } }
    );

    const firstNarrative = result.current.narrative;

    // Rerender with same props
    rerender({ streakDays: 7 });

    expect(result.current.narrative).toBe(firstNarrative);
  });

  it('should recalculate when streak changes', () => {
    const { result, rerender } = renderHook(
      ({ streakDays }) =>
        useStreakNarrative({
          streakDays,
          maxStreak: 7,
          totalSessions: 15,
          hoursSinceLastSession: 2,
          comebackTokens: 0,
          _hasInsurance: false,
        }),
      { initialProps: { streakDays: 7 } }
    );

    const firstNarrative = result.current.narrative;

    // Rerender with different streak
    rerender({ streakDays: 8 });

    expect(result.current.narrative).not.toBe(firstNarrative);
  });

  it('should handle edge case of zero sessions', () => {
    const { result } = renderHook(() =>
      useStreakNarrative({
        streakDays: 0,
        maxStreak: 0,
        totalSessions: 0,
        hoursSinceLastSession: 0,
        comebackTokens: 0,
        _hasInsurance: false,
      })
    );

    expect(result.current.narrative).toBeDefined();
    expect(result.current.narrative.currentChapter).toBe('The Beginning');
  });

  it('should handle extreme streak values', () => {
    const { result } = renderHook(() =>
      useStreakNarrative({
        streakDays: 365,
        maxStreak: 365,
        totalSessions: 500,
        hoursSinceLastSession: 2,
        comebackTokens: 0,
        _hasInsurance: false,
      })
    );

    expect(result.current.narrative).toBeDefined();
    expect(result.current.narrative.currentBoss).toBeDefined();
  });
});
