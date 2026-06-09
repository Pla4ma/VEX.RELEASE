import { useCallback, useEffect, useRef, useState } from 'react';
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
  totalCompletedSessions: number;
  userId?: string;
}

const MIN_SESSIONS_FOR_FUNERAL = 5;
const FUNERAL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const _STREAK_FUNERAL_LAST_SHOWN_KEY = 'streak_funeral_last_shown';
const STREAK_MINIMUM_FOR_FUNERAL = 3;

/** Safely cast a value that has already been verified as a non-null object. */
type ObjectRecord = Record<string, unknown>;
function asObjectRecord(value: unknown): ObjectRecord {
  return value as ObjectRecord;
}

function isStreakFuneralEvent(value: unknown): value is StreakFuneralEvent {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const event = asObjectRecord(value);
  return (
    typeof event.userId === 'string' &&
    typeof event.previousStreak === 'number' &&
    typeof event.diedAt === 'number'
  );
}

function getLastFuneralShown(): number | null {
  return null;
}

function setLastFuneralShown(): void {}

export function useStreakFuneralNavigation({
  hasCompletedOnboarding,
  isAuthenticated,
  isNavigationReady,
  isReady,
  navigationRef,
  totalCompletedSessions,
  userId,
}: UseStreakFuneralNavigationInput): void {
  const [showStreakFuneral, setShowStreakFuneral] = useState(false);
  const [streakFuneralData, setStreakFuneralData] =
    useState<StreakFuneralData | null>(null);
  const hasShownRef = useRef(false);

  const shouldShowFuneral = useCallback((): boolean => {
    if (!userId) {return false;}
    if (totalCompletedSessions < MIN_SESSIONS_FOR_FUNERAL) {return false;}

    const lastShown = getLastFuneralShown();
    if (lastShown && Date.now() - lastShown < FUNERAL_COOLDOWN_MS) {return false;}

    const streakService = getStreakService(userId);
    const state = streakService.getState();

    if (!state.lastStreakDiedAt || state.streakFuneralShown) {return false;}

    const hoursSinceDeath =
      (Date.now() - state.lastStreakDiedAt) / (1000 * 60 * 60);
    if (hoursSinceDeath >= 48) {return false;}

    const previousStreak =
      state.currentStreak === 1
        ? state.longestStreak > 1
          ? state.longestStreak
          : 0
        : 0;

    return previousStreak >= STREAK_MINIMUM_FOR_FUNERAL;
  }, [userId, totalCompletedSessions]);

  const checkStreakFuneral = useCallback(() => {
    if (!userId || hasShownRef.current) {return;}
    if (!shouldShowFuneral()) {return;}

    const streakService = getStreakService(userId);
    const state = streakService.getState();
    if (!state.lastStreakDiedAt) {return;}

    const previousStreak =
      state.currentStreak === 1
        ? state.longestStreak > 1
          ? state.longestStreak
          : 0
        : 0;

    hasShownRef.current = true;
    setStreakFuneralData({
      previousStreak,
      diedAt: state.lastStreakDiedAt,
    });
    setShowStreakFuneral(true);
  }, [userId, shouldShowFuneral]);

  useEffect(() => {
    if (isAuthenticated && isReady && hasCompletedOnboarding) {
      checkStreakFuneral();
    }
  }, [checkStreakFuneral, hasCompletedOnboarding, isAuthenticated, isReady]);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('streak:funeral_ready', (data) => {
      if (!isStreakFuneralEvent(data) || data.userId !== userId) {return;}
      if (data.previousStreak < STREAK_MINIMUM_FOR_FUNERAL) {return;}
      if (totalCompletedSessions < MIN_SESSIONS_FOR_FUNERAL) {return;}

      const lastShown = getLastFuneralShown();
      if (lastShown && Date.now() - lastShown < FUNERAL_COOLDOWN_MS) {return;}

      setStreakFuneralData({
        previousStreak: data.previousStreak,
        diedAt: data.diedAt,
      });
      setShowStreakFuneral(true);
    });

    return unsubscribe;
  }, [userId, totalCompletedSessions]);

  useEffect(() => {
    if (
      !showStreakFuneral ||
      !streakFuneralData ||
      !isAuthenticated ||
      !hasCompletedOnboarding
    ) {
      return;
    }

    if (!isNavigationReady || !navigationRef.isReady()) {
      return;
    }

    if (navigationRef.getCurrentRoute()?.name === 'StreakFuneral') {
      return;
    }

    setLastFuneralShown();
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
