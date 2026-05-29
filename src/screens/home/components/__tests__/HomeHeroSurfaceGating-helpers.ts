import { decideHomeSurfaces } from "../../../../features/home-experience/home-surface-decision";
import type { HomeSurfaceMap } from "../../../../features/home-experience/surface-decision-schemas";
import type { FirstWeekExperience } from "../../../../features/personalization/first-week-schemas";

export const featureAvailability = {
  boss: true,
  challenges: true,
  premium: true,
  study: true,
};

export const calmProfile = {
  motivationStyle: "calm" as const,
  primaryGoal: "personal" as const,
  gamificationIntensity: "minimal" as const,
  studyLayerName: "Growth Path",
  userStage: "new" as const,
};

export const gameLikeProfile = {
  motivationStyle: "game_like" as const,
  primaryGoal: "work" as const,
  gamificationIntensity: "strong" as const,
  studyLayerName: "Deep Work Plan",
  userStage: "new" as const,
};

export const studyProfile = {
  motivationStyle: "study_focused" as const,
  primaryGoal: "study" as const,
  gamificationIntensity: "medium" as const,
  studyLayerName: "Study OS",
  userStage: "new" as const,
};

export interface BaseStatsShape {
  totalCompletedSessions: number;
  studyUsageRatio: number;
  bossChallengeEngagement: "none" | "low" | "medium" | "high";
  coachInteractions: number;
  comebackSessions: number;
  ignoredFeatures: string[];
  premiumFeatureAttempts: string[];
  completionStreak: number;
}

export function baseStats(
  overrides: Partial<BaseStatsShape> = {},
): BaseStatsShape {
  return {
    totalCompletedSessions: 0,
    studyUsageRatio: 0,
    bossChallengeEngagement: "none" as const,
    coachInteractions: 0,
    comebackSessions: 0,
    ignoredFeatures: [] as string[],
    premiumFeatureAttempts: [] as string[],
    completionStreak: 0,
    ...overrides,
  };
}

export function calmFirstWeek(): any {
  return {
    allowedHomeSurfaces: [
      "motivation_confirmation",
      "coach_presence_line",
      "start_session",
    ],
    bossIntensity: "hidden",
    coachMessageType: "day_0_not_started",
    comebackState: "none",
    completionEmphasis: "confirmation_coach_progress_next_action",
    currentDayStage: "DAY_0_NOT_STARTED",
    hiddenSurfaces: [
      "boss_full",
      "shop",
      "inventory",
      "battle_pass",
      "wagers",
      "rivals",
      "squads",
      "leaderboards",
      "premium_currency",
      "premium_hard_sell",
      "advanced_economy",
    ],
    notificationAllowedTypes: [
      "gentle_return",
      "coach_check_in",
      "progress_milestone",
    ],
    premiumMoment: "none",
    primaryCTA: { intent: "START_SESSION", label: "Start first session" },
    primaryMessage: "VEX is shaped around one clean first block.",
    secondaryCTA: null,
    spotlightSurface: "none",
    studyLayerLabel: "Growth Path",
    unlockTease: "VEX opens one layer at a time after real sessions.",
  };
}

export function bossAvailableFirstWeek(): FirstWeekExperience {
  return {
    ...calmFirstWeek(),
    bossIntensity: "visible",
    allowedHomeSurfaces: [
      "coach_presence_line",
      "start_session",
      "progress_proof",
      "tiny_boss_teaser",
    ],
    currentDayStage: "DAY_5_PATH_FORMING",
    spotlightSurface: "tiny_boss_teaser",
    primaryCTA: { intent: "START_SESSION", label: "Start next session" },
    primaryMessage: "Your rhythm is forming.",
    premiumMoment: "soft_tease",
  };
}

export { decideHomeSurfaces };
export type { HomeSurfaceMap };
