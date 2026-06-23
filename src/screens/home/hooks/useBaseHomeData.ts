import { useMemo } from 'react';
import type { HomeController } from './home-controller-types';
import type {
  ChallengeItem,
  SessionListItem,
} from '../../../features/home-spine/components';
import {
  getQualityGrade,
  getHomeCompanionMood,
} from '../../../screens/home/utils';
import { useInvisibleAgentDecision } from '../../../features/invisible-agent';

export function useBaseHomeData(controller: HomeController) {
  const streakData = controller.streakQuery.data as
    | { nextDeadline?: number }
    | undefined;
  const streakHoursRemaining = useMemo(() => {
    if (!streakData?.nextDeadline) {return null;}
    return Math.max(
      0,
      Math.floor((streakData.nextDeadline - Date.now()) / (1000 * 60 * 60)),
    );
  }, [streakData?.nextDeadline]);

  const hasActiveSession = useMemo(() => {
    const latest = controller.historyQuery.history[0] as
      | { status?: string }
      | undefined;
    if (!latest) {return false;}
    return latest.status === 'ACTIVE' || latest.status === 'PAUSED';
  }, [controller.historyQuery.history]);

  const resumeTimeSeconds = useMemo(() => {
    if (!hasActiveSession) {return null;}
    const latest = controller.historyQuery.history[0] as
      | { endedAt?: number; startedAt?: number }
      | undefined;
    if (!latest) {return null;}
    if (latest.endedAt && latest.startedAt) {
      return Math.floor((latest.endedAt - latest.startedAt) / 1000);
    }
    return null;
  }, [hasActiveSession, controller.historyQuery.history]);

  const recentSessions: SessionListItem[] = useMemo(() => {
    return (
      controller.historyQuery.history as Array<{
        sessionId: string;
        endedAt?: number;
        startedAt?: number;
        summary?: {
          focusPurityScore?: number;
          focusQuality?: number;
          xpEarned?: number;
          interruptions?: number;
        };
      }>
    )
      .flatMap((entry) => {
        if (!entry.endedAt || !entry.startedAt) {return [];}
        const durationSeconds = Math.max(
          0,
          Math.floor((entry.endedAt - entry.startedAt) / 1000),
        );
        const summary = entry.summary;
        return [
          {
            id: entry.sessionId,
            duration: durationSeconds,
            qualityGrade: getQualityGrade(
              summary?.focusPurityScore ?? summary?.focusQuality ?? 0,
            ),
            xpEarned: summary?.xpEarned ?? 0,
            endedAt: new Date(entry.endedAt).toISOString(),
            interruptions: summary?.interruptions ?? 0,
          },
        ];
      })
      .slice(0, 5);
  }, [controller.historyQuery.history]);

  const companionMood = useMemo(
    () =>
      getHomeCompanionMood(
        controller.historyQuery.history,
        controller.currentStreak,
      ),
    [controller.currentStreak, controller.historyQuery.history],
  );

  const comebackData = controller.comebackQuery.data as
    | { streakRestoreEligible?: boolean }
    | undefined;
  const comebackSessionsCompleted = useMemo(() => {
    if (!comebackData?.streakRestoreEligible) {return 0;}
    return (
      controller.historyQuery.history as Array<{ status: string }>
    ).filter((entry) => entry.status === 'COMPLETED').length;
  }, [comebackData?.streakRestoreEligible, controller.historyQuery.history]);
  const completedSessions = controller.disclosure.inputs.totalCompletedSessions;
  const activeStudyPlan = controller.activeStudyPlanQuery.data as
    | { id?: string; studyPackId?: string }
    | null
    | undefined;
  const invisibleAgentQuery = useInvisibleAgentDecision(
    {
      userId: controller.userId,
      isOnline: controller.isOnline,
      completedToday: controller.todayFocusMinutes > 0,
      currentStreak: controller.currentStreak,
      hoursUntilStreakDeadline: streakHoursRemaining,
      recentSessionIds: recentSessions.map((session) => session.id),
      activeStudyPackId: activeStudyPlan?.studyPackId ?? activeStudyPlan?.id ?? null,
      lowEnergyPattern: completedSessions > 0 && controller.todayFocusMinutes < 10,
      trustLevel: completedSessions < 2 ? 'low' : 'normal',
    },
    Boolean(controller.userId),
  );

  return {
    streakHoursRemaining,
    hasActiveSession,
    resumeTimeSeconds,
    recentSessions,
    companionMood,
    comebackSessionsCompleted,
    invisibleAgentQuery,
  };
}
