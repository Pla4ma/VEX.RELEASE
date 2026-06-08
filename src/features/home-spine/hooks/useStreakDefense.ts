/**
 * useStreakDefense Hook
 *
 * Returns streak defense state and actions for the home screen.
 * Handles freeze eligibility, grace uses remaining, and next qualifying window.
 *
 * @phase 2.7
 */

import { useMemo } from 'react';
import { useStreakSummary } from '../../../features/streaks/hooks';
import {
  buildStreakDefenseState,
  type StreakDefenseState,
} from '../../../shared/streak/streak-defense';

export { type StreakDefenseState } from '../../../shared/streak/streak-defense';

export function useStreakDefense(
  userId: string | null,
): StreakDefenseState {
  const {
    data: streakSummary,
    isLoading,
    error,
  } = useStreakSummary(userId ?? '');

  return useMemo(
    () => buildStreakDefenseState(streakSummary, userId, isLoading, error),
    [streakSummary, userId, isLoading, error],
  );
}
