import { useCallback, useEffect, useState } from 'react';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import { eventBus } from '../../events';
import { getStreakService } from '../../streaks/StreakService';

import type { ExtendedRootStackParams } from '../types';

interface StreakFuneralData {
  previousStreak: number;
  diedAt: number;
}

interface StreakFuneralEvent extends StreakFuneralData {
  userId: string;
}

interface UseStreakFuneralNavigationInput {
  hasCompletedOnboarding: boolean;
  isAuthenticated: boolean;
  isNavigationReady: boolean;
  isReady: boolean;
  navigationRef: NavigationContainerRefWithCurrent<ExtendedRootStackParams>;
  userId?: string;
}

function isStreakFuneralEvent(value: unknown): value is StreakFuneralEvent {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const event = value as Record<string, unknown>;
  return (
    typeof event.userId === 'string' &&
    typeof event.previousStreak === 'number' &&
    typeof event.diedAt === 'number'
  );
}

export function useStreakFuneralNavigation({
  hasCompletedOnboarding,
  isAuthenticated,
  isNavigationReady,
  isReady,
  navigationRef,
  userId,
}: UseStreakFuneralNavigationInput): void {
  const [showStreakFuneral, setShowStreakFuneral] = useState(false);
  const [streakFuneralData, setStreakFuneralData] = useState<StreakFuneralData | null>(null);

  const checkStreakFuneral = useCallback(() => {
    if (!userId) {
      return;
    }

    const streakService = getStreakService(userId);
    const state = streakService.getState();

    if (!state.lastStreakDiedAt || state.streakFuneralShown) {
      return;
    }

    const hoursSinceDeath = (Date.now() - state.lastStreakDiedAt) / (1000 * 60 * 60);

    if (hoursSinceDeath >= 48) {
      return;
    }

    setStreakFuneralData({
      previousStreak: state.currentStreak === 1 ? (state.longestStreak > 1 ? state.longestStreak : 0) : 0,
      diedAt: state.lastStreakDiedAt,
    });
    setShowStreakFuneral(true);
  }, [userId]);

  useEffect(() => {
    if (isAuthenticated && isReady && hasCompletedOnboarding) {
      checkStreakFuneral();
    }
  }, [checkStreakFuneral, hasCompletedOnboarding, isAuthenticated, isReady]);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('streak:funeral_ready', (data) => {
      if (!isStreakFuneralEvent(data) || data.userId !== userId) {
        return;
      }

      setStreakFuneralData({
        previousStreak: data.previousStreak,
        diedAt: data.diedAt,
      });
      setShowStreakFuneral(true);
    });

    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    if (!showStreakFuneral || !streakFuneralData || !isAuthenticated || !hasCompletedOnboarding) {
      return;
    }

    if (!isNavigationReady || !navigationRef.isReady()) {
      return;
    }

    if (navigationRef.getCurrentRoute()?.name === 'StreakFuneral') {
      return;
    }

    navigationRef.navigate('StreakFuneral', streakFuneralData);
    setShowStreakFuneral(false);
    setStreakFuneralData(null);
  }, [
    hasCompletedOnboarding,
    isAuthenticated,
    isNavigationReady,
    navigationRef,
    showStreakFuneral,
    streakFuneralData,
  ]);
}
