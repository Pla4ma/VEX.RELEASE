/**
 * useFirstWeekExperienceRuntime — canonical first-week state hook.
 *
 * Every system that needs first-week stage awareness should consume this.
 * Replaces independent first-week decisions in Home, Completion, Notifications, Premium.
 *
 * Inputs:
 * - completedSessions, daysSinceOnboarding, daysSinceLastSession
 * - motivationStyle, primaryGoal
 * - studyUsageRatio, bossEngagement
 * - premiumState, featureAvailability
 *
 * Outputs:
 * - stage, allowedHomeSurfaces, bossIntensity, premiumMoment
 * - primaryCTA, primaryMessage, secondaryCTA
 * - completionEmphasis, coachMessageType, spotlightSurface
 * - notificationAllowedTypes, studyLayerLabel, hiddenSurfaces
 */
import { useMemo } from "react";
import { resolveFirstWeekExperience } from "./first-week-service";
import {
  FirstWeekInputSchema,
  type FirstWeekExperience,
  type FirstWeekStage,
} from "./first-week-schemas";
import type { MotivationProfileType } from "../liveops-config/feature-access";

export interface FirstWeekRuntimeInput {
  completedSessions: number;
  daysSinceOnboarding: number;
  daysSinceLastSession: number | null;
  motivationStyle?: MotivationProfileType;
  primaryGoal?: string;
  bossEngagement: "none" | "low" | "medium" | "high";
  studyUsageRatio: number;
  isPremium: boolean;
  featureAvailable: {
    boss: boolean;
    premium: boolean;
    social: boolean;
    study: boolean;
  };
}

const VALID_STYLES = [
  "calm",
  "friendly",
  "coach_led",
  "study_focused",
  "game_like",
  "intense",
] as const;
const VALID_GOALS = [
  "focus",
  "study",
  "work",
  "creative",
  "personal",
  "personal_growth",
  "learning",
] as const;

export function computeFirstWeekRuntime(
  input: FirstWeekRuntimeInput,
): FirstWeekExperience {
  const style = (VALID_STYLES as readonly string[]).includes(
    input.motivationStyle ?? "",
  )
    ? (input.motivationStyle as
        | "calm"
        | "friendly"
        | "coach_led"
        | "study_focused"
        | "game_like"
        | "intense")
    : "friendly";

  const goal = (VALID_GOALS as readonly string[]).includes(
    input.primaryGoal ?? "",
  )
    ? (input.primaryGoal as
        | "focus"
        | "study"
        | "work"
        | "creative"
        | "personal"
        | "personal_growth"
        | "learning")
    : "focus";

  return resolveFirstWeekExperience(
    FirstWeekInputSchema.parse({
      behaviorStats: {
        bossEngagement: input.bossEngagement,
        studyUsageRatio: input.studyUsageRatio,
      },
      completedSessions: input.completedSessions,
      daysSinceLastSession: input.daysSinceLastSession,
      daysSinceOnboarding: input.daysSinceOnboarding,
      featureAvailability: {
        boss: input.featureAvailable.boss,
        premium: input.featureAvailable.premium,
        social: input.featureAvailable.social,
        study: input.featureAvailable.study,
      },
      motivationStyle: style,
      premiumState: input.isPremium
        ? "active"
        : input.featureAvailable.premium
          ? "configured"
          : "unavailable",
      primaryGoal: goal,
    }),
  );
}

export interface FirstWeekRuntimeOutput {
  experience: FirstWeekExperience;
  stage: FirstWeekStage;
  isDayZero: boolean;
  isComeback: boolean;
  canShowBoss: boolean;
  canTeasePremium: boolean;
  allowedNotificationTypes: string[];
  primaryCtaLabel: string;
}

export function useFirstWeekExperienceRuntime(
  input: FirstWeekRuntimeInput,
): FirstWeekRuntimeOutput {
  return useMemo(() => {
    const experience = computeFirstWeekRuntime(input);
    return {
      experience,
      stage: experience.currentDayStage,
      isDayZero: experience.currentDayStage === "DAY_0_NOT_STARTED",
      isComeback: experience.comebackState !== "none",
      canShowBoss:
        experience.bossIntensity !== "hidden" && input.featureAvailable.boss,
      canTeasePremium:
        experience.premiumMoment !== "none" &&
        experience.premiumMoment !== "hidden" &&
        input.featureAvailable.premium,
      allowedNotificationTypes: experience.notificationAllowedTypes,
      primaryCtaLabel: experience.primaryCTA.label,
    };
  }, [
    input.completedSessions,
    input.daysSinceOnboarding,
    input.daysSinceLastSession,
    input.motivationStyle,
    input.primaryGoal,
    input.bossEngagement,
    input.studyUsageRatio,
    input.isPremium,
    input.featureAvailable.boss,
    input.featureAvailable.premium,
    input.featureAvailable.social,
    input.featureAvailable.study,
  ]);
}
