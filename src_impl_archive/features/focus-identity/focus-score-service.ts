import {
  fetchCurrentFocusScore,
  fetchFocusScoreHistory,
} from './repository-focus-score';
import type { FocusScoreHistoryPoint, FocusScoreRecord } from './types';

export async function getCurrentFocusScore(
  userId: string,
): Promise<FocusScoreRecord | null> {
  return fetchCurrentFocusScore(userId);
}

export async function getFocusScoreHistory(
  userId: string,
  days: number,
): Promise<FocusScoreHistoryPoint[]> {
  return fetchFocusScoreHistory(userId, days);
}
