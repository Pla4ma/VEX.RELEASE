import type { LaneProfile } from "../lane-engine/types";
import { STYLE_ADAPTATION } from "./copy";
import type {
  CoachActionIntent,
  CoachPresence,
  CoachPresenceMotivationStyle,
  CoachPresenceVisualState,
} from "./schemas";
import type { BuildPresenceInput } from "./coach-presence-types";

export function styleForLane(
  profile: LaneProfile | null | undefined,
  fallback: CoachPresenceMotivationStyle,
): CoachPresenceMotivationStyle {
  if (!profile) return fallback;
  if (profile.primaryLane === "student") return "STUDY_FOCUSED";
  if (profile.primaryLane === "game_like") return "GAME_LIKE";
  if (profile.primaryLane === "deep_creative") return "COACH_LED";
  return "CALM";
}

export function goalForLane(
  profile: LaneProfile | null | undefined,
  fallback: "focus" | "study",
): "focus" | "study" | "creative" | "personal" {
  if (!profile) return fallback;
  if (profile.primaryLane === "student") return "study";
  if (profile.primaryLane === "deep_creative") return "creative";
  if (profile.primaryLane === "minimal_normal") return "personal";
  return "focus";
}

export function getActionReason(
  intent: CoachActionIntent,
  style: CoachPresenceMotivationStyle,
): string {
  if (intent === "START_STUDY_SESSION") return "Your study context is ready.";
  if (intent === "REVIEW_PROGRESS")
    return "Progress is the clearest next signal.";
  return STYLE_ADAPTATION[style];
}

const toneMap: Record<
  CoachPresenceMotivationStyle,
  Pick<CoachPresence["tone"], "intensity" | "personality">
> = {
  CALM: { intensity: "low", personality: "steady" },
  FRIENDLY: { intensity: "medium", personality: "warm" },
  COACH_LED: { intensity: "medium", personality: "directive" },
  GAME_LIKE: { intensity: "medium", personality: "playful" },
  INTENSE: { intensity: "high", personality: "sharp" },
  STUDY_FOCUSED: { intensity: "medium", personality: "studious" },
};

export function getTone(
  style: CoachPresenceMotivationStyle,
): CoachPresence["tone"] {
  return { motivationStyle: style, ...toneMap[style] };
}

export function getVisualState(
  companion: BuildPresenceInput["companion"],
  style: CoachPresenceMotivationStyle,
): CoachPresenceVisualState {
  const reaction =
    style === "INTENSE"
      ? "ready"
      : style === "GAME_LIKE"
        ? "celebrating"
        : style === "FRIENDLY"
          ? "focused"
          : "steady";
  return {
    element: companion?.element ?? "LUMINA",
    level: companion?.level ?? 1,
    mood: companion?.currentMood ?? "FOCUSED",
    phase: companion?.phase ?? "YOUNG",
    reaction,
  };
}
