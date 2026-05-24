import { useMemo } from 'react';
import { FIRST_WEEK_DAY_DESIGN, type DayDesign } from './day-by-day-config';
import type { FirstWeekProgress } from './schemas';

export function useCurrentDayDesign(
  progress: FirstWeekProgress | null | undefined,
): DayDesign | null {
  return useMemo(() => {
    if (!progress) return null;
    const sessionsCompleted = progress.sessionsCompleted;
    if (sessionsCompleted >= FIRST_WEEK_DAY_DESIGN.length) return null;
    return FIRST_WEEK_DAY_DESIGN[sessionsCompleted] ?? null;
  }, [progress]);
}

export function useDayDesign(dayIndex: number): DayDesign | null {
  return useMemo(() => FIRST_WEEK_DAY_DESIGN[dayIndex] ?? null, [dayIndex]);
}

export function useShouldShowDeeperMode(
  progress: FirstWeekProgress | null | undefined,
): boolean {
  return useMemo(() => {
    if (!progress) return false;
    return progress.sessionsCompleted >= 7 && !progress.weeklyMilestoneEarned;
  }, [progress]);
}
