import {
  fetchCurrentFocusScore,
  fetchFocusScoreHistory,
} from './repository-focus-score';
import * as Sentry from '@sentry/react-native';
import type { FocusScoreHistoryPoint, FocusScoreRecord } from './types';

export async function getCurrentFocusScore(
  userId: string,
): Promise<FocusScoreRecord | null> {
  try {
    return await fetchCurrentFocusScore(userId);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'focus-identity', operation: 'getCurrentFocusScore' },
    });
    return null;
  }
}

export async function getFocusScoreHistory(
  userId: string,
  days: number,
): Promise<FocusScoreHistoryPoint[]> {
  return fetchFocusScoreHistory(userId, days);
}
