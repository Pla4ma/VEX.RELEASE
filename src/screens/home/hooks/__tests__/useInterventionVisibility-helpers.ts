import { resolveInterventionVisibility } from "../useInterventionVisibility";
import type { HomeSurfaceMap } from "../../../../features/home-experience/surface-decision-schemas";
import type { FirstWeekExperience } from "../../../../features/personalization/first-week-schemas";
import type { ActiveIntervention } from "../../../../features/ai-coach/hooks";
import type { FeatureAccessMap } from "../../../../features/liveops-config/feature-access";

export const defaultSurfaceMap: HomeSurfaceMap = {
  start_session: "primary",
  coach_presence: "secondary",
  progress_proof: "hidden",
  focus_score: "hidden",
  progress_detail: "hidden",
  study_layer: "hidden",
  companion_thread: "hidden",
  boss_teaser: "hidden",
  boss_compact: "hidden",
  boss_full_cta: "hidden",
  challenge_teaser: "hidden",
  unlock_strip: "hidden",
  premium_tease: "hidden",
  weekly_quest: "hidden",
};

export function makeIntervention(
  overrides: Partial<ActiveIntervention> = {},
): ActiveIntervention {
  return {
    id: "int-1",
    type: "STREAK_RISK",
    message: "Your streak is at risk!",
    priority: 5,
    hoursRemaining: 1,
    actionLabel: "Start session",
    metadata: {},
    ...overrides,
  };
}

export function makeFeatures(
  overrides: Partial<Record<string, unknown>> = {},
): FeatureAccessMap {
  return {
    ai_coach_advanced: {
      isUnlocked: true,
      isVisible: true,
      isTeased: false,
      lockedDescription: "",
      unlockReason: "",
      isDegraded: false,
      releaseState: "final_release_progressive",
      priority: 5,
      threshold: 8,
      ...((overrides.ai_coach_advanced as Record<string, unknown>) ?? {}),
    } as unknown as FeatureAccessMap["ai_coach_advanced"],
    ai_coach_basic: {
      isUnlocked: true,
      isVisible: true,
      isTeased: false,
      lockedDescription: "",
      unlockReason: "",
      isDegraded: false,
      releaseState: "final_release_core",
      priority: 1,
      threshold: 0,
      ...((overrides.ai_coach_basic as Record<string, unknown>) ?? {}),
    } as unknown as FeatureAccessMap["ai_coach_basic"],
    challenges: {
      isUnlocked: true,
      isVisible: true,
      lockedDescription: "",
      unlockReason: "",
      releaseState: "final_release_progressive",
      ...((overrides.challenges as Record<string, unknown>) ?? {}),
    } as unknown as FeatureAccessMap["challenges"],
  } as unknown as FeatureAccessMap;
}

export function makeFWE(stage: string): FirstWeekExperience {
  return {
    currentDayStage: stage as FirstWeekExperience["currentDayStage"],
    allowedHomeSurfaces: ["start_session", "coach_presence_line"],
    hiddenSurfaces: ["shop", "inventory", "battle_pass"],
    bossIntensity: "hidden",
    coachMessageType: "encouraging",
    comebackState: "none",
    completionEmphasis: "progress",
    notificationAllowedTypes: ["streak_reminder"],
    premiumMoment: "none",
    primaryCTA: { intent: "START_SESSION", label: "Start a session" },
    primaryMessage: "Welcome back",
    secondaryCTA: { intent: "OPEN_PROGRESS", label: "View progress" },
    spotlightSurface: "progress_proof",
    studyLayerLabel: "Study OS",
    unlockTease: null,
  };
}

export { resolveInterventionVisibility };
