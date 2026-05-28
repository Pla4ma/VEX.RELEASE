import type {
  HomeContextSnapshot,
  HomePrimaryPriority,
  ProductContext,
} from "./priority-schemas";
import {
  getFeatureAvailability,
  isFeatureAvailableForNavigation,
} from "../liveops-config";
import type { FeatureAccessMap } from "../liveops-config";

export function checkChallengeNearDone(
  snapshot: HomeContextSnapshot,
  featureAccess?: FeatureAccessMap,
  productContext?: ProductContext,
): HomePrimaryPriority | null {
  if (!snapshot.challenge.isNearDone) return null;
  if (
    featureAccess &&
    !isFeatureAvailableForNavigation(
      getFeatureAvailability(featureAccess.challenges),
    )
  )
    return null;
  if (productContext?.surfaceMap) {
    const sm = productContext.surfaceMap;
    if (
      (sm.challenge_teaser === "hidden" || sm.challenge_teaser === "blocked") &&
      (sm.weekly_quest === "hidden" || sm.weekly_quest === "blocked")
    )
      return null;
  }
  return {
    cta: { action: "OPEN_CHALLENGES", text: "Start Target Session" },
    reason: `${Math.round(snapshot.challenge.progressPercent)}% done. The challenge is just the wrapper; one focused block is the move.`,
    type: "CHALLENGE_NEAR_DONE",
    urgency: 60,
  };
}

export function checkBossActive(
  snapshot: HomeContextSnapshot,
  featureAccess?: FeatureAccessMap,
  productContext?: ProductContext,
): HomePrimaryPriority | null {
  if (!snapshot.boss.hasActiveEncounter) return null;
  if (
    featureAccess &&
    !isFeatureAvailableForNavigation(
      getFeatureAvailability(featureAccess.boss_tab),
    )
  )
    return null;
  if (productContext) {
    if (productContext.firstWeekExperience?.bossIntensity === "hidden")
      return null;
    if (productContext.totalCompletedSessions === 0) return null;
    if (productContext.surfaceMap) {
      const sm = productContext.surfaceMap;
      if (
        (sm.boss_compact === "hidden" || sm.boss_compact === "blocked") &&
        (sm.boss_full_cta === "hidden" || sm.boss_full_cta === "blocked")
      )
        return null;
    }
  }
  return {
    cta: { action: "OPEN_BOSS", text: "Start Focus Session" },
    reason:
      "Boss damage only comes from focused minutes. One clean session moves the bar.",
    type: "BOSS_ACTIVE",
    urgency: 50,
  };
}
