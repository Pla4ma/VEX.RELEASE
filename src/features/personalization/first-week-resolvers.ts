import { resolveInitialLane } from "../lane-engine/service";
import type { LaneProfile } from "../lane-engine/types";
import type { PrimaryGoal } from "./core-schemas";
import type { FirstWeekExperience, FirstWeekResolverInput, FirstWeekStage } from "./first-week-schemas";

export const FINAL_RELEASE_HIDDEN: FirstWeekExperience["hiddenSurfaces"] = [
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
];

export function resolveStage(input: FirstWeekResolverInput): FirstWeekStage {
  if (input.completedSessions === 0) return "DAY_0_NOT_STARTED";
  if (input.completedSessions === 1) return "DAY_1_RETURN";
  if (input.completedSessions === 2) return "DAY_2_PROGRESS_PROOF";
  if (input.completedSessions < 5) return "DAY_3_COMPANION_CONNECTION";
  if (input.completedSessions < 7) return "DAY_5_PATH_FORMING";
  if (input.completedSessions === 7) return "DAY_7_DEEPER_MODE";
  return "POST_DAY_7";
}

export function resolveStudyLabel(
  goal: FirstWeekResolverInput["primaryGoal"],
): FirstWeekExperience["studyLayerLabel"] {
  switch (goal) {
    case "study":
      return "Study OS";
    case "learning":
      return "Learning OS";
    case "creative":
      return "Project Focus Path";
    case "personal":
    case "personal_growth":
      return "Growth Path";
    default:
      return "Deep Work Plan";
  }
}

export function toLaneGoal(goal: FirstWeekResolverInput["primaryGoal"]): PrimaryGoal {
  return goal === "personal_growth" ? "personal" : goal;
}

export function resolveComeback(
  days: number | null,
): FirstWeekExperience["comebackState"] {
  if (days === null || days <= 1) return "none";
  if (days === 2) return "missed_1_day";
  if (days <= 4) return "missed_2_3_days";
  if (days <= 10) return "missed_week";
  return "returning_after_long_gap";
}

export function resolveComebackMessage(
  style: FirstWeekResolverInput["motivationStyle"],
): string {
  if (style === "study_focused")
    return "Do one review block before adding new material.";
  if (style === "game_like")
    return "The run is not over. One clean block puts it back in motion.";
  if (style === "intense") return "Reset with one contained block.";
  if (style === "coach_led")
    return "Reset the rhythm. Twenty minutes is enough.";
  return "You are not behind. Start with one clean session.";
}

export function resolveSurfaces(
  stage: FirstWeekStage,
  input: FirstWeekResolverInput,
  comeback: FirstWeekExperience["comebackState"],
  laneProfile: LaneProfile,
): FirstWeekExperience["allowedHomeSurfaces"] {
  if (comeback !== "none") {
    return ["coach_presence_line", "recovery_cta", "start_session"];
  }
  if (stage === "DAY_0_NOT_STARTED") {
    const base: FirstWeekExperience["allowedHomeSurfaces"] = [
      "motivation_confirmation",
      "coach_presence_line",
      "start_session",
      "tiny_unlock_preview",
    ];
    if (
      input.featureAvailability.boss &&
      laneProfile.primaryLane === "game_like"
    ) {
      base.push("tiny_boss_teaser");
    }
    return base;
  }
  if (
    stage === "DAY_5_PATH_FORMING" ||
    stage === "DAY_7_DEEPER_MODE" ||
    stage === "POST_DAY_7"
  ) {
    return [
      "coach_presence_line",
      "start_session",
      "progress_proof",
      "companion_continuity",
      "study_deep_work_path",
    ];
  }
  return [
    "coach_presence_line",
    "start_session",
    "progress_proof",
    "companion_continuity",
  ];
}

export function resolvePremiumMoment(
  input: FirstWeekResolverInput,
  stage: FirstWeekStage,
): FirstWeekExperience["premiumMoment"] {
  if (!input.featureAvailability.premium || input.premiumState !== "configured")
    return "none";
  if (stage === "DAY_7_DEEPER_MODE" || stage === "POST_DAY_7")
    return "weekly_value";
  if (stage === "DAY_5_PATH_FORMING") return "soft_tease";
  return "none";
}

export function resolveLaneProfile(input: FirstWeekResolverInput): LaneProfile {
  if (input.laneProfile) return input.laneProfile;
  return resolveInitialLane({
    primaryGoal: toLaneGoal(input.primaryGoal),
    motivationStyle: input.motivationStyle,
  });
}

export function resolveBlockedReasons(profile: LaneProfile): string[] {
  const lane = profile.primaryLane;
  if (lane === "student")
    return [
      "Day 0 blocks boss, economy, and hard premium surfaces for study users.",
    ];
  if (lane === "game_like")
    return [
      "Game-like Day 0 allows only tiny run/boss preview; economy stays hidden.",
    ];
  if (lane === "deep_creative")
    return [
      "Creative lane blocks combat and school deadline UI unless explicitly relevant.",
    ];
  return [
    "Minimal lane blocks boss, challenge board, companion animation, premium, and economy surfaces.",
  ];
}
