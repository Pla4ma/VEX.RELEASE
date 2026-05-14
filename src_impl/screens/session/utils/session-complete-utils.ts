import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * Session Complete Utils
 * Helper functions for the session complete screen
 */

import { getSessionService } from '../../../session/SessionService';
import type { SessionHistoryEntry } from '../../../session/types';

export const MOODS = [
  { key: 'GREAT', emoji: '🤩', label: 'Great' },
  { key: 'GOOD', emoji: '😊', label: 'Good' },
  { key: 'NEUTRAL', emoji: '😐', label: 'Okay' },
  { key: 'BAD', emoji: '😕', label: 'Bad' },
  { key: 'TERRIBLE', emoji: '😫', label: 'Terrible' },
] as const;

export type Mood = typeof MOODS[number]['key'];

export function isSameLocalDay(first: number, second: number): boolean {
  const a = new Date(first);
  const b = new Date(second);

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function resolveIsFirstSessionToday(
  userId: string,
  sessionId: string,
  summaryTimestamp: number
): Promise<boolean> {
  try {
    const sessionService = getSessionService();
    sessionService.setUserId(userId);

    const history = await sessionService.getSessionHistory(50);
    const priorSessionsToday = history.filter((entry: SessionHistoryEntry) => {
      if (entry.sessionId === sessionId) {
        return false;
      }

      const referenceTime = entry.endedAt ?? entry.startedAt ?? entry.createdAt;
      return isSameLocalDay(referenceTime, summaryTimestamp);
    });

    return priorSessionsToday.length === 0;
  } catch (error) { captureSilentFailure(error, { feature: 'screens', operation: 'ui-fallback', type: 'ui' });
    return false;
  }
}

export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

export function getGrade(score: number): { letter: string; color: string; label: string } {
  if (score >= 900) {return { letter: 'S', color: '#FFD700', label: 'Legendary!' };}
  if (score >= 800) {return { letter: 'A', color: '#4CAF50', label: 'Excellent!' };}
  if (score >= 700) {return { letter: 'B', color: '#8BC34A', label: 'Great Job!' };}
  if (score >= 600) {return { letter: 'C', color: '#FFC107', label: 'Good Effort!' };}
  if (score >= 500) {return { letter: 'D', color: '#FF9800', label: 'Keep Going!' };}
  return { letter: 'F', color: '#F44336', label: 'Try Again!' };
}
