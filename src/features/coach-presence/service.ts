import type { LaneProfile } from "../lane-engine/types";
import { ACTION_LABELS, PROGRESS_REACTIONS, STYLE_ADAPTATION } from "./copy";
import {
  getCoachMemoryConfidence,
  getCoachPresenceMessage,
} from "./copy-service";
import {
  CoachPresenceMemorySummarySchema,
  CoachPresenceProgressInputSchema,
  CoachPresenceSchema,
  CompletionPresenceSummarySchema,
  type CoachActionIntent,
  type CoachPresence,
  type CoachPresenceMotivationStyle,
  type CoachPresenceVisualState,
} from "./schemas";
import type {
  BuildPresenceInput,
  CompletionPresenceInput,
  PresenceAvailability,
} from "./coach-presence-types";
function styleForLane(
  profile: LaneProfile | null | undefined,
  fallback: CoachPresenceMotivationStyle,
): CoachPresenceMotivationStyle {
  if (!profile) return fallback;
  if (profile.primaryLane === "student") return "STUDY_FOCUSED";
  if (profile.primaryLane === "game_like") return "GAME_LIKE";
  if (profile.primaryLane === "deep_creative") return "COACH_LED";
  return "CALM";
}
function goalForLane(
  profile: LaneProfile | null | undefined,
  fallback: "focus" | "study",
): "focus" | "study" | "creative" | "personal" {
  if (!profile) return fallback;
  if (profile.primaryLane === "student") return "study";
  if (profile.primaryLane === "deep_creative") return "creative";
  if (profile.primaryLane === "minimal_normal") return "personal";
  return "focus";
}
export function resolveCoachActionIntent(input: {
  requestedIntent: CoachActionIntent;
  featureAvailability: PresenceAvailability;
}): CoachActionIntent {
  if (
    input.requestedIntent === "START_STUDY_SESSION" &&
    input.featureAvailability.study.canNavigate
  ) {
    return "START_STUDY_SESSION";
  }
  if (
    input.requestedIntent === "REVIEW_PROGRESS" &&
    input.featureAvailability.progress.canNavigate
  ) {
    return "REVIEW_PROGRESS";
  }
  if (
    (input.requestedIntent === "CONTINUE_PLAN" ||
      input.requestedIntent === "REFLECT") &&
    input.featureAvailability.study.canNavigate
  ) {
    return input.requestedIntent;
  }
  if (input.requestedIntent === "TAKE_BREAK") {
    return "TAKE_BREAK";
  }
  return input.featureAvailability.focus.canNavigate
    ? "START_SESSION"
    : "TAKE_BREAK";
}
export function buildCoachPresence(input: BuildPresenceInput): CoachPresence {
  const progress = CoachPresenceProgressInputSchema.parse(input.progress);
  const memorySummary = CoachPresenceMemorySummarySchema.parse(
    input.memorySummary,
  );
  const motivationStyle = styleForLane(
    input.laneProfile,
    input.motivationStyle,
  );
  const primaryGoal = goalForLane(
    input.laneProfile,
    input.motivationStyle === "STUDY_FOCUSED" ? "study" : "focus",
  );
  const memoryConfidence = getCoachMemoryConfidence(
    progress.totalSessions,
    memorySummary.syncAvailable,
  );
  const premiumMoment =
    input.surface === "PREMIUM"
      ? "session_value"
      : input.surface === "RESCUE"
        ? "none"
        : progress.totalSessions >= 5
          ? "soft_tease"
          : "none";

  const sessionMode = input.surface === "RESCUE" ? "active_risk" : "inactive";

  const completionContext =
    input.surface === "RESCUE"
      ? "comeback"
      : input.surface === "PREMIUM"
        ? null
        : null;

  const resolved = getCoachPresenceMessage({
    aiAvailable: memorySummary.syncAvailable,
    bossIntensity: null,
    comebackState: input.surface === "RESCUE" ? "missed_1_day" : null,
    completionContext,
    firstWeekStage: progress.totalSessions === 0 ? "day_0" : null,
    latestSession: null,
    memoryConfidence,
    motivationStyle,
    premiumMoment,
    primaryGoal,
    sessionMode,
    studyLayerLabel: primaryGoal === "study" ? "Study" : null,
  });
  const intent = resolveCoachActionIntent({
    featureAvailability: input.featureAvailability,
    requestedIntent: resolved.safeIntent,
  });
  return CoachPresenceSchema.parse({
    id: `coach-presence:${input.surface.toLowerCase()}`,
    memoryConfidence,
    memorySummary,
    message: resolved.message,
    motivationStyleAdaptation: STYLE_ADAPTATION[motivationStyle],
    nextAction: {
      intent,
      label: ACTION_LABELS[intent],
      reason: getActionReason(intent, motivationStyle),
    },
    progressReaction: PROGRESS_REACTIONS[motivationStyle],
    sessionReflection: resolved.message,
    tone: getTone(motivationStyle),
    visualCompanionState: getVisualState(input.companion, motivationStyle),
  });
}
export function buildCompletionCoachPresence(
  input: CompletionPresenceInput,
): CoachPresence {
  const summary = CompletionPresenceSummarySchema.parse(input.summary);
  const memorySummary = CoachPresenceMemorySummarySchema.parse(
    input.memorySummary,
  );
  const motivationStyle = styleForLane(
    input.laneProfile,
    input.motivationStyle,
  );
  const primaryGoal = goalForLane(
    input.laneProfile,
    summary.sessionMode === "STUDY" ? "study" : "focus",
  );
  const memoryConfidence = getCoachMemoryConfidence(
    summary.isFirstSession ? 1 : 3,
    memorySummary.syncAvailable,
  );
  const reflection = getCoachPresenceMessage({
    aiAvailable: memorySummary.syncAvailable,
    bossIntensity: null,
    comebackState: summary.isComeback ? "missed_1_day" : null,
    completionContext: summary.isFirstSession
      ? "first_session"
      : summary.isComeback
        ? "comeback"
        : null,
    firstWeekStage: summary.isFirstSession ? "after_session_1" : null,
    latestSession: {
      durationMinutes: summary.durationMinutes,
      focusPurityScore: summary.focusPurityScore,
      isComeback: summary.isComeback,
      mode: summary.sessionMode,
    },
    memoryConfidence,
    motivationStyle,
    premiumMoment: "none",
    primaryGoal,
    sessionMode: "completed",
    studyLayerLabel: primaryGoal === "study" ? "Study" : null,
  });
  const base = buildCoachPresence({
    companion: null,
    featureAvailability: input.featureAvailability,
    laneProfile: input.laneProfile,
    memorySummary,
    motivationStyle,
    progress: {
      currentStreakDays: summary.streakDays,
      highFocusStreak: summary.isHighFocusStreak ? 1 : 0,
      totalSessions: summary.isFirstSession ? 1 : 3,
    },
    surface: "SESSION_SETUP",
  });
  return CoachPresenceSchema.parse({
    ...base,
    id: "coach-presence:session-completion",
    message: reflection.message,
    nextAction: {
      intent: resolveCoachActionIntent({
        featureAvailability: input.featureAvailability,
        requestedIntent:
          summary.sessionMode === "STUDY"
            ? "START_STUDY_SESSION"
            : "START_SESSION",
      }),
      label:
        summary.sessionMode === "STUDY" ? "Next study block" : "Next focus",
      reason:
        summary.focusPurityScore >= 90
          ? "The rhythm is warm."
          : "Keep the next move simple.",
    },
    sessionReflection: reflection.message,
  });
}
function getActionReason(
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
function getTone(style: CoachPresenceMotivationStyle): CoachPresence["tone"] {
  return { motivationStyle: style, ...toneMap[style] };
}
function getVisualState(
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
