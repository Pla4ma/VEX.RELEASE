import { useMemo } from "react";
import type { HomeSurfaceMap } from "../../../features/home-experience/surface-decision-schemas";
import type { FirstWeekExperience } from "../../../features/personalization/first-week-schemas";
import type { ActiveIntervention } from "../../../features/ai-coach/hooks";
import type { FeatureAccessMap } from "../../../features/liveops-config/feature-access";
import { getFeatureAvailability } from "../../../features/liveops-config";

interface InterventionVisibilityInput {
  intervention: ActiveIntervention | null;
  interventionLoading: boolean;
  surfaceMap: HomeSurfaceMap;
  firstWeekExperience?: FirstWeekExperience;
  features: FeatureAccessMap;
  totalCompletedSessions: number;
}

interface InterventionVisibilityResult {
  canShowBanner: boolean;
  interventionType: "intrusive" | "soft" | "hidden";
  reason: string;
}

export function resolveInterventionVisibility(
  input: InterventionVisibilityInput,
): InterventionVisibilityResult {
  const {
    intervention,
    interventionLoading,
    surfaceMap,
    firstWeekExperience,
    features,
    totalCompletedSessions,
  } = input;

  if (interventionLoading || !intervention) {
    return {
      canShowBanner: false,
      interventionType: "hidden",
      reason: "No active intervention",
    };
  }

  if (totalCompletedSessions === 0) {
    return {
      canShowBanner: false,
      interventionType: "hidden",
      reason: "Day 0 — no intervention before first session",
    };
  }

  const coachDecision = surfaceMap.coach_presence;
  if (coachDecision === "hidden" || coachDecision === "blocked") {
    return {
      canShowBanner: false,
      interventionType: "hidden",
      reason: "Coach surface hidden or blocked",
    };
  }

  const coachAvail = getFeatureAvailability(features.ai_coach_advanced);
  if (coachAvail.state === "degraded" || coachAvail.state === "disabled") {
    return {
      canShowBanner: false,
      interventionType: "hidden",
      reason: "Coach feature unavailable or degraded",
    };
  }

  if (firstWeekExperience) {
    const stage = firstWeekExperience.currentDayStage;
    if (
      stage === "DAY_0_NOT_STARTED" ||
      stage === "DAY_0_FIRST_SESSION_STARTED"
    ) {
      return {
        canShowBanner: false,
        interventionType: "hidden",
        reason: "Day 0 — no intervention",
      };
    }

    if (stage === "DAY_1_RETURN") {
      if (intervention.priority < 5) {
        return {
          canShowBanner: false,
          interventionType: "hidden",
          reason: "Day 1 — prefer progress message over intervention",
        };
      }
      return {
        canShowBanner: true,
        interventionType: "soft",
        reason: "Day 1 — high priority intervention allowed",
      };
    }

    const hiddenSurfaces = firstWeekExperience.hiddenSurfaces ?? [];
    if (
      hiddenSurfaces.includes("squads") &&
      intervention.type === "BOSS_FINISH"
    ) {
      return {
        canShowBanner: false,
        interventionType: "hidden",
        reason: "Boss intervention hidden in first week",
      };
    }
  }

  if (coachDecision === "tiny_tease") {
    if (intervention.priority < 3) {
      return {
        canShowBanner: false,
        interventionType: "hidden",
        reason: "Coach tiny_tease — low priority intervention suppressed",
      };
    }
    return {
      canShowBanner: true,
      interventionType: "soft",
      reason: "Coach tiny_tease — high priority intervention shown softly",
    };
  }

  return {
    canShowBanner: true,
    interventionType: intervention.priority >= 3 ? "intrusive" : "soft",
    reason: "Coach surface allows intervention",
  };
}

export function useInterventionVisibility(
  input: InterventionVisibilityInput,
): InterventionVisibilityResult {
  return useMemo(
    () => resolveInterventionVisibility(input),
    [
      input.intervention,
      input.interventionLoading,
      input.surfaceMap,
      input.firstWeekExperience,
      input.features,
      input.totalCompletedSessions,
    ],
  );
}
