import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * Session Complete Utils
 * Helper functions for the session complete screen
 */

import { getSessionOrchestrator } from '../../../session/SessionOrchestrator';
import type { SessionHistoryEntry } from '../../../session/types';
import { lightColors } from '@/theme/tokens/colors';

export const MOODS = [
  { key: 'GREAT', emoji: 'A', label: 'Great' },
  { key: 'GOOD', emoji: 'B', label: 'Good' },
  { key: 'NEUTRAL', emoji: 'C', label: 'Okay' },
  { key: 'BAD', emoji: 'D', label: 'Bad' },
  { key: 'TERRIBLE', emoji: 'F', label: 'Terrible' },
] as const;

export type Mood = (typeof MOODS)[number]['key'];

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
  summaryTimestamp: number,
): Promise<boolean> {
  try {
    const orchestrator = getSessionOrchestrator();
    orchestrator.setUserId(userId);

    const history = await orchestrator.getSessionHistory(50);
    const priorSessionsToday = history.filter((entry: SessionHistoryEntry) => {
      if (entry.sessionId === sessionId) {
        return false;
      }

      const referenceTime = entry.endedAt ?? entry.startedAt ?? entry.createdAt;
      return isSameLocalDay(referenceTime, summaryTimestamp);
    });

    return priorSessionsToday.length === 0;
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'screens',
      operation: 'ui-fallback',
      type: 'ui',
    });
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

export function getGrade(score: number): {
  letter: string;
  color: string;
  label: string;
} {
  if (score >= 900) {
    return { letter: 'S', color: lightColors.semantic.vexGold, label: 'Legendary!' };
  }
  if (score >= 800) {
    return { letter: 'A', color: lightColors.semantic.success, label: 'Excellent!' };
  }
  if (score >= 700) {
    return { letter: 'B', color: lightColors.semantic.success, label: 'Great Job!' };
  }
  if (score >= 600) {
    return {
      letter: 'C',
      color: lightColors.semantic.warning,
      label: 'Good Effort!',
    };
  }
  if (score >= 500) {
    return {
      letter: 'D',
      color: lightColors.semantic.warning,
      label: 'Keep Going!',
    };
  }
  return { letter: 'F', color: lightColors.semantic.danger, label: 'Try Again!' };
}
