import * as Sentry from "@sentry/react-native";
import { useMemo } from "react";

import type { SessionSummary } from "../../../session/types";
import type { Theme } from "../../../theme";
import {
  getGradeDisplay,
  getPurityDisplay,
} from "../../../screens/session/utils/session-complete-display";
import {
  buildPostSessionNextAction,
  buildSessionCompletionHero,
  buildSessionCompletionReturnPlan,
} from "../service";

interface ProgressionData {
  level: number;
  xp: number;
  nextLevelThreshold: number;
  progressPercent: number;
}

interface DerivedDataInput {
  coachPresenceSessionReflection: string;
  focusPurityScore: number;
  summary: SessionSummary;
  studyProgress: unknown;
  theme: Theme;
  progressionData: ProgressionData | undefined;
  progressionError: Error | null;
}

export function useSessionCompleteDerivedData(input: DerivedDataInput) {
  const {
    coachPresenceSessionReflection,
    focusPurityScore,
    summary,
    studyProgress,
    theme,
    progressionData,
    progressionError,
  } = input;

  const hero = useMemo(
    () =>
      buildSessionCompletionHero({
        focusedDurationLabel: coachPresenceSessionReflection,
        interruptions: summary.interruptions,
        streakIncreased: summary.streakIncreased ?? false,
      }),
    [
      coachPresenceSessionReflection,
      summary.interruptions,
      summary.streakIncreased,
    ],
  );

  const returnPlan = useMemo(
    () =>
      buildSessionCompletionReturnPlan({
        completionPercentage: summary.completionPercentage,
        hasStudyFollowUp: Boolean(studyProgress),
        streakDays: summary.streakDays ?? 0,
        streakIncreased: summary.streakIncreased ?? false,
      }),
    [
      studyProgress,
      summary.completionPercentage,
      summary.streakDays,
      summary.streakIncreased,
    ],
  );

  const nextAction = useMemo(() => {
    try {
      return buildPostSessionNextAction({ summary });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: "session-completion", operation: "next-action" },
      });
      return null;
    }
  }, [summary]);

  const grade = getGradeDisplay(summary.finalScore ?? 0, theme);
  const purity = getPurityDisplay(focusPurityScore, theme);

  const levelMetric =
    !progressionError && progressionData
      ? {
          accent: theme.colors.primary[500],
          id: "level",
          label: "Level XP",
          progress: progressionData.progressPercent / 100,
          reward: `+${summary.xpEarned ?? 0} XP`,
          value: `Level ${progressionData.level} ${progressionData.xp}/${progressionData.nextLevelThreshold} XP`,
        }
      : null;

  return { grade, hero, levelMetric, nextAction, purity, returnPlan };
}
