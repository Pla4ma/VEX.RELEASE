import { useMemo } from "react";
import {
  getBehaviorSignals,
} from "../../../features/personalization/behavior-signal-store";
import { resolveUserBehaviorSignals } from "../../../features/personalization/behavior-resolver";
import type {
  BehaviorSignal,
  BehaviorResolverInput,
} from "../../../features/personalization/behavior-signal-schemas";
import type { BehaviorStats } from "../../../features/personalization/schemas";
import type {
  LegacySessionData,
} from "./home-resolved-experience-types";
import {
  computeCompletedDurations,
  computeAbandonedDurations,
  computePreferredMode,
  computeBestTimeOfDay,
  computeStudyUsageRatio,
  computeCoachInteractions,
  computeComebackSessions,
} from "./home-experience-utils";

interface UseHomeBehaviorStatsInput {
  userId: string;
  totalCompletedSessions: number;
  completedSessions: LegacySessionData[];
  abandonedSessions: LegacySessionData[];
  sessionHistory: LegacySessionData[];
  currentStreak: number;
  controller: {
    currentStreak: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-object-type
    [key: string]: unknown;
  };
}

export function useHomeBehaviorStats(
  input: UseHomeBehaviorStatsInput,
): {
  behaviorStats: BehaviorStats;
  resolvedBehaviorSignals: ReturnType<typeof resolveUserBehaviorSignals>;
} {
  const {
    userId,
    totalCompletedSessions,
    completedSessions,
    abandonedSessions,
    sessionHistory,
    controller,
  } = input;

  const resolvedBehaviorSignals = useMemo(() => {
    const recentSignals: BehaviorSignal[] = getBehaviorSignals(userId, {
      maxAgeMs: 7 * 24 * 60 * 60 * 1000,
      maxSignals: 20,
    });
    const studySessionCount = completedSessions.filter(
      (s) =>
        s.mode === "STUDY" ||
        s.config?.sessionMode === "STUDY" ||
        Boolean(s.config?.studyPlanId),
    ).length;
    const deepWorkCount = completedSessions.filter(
      (s) => s.mode === "DEEP_WORK" || s.config?.sessionMode === "DEEP_WORK",
    ).length;
    const learningCount = 0;
    const creativeCount = completedSessions.filter(
      (s) => s.mode === "CREATIVE" || s.config?.sessionMode === "CREATIVE",
    ).length;

    const resolverInput: BehaviorResolverInput = {
      recentSignals,
      recentSessions: {
        completedSessions: completedSessions.length,
        studySessions: studySessionCount,
        deepWorkSessions: deepWorkCount,
        learningSessions: learningCount,
        creativeSessions: creativeCount,
        totalSessions: sessionHistory.length,
        preferredMode: computePreferredMode(completedSessions),
        bestTimeOfDay: computeBestTimeOfDay(completedSessions),
      },
      firstWeekExperience: {
        stage:
          totalCompletedSessions === 0 ? "DAY_0_NOT_STARTED" : "POST_DAY_7",
        isDayZero: totalCompletedSessions === 0,
      },
    };
    return resolveUserBehaviorSignals(resolverInput);
  }, [userId, completedSessions, sessionHistory, totalCompletedSessions]);

  const behaviorStats: BehaviorStats = {
    totalCompletedSessions,
    abandonedSessionDurations: computeAbandonedDurations(abandonedSessions),
    bossChallengeEngagement: resolvedBehaviorSignals.bossEngagement as
      | "none"
      | "low"
      | "medium"
      | "high",
    coachInteractions: Math.max(
      computeCoachInteractions(controller),
      resolvedBehaviorSignals.coachInteractions,
    ),
    comebackSessions: computeComebackSessions(controller),
    completedSessionDurations: computeCompletedDurations(completedSessions),
    completionStreak: controller.currentStreak as number,
    ignoredFeatures: resolvedBehaviorSignals.ignoredFeatures,
    mostSuccessfulTimeOfDay:
      resolvedBehaviorSignals.mostSuccessfulTimeOfDay ??
      computeBestTimeOfDay(completedSessions),
    preferredSessionMode:
      (resolvedBehaviorSignals.preferredSessionMode as
        | BehaviorStats["preferredSessionMode"]
        | null) ?? computePreferredMode(completedSessions),
    premiumFeatureAttempts: resolvedBehaviorSignals.premiumFeatureAttempts,
    studyUsageRatio:
      resolvedBehaviorSignals.studyUsageRatio > 0
        ? resolvedBehaviorSignals.studyUsageRatio
        : computeStudyUsageRatio(completedSessions, totalCompletedSessions),
  };

  return { behaviorStats, resolvedBehaviorSignals };
}
