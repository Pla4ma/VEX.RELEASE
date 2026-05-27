import type { Lane } from "../lane-engine/types";
import {
  RescueCompletionMemorySchema,
  RescueCompletionRecordSchema,
  RescueEligibilityInputSchema,
  RescueEligibilityResultSchema,
  RescuePlanInputSchema,
  RescuePlanSchema,
  type RescueCompletionMemory,
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
  } else if (input.missedPlannedSession) {
    trigger = "missed_planned";
  } else if (input.recentDismissals >= 3) {
    trigger = "notification_dismissal_pattern";
  } else if (input.recentDismissals >= 2) {
    trigger = "repeated_dismissals";
  } else if (input.streakAtRisk && input.hoursUntilStreakBreak <= 6) {
    trigger = "streak_risk";
  } else if (input.userTooBig) {
    trigger = "user_too_big";
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
    game_like: "Do another short recovery encounter when ready.",
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

const RESCUE_REFLECTION_QUESTIONS: Record<Lane, Record<RescueReason, string>> = {
  student: {
    too_big: "Was the original task too big, or just the moment?",
    tired: "Would a different time of day help?",
    distracted: "What pulled your attention away first?",
    anxious: "What made starting feel heavy?",
    unclear: "What would make the next step clearer?",
    no_time: "Could 5 minutes work tomorrow?",
  },
  game_like: {
    too_big: "Was the encounter too big, or did you need a warm-up?",
    tired: "Would a different time fit better?",
    distracted: "What interrupted the run?",
    anxious: "What made entering the arena feel heavy?",
    unclear: "What would make the next encounter clear?",
    no_time: "Could a 5-minute sprint fit tomorrow?",
  },
  deep_creative: {
    too_big: "Was the task too big, or did you need a smaller entry point?",
    tired: "Would a different time or environment help?",
    distracted: "What pulled you out of flow?",
    anxious: "What made re-entry feel difficult?",
    unclear: "What is the smallest concrete next step?",
    no_time: "Could 7 minutes work tomorrow?",
  },
  minimal_normal: {
    too_big: "Would a smaller block feel doable?",
    tired: "Would a different time of day help?",
    distracted: "What got in the way?",
    anxious: "What made starting feel hard?",
    unclear: "What would make the next step clear?",
    no_time: "Could 5 minutes work tomorrow?",
  },
};

export function getRescueReflectionQuestion(plan: RescuePlan): string {
  return RESCUE_REFLECTION_QUESTIONS[plan.lane][plan.reason];
}

const RETURN_TOMORROW_ACTIONS: Record<Lane, Record<RescueReason, string>> = {
  student: {
    too_big: "Break the next session into one review block.",
    tired: "Try again tomorrow when energy is higher.",
    distracted: "Clear distractions before starting tomorrow.",
    anxious: "Start with just one page. No quiz.",
    unclear: "Name one specific topic for tomorrow.",
    no_time: "Block 5 minutes tomorrow for one review.",
  },
  game_like: {
    too_big: "Start tomorrow with one short encounter.",
    tired: "Come back tomorrow when the run feels lighter.",
    distracted: "Silence everything before tomorrow's run.",
    anxious: "Tomorrow's run: survive 5 minutes. That is enough.",
    unclear: "Pick one clear target for tomorrow.",
    no_time: "5-minute sprint tomorrow. No setup.",
  },
  deep_creative: {
    too_big: "Tomorrow: identify one concrete next move.",
    tired: "Return tomorrow with fresh eyes.",
    distracted: "Close everything except one file tomorrow.",
    anxious: "Tomorrow: just open the project. That is the session.",
    unclear: "Name the next step before tomorrow.",
    no_time: "7 minutes tomorrow. Just name the next move.",
  },
  minimal_normal: {
    too_big: "Start tomorrow with one 5-minute block.",
    tired: "Come back fresh tomorrow.",
    distracted: "Create a quiet space for tomorrow's block.",
    anxious: "Tomorrow: one block. No pressure beyond that.",
    unclear: "Define one small goal for tomorrow.",
    no_time: "5 minutes tomorrow. Just start.",
  },
};

export function getRescueReturnTomorrowAction(plan: RescuePlan): string {
  return RETURN_TOMORROW_ACTIONS[plan.lane][plan.reason];
}

export function buildRescueCompletionMemory(
  plan: RescuePlan,
  outcome?: RescueOutcome,
): RescueCompletionMemory {
  const minutes = Math.round(plan.durationSeconds / 60);
  const result =
    outcome === "completed"
      ? "successfully"
      : outcome === "partial"
        ? "partially"
        : "with a pause";

  return RescueCompletionMemorySchema.parse({
    id: `${plan.id}:memory`,
    source: "rescue_completion",
    text: `User completed a ${minutes}-minute rescue block ${result} for ${plan.reason}. Lane: ${plan.lane}.`,
    confidence:
      outcome === "completed" ? 0.8 : outcome === "partial" ? 0.6 : 0.4,
  });
}

export interface RescuePushInput {
  eligibility: RescueEligibilityResult;
  userMuted: boolean;
  quietHoursActive: boolean;
  budgetRemaining: number;
  sentToday: number;
  maxDaily: number;
}

export function shouldSendRescuePush(input: RescuePushInput): boolean {
  if (!input.eligibility.eligible) return false;
  if (input.userMuted) return false;
  if (input.quietHoursActive) return false;
  if (input.budgetRemaining <= 0) return false;
  if (input.sentToday >= input.maxDaily) return false;
  return true;
}

export function buildRescuePushPayload(plan: RescuePlan): {
  title: string;
  body: string;
} {
  const minutes = Math.round(plan.durationSeconds / 60);
  return {
    title: `${minutes}-minute recovery ready`,
    body: `${plan.taskDescription} — tap to start.`,
  };
}
