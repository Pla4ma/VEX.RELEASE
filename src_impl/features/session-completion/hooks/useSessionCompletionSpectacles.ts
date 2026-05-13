import { useEffect } from 'react';

const spectacleService = { triggerSpectacle: (_: string, __: Record<string, unknown>) => {} }; const SpectacleType = { STREAK_MILESTONE: 'STREAK_MILESTONE', PERFECT_SESSION: 'PERFECT_SESSION' } as const;
import type { SessionSummary } from '../../../session/types';

export function useSessionCompletionSpectacles(input: {
  focusPurityScore: number;
  sessionId: string;
  summary: SessionSummary;
  userId: string;
}): void {
  const { focusPurityScore, sessionId, summary, userId } = input;

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (summary.streakIncreased && summary.streakDays) {
      const milestones: number[] = [7, 14, 30, 60, 100];
      if (milestones.includes(summary.streakDays)) {
        spectacleService.triggerSpectacle(SpectacleType.STREAK_MILESTONE, {
          userId,
          streakDays: summary.streakDays,
          timestamp: Date.now(),
          milestone: summary.streakDays as 7 | 14 | 30 | 60 | 100,
        });
      }
    }

    if (summary.finalScore && summary.finalScore >= 95 && focusPurityScore >= 95) {
      spectacleService.triggerSpectacle(SpectacleType.PERFECT_SESSION, {
        userId,
        sessionId,
        timestamp: Date.now(),
        duration: summary.actualDuration || 0,
        purity: focusPurityScore,
      });
    }
  }, [focusPurityScore, sessionId, summary, userId]);
}
