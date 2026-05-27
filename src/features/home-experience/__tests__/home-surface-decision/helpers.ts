import {
  decideHomeSurfaces,
  getPrimarySurface,
  getSpotlightSurface,
} from "../../home-surface-decision";
import type { HomeSurfaceMap } from "../../surface-decision-schemas";

export { decideHomeSurfaces, getPrimarySurface, getSpotlightSurface };

export const featureAvailability = {
  boss: true,
  challenges: true,
  premium: true,
  study: true,
};

export const studyProfile = {
  motivationStyle: "study_focused" as const,
  primaryGoal: "study" as const,
  gamificationIntensity: "medium" as const,
  studyLayerName: "Study OS",
  userStage: "new" as const,
};

export const workProfile = {
  motivationStyle: "coach_led" as const,
  primaryGoal: "work" as const,
  gamificationIntensity: "minimal" as const,
  studyLayerName: "Deep Work Plan",
  userStage: "new" as const,
};

export const gameLikeProfile = {
  motivationStyle: "game_like" as const,
  primaryGoal: "work" as const,
  gamificationIntensity: "strong" as const,
  studyLayerName: "Deep Work Plan",
  userStage: "new" as const,
};

export const calmProfile = {
  motivationStyle: "calm" as const,
  primaryGoal: "personal" as const,
  gamificationIntensity: "minimal" as const,
  studyLayerName: "Growth Path",
  userStage: "new" as const,
};

export function baseStats() {
  return {
    totalCompletedSessions: 0,
    studyUsageRatio: 0,
    bossChallengeEngagement: "none" as const,
    coachInteractions: 0,
    comebackSessions: 0,
    ignoredFeatures: [],
    premiumFeatureAttempts: [],
    completionStreak: 0,
  };
}

export function surfaceNames(map: HomeSurfaceMap): string[] {
  return Object.entries(map)
    .filter(([, v]) => v !== "hidden" && v !== "blocked")
    .map(([k, v]) => `${k}:${v}`);
}
