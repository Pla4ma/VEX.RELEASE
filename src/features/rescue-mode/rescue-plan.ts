import type { Lane } from "../lane-engine/types";
import {
  RescueCompletionRecordSchema,
  RescueEligibilityInputSchema,
  RescueEligibilityResultSchema,
  RescuePlanInputSchema,
  RescuePlanSchema,
  type RescueCompletionRecord,
  type RescueEligibilityInput,
  type RescueEligibilityResult,
  type RescueOutcome,
  type RescuePlan,
  type RescuePlanInput,
} from "./schemas";
import {
  clampDuration,
  durationForLane,
  modeFor,
  taskFor,
} from "./rescue-mode-helpers";

export function createRescuePlan(rawInput: RescuePlanInput): RescuePlan {
  const input = RescuePlanInputSchema.parse(rawInput);
  const lane = input.laneProfile?.primaryLane ?? input.lane;
  const createdAt = input.createdAt ?? Date.now();
  return RescuePlanSchema.parse({
    id: `rescue:${input.userId}:${createdAt}`,
    userId: input.userId,
    lane,
    reason: input.reason,
    durationSeconds: clampDuration(input.durationSeconds, lane),
    sessionMode: modeFor(lane),
    taskDescription: taskFor(input, lane),
    frictionLevel:
      input.reason === "distracted" || input.reason === "anxious"
        ? "soft"
        : "none",
    createdAt,
  });
}

export function isRescueEligible(
  rawInput: RescueEligibilityInput,
): RescueEligibilityResult {
  const input = RescueEligibilityInputSchema.parse(rawInput);
  const lane = input.laneProfile?.primaryLane ?? input.lane;

  const notEligible = (reason: string): RescueEligibilityResult =>
    RescueEligibilityResultSchema.parse({
      eligible: false,
      trigger: null,
      reason,
      lane,
      recommendedDurationSeconds: 0,
    });

  if (input.hasActiveSession) return notEligible("Active session in progress.");
  if (input.completedSessions === 0 && input.daysSinceOnboarding === 0) {
    return notEligible("Cold Day 0 — no signal to justify rescue.");
  }

  let trigger: (typeof RescueEligibilityResultSchema)["_output"]["trigger"] =
    null;

  if (input.abandonedSessionExists) {
    trigger = "abandoned_session";
  } else if (input.sessionStartedQuitEarly) {
    trigger = "abandoned_session";
  } else if (input.openedAppNoStart) {
    trigger = "missed_planned";
  } else if (input.missedPlannedSession) {
    trigger = "missed_planned";
  } else if (input.recentDismissals >= 3) {
    trigger = "notification_dismissal_pattern";
  } else if (input.recentDismissals >= 2) {
    trigger = "repeated_dismissals";
  } else if (input.homeCtaDismissals >= 2) {
    trigger = "repeated_dismissals";
  } else if (input.userTooBig) {
    trigger = "user_too_big";
  } else if (input.inactivityDays >= 1 && input.completedSessions >= 1) {
    trigger = "streak_risk";
  }

  if (!trigger) return notEligible("No rescue trigger signal detected.");

  return RescueEligibilityResultSchema.parse({
    eligible: true,
    trigger,
    reason: `Rescue eligible due to ${trigger}.`,
    lane,
    recommendedDurationSeconds: durationForLane(lane),
  });
}

export function generateRescueReflection(
  plan: RescuePlan,
  outcome: RescueOutcome,
): string {
  const minutes = Math.round(plan.durationSeconds / 60);
  if (outcome === "completed") {
    return `Completed a ${minutes}-minute rescue block. Reason: ${plan.reason}. Every small step counts.`;
  }
  if (outcome === "partial") {
    return `Did ${minutes} minutes of a rescue block. Reason: ${plan.reason}. Partial is still progress.`;
  }
  return `Started a rescue block but stepped away. Reason: ${plan.reason}. That is okay. Try again later.`;
}

export function buildRescueCompletionRecord(
  plan: RescuePlan,
  outcome: RescueOutcome,
  actualDurationSeconds: number,
): RescueCompletionRecord {
  const worked = outcome === "completed" || outcome === "partial";

  const nextMap: Record<Lane, string> = {
    student: "Try the same weak section again tomorrow for 10 minutes.",
    game_like: "Do another short recovery run when ready.",
    deep_creative: "Return when the next move is clear.",
    minimal_normal: "A short session tomorrow keeps the momentum.",
  };

  return RescueCompletionRecordSchema.parse({
    id: `${plan.id}:completion`,
    userId: plan.userId,
    planId: plan.id,
    reason: plan.reason,
    lane: plan.lane,
    durationSeconds: actualDurationSeconds,
    outcome,
    worked,
    nextRecommendation: nextMap[plan.lane],
    completedAt: Date.now(),
  });
}

export function buildRescueSessionParams(plan: RescuePlan): {
  rescuePlanId: string;
  rescueTaskDescription: string;
  presetMode: string;
  suggestedDurationSeconds: number;
  source: "rescue";
} {
  return {
    rescuePlanId: plan.id,
    rescueTaskDescription: plan.taskDescription,
    presetMode: plan.sessionMode,
    suggestedDurationSeconds: plan.durationSeconds,
    source: "rescue" as const,
  };
}
