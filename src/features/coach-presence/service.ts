import {
  ACTION_LABELS,
  PROGRESS_REACTIONS,
  STYLE_ADAPTATION,
} from "./copy";
import {
  getCoachMemoryConfidence,
  getCoachPresenceMessage,
} from "./copy-service";
import {
  CoachPresenceMemorySummarySchema,
  CoachPresenceProgressInputSchema,
  CoachPresenceSchema,
  type CoachActionIntent,
  type CoachPresence,
} from "./schemas";
import type {
  BuildPresenceInput,
  PresenceAvailability,
} from "./coach-presence-types";
import {
  getActionReason,
  getTone,
  getVisualState,
  goalForLane,
  styleForLane,
} from "./service-helpers";

export { buildCompletionCoachPresence } from "./completion-presence";
export { getActionReason, getTone, getVisualState, goalForLane, styleForLane } from "./service-helpers";

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
