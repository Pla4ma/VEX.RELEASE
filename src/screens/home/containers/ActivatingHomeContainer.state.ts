import type { UseQueryResult } from '@tanstack/react-query';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { SessionHistoryResult } from '../hooks/home-controller-types';
import { getFocusedMinutesForToday } from '../hooks/home-controller-helpers';
import type { StreakQueryData, ProgressionQueryData } from './ActivatingHomeContainer.types';

interface ActivatingDerivedState {
  streakData: StreakQueryData | undefined;
  progData: ProgressionQueryData | undefined;
  currentStreak: number;
  currentXp: number;
  todayFocusMinutes: number;
  progressPercent: number;
  isFirstRun: boolean;
}

export function computeActivatingState(
  disclosure: FeatureAccessResult,
  streakQuery: UseQueryResult,
  progressionQuery: UseQueryResult,
  historyQuery: SessionHistoryResult,
): ActivatingDerivedState {
  const streakData = streakQuery.data as StreakQueryData | undefined;
  const progData = progressionQuery.data as ProgressionQueryData | undefined;
  const currentStreak = streakData?.currentDays ?? 0;
  const currentXp = progData?.xp ?? 0;
  const todayFocusMinutes = historyQuery.history.reduce(
    (sum: number, e) => sum + getFocusedMinutesForToday(e),
    0,
  );
  const progressPercent = Math.min(
    100,
    Math.round((todayFocusMinutes / 120) * 100),
  );
  const isFirstRun =
    !disclosure.isPending &&
    disclosure.inputs.totalCompletedSessions === 0 &&
    currentStreak === 0 &&
    currentXp === 0;
  return {
    streakData,
    progData,
    currentStreak,
    currentXp,
    todayFocusMinutes,
    progressPercent,
    isFirstRun,
  };
}
