import { SessionMode } from '../../session/modes';
import type { Lane } from '../lane-engine/types';
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
  type RescueReason,
} from './schemas';

// ── Lane-Specific Rescue Copy ──────────────────────────────────────────
const LANE_RESCUE_COPY: Record<Lane, Record<RescueReason, string>> = {
  student: {
    too_big: 'Open notes and review one weak section for 8 minutes.',
    tired: 'Review one page of notes. No pressure beyond that.',
    distracted: 'Put the phone away. One study block, 8 minutes.',
    anxious: 'Open your notes. Just look. No quiz. 8 minutes.',
    unclear: 'Open notes and review one weak section for 8 minutes.',
    no_time: 'Review one topic. 5 minutes. That is enough.',
  },
  game_like: {
    too_big: 'Recovery encounter: survive 10 clean minutes.',
    tired: 'A short run. No boss. Just move for 10 minutes.',
    distracted: 'One encounter. 10 minutes. Turn everything else off.',
    anxious: 'Recovery encounter: survive 10 clean minutes.',
    unclear: 'Recovery encounter: survive 10 clean minutes.',
    no_time: 'Mini sprint. 5 minutes. Just one encounter.',
  },
  deep_creative: {
    too_big: 'Re-enter the project for 7 minutes. Only identify the next move.',
    tired: 'Open the project. Look at one file. 7 minutes max.',
    distracted: 'Re-enter the project for 7 minutes. Only identify the next move.',
    anxious: 'Re-enter the project for 7 minutes. Only identify the next move.',
    unclear: 'Name the next concrete step. That is the session.',
    no_time: '7 minutes. Just the next move. Nothing else.',
  },
  minimal_normal: {
    too_big: 'Do 5 minutes. Stop cleanly if needed.',
    tired: 'Do 5 minutes. Stop cleanly if needed.',
    distracted: 'Do 5 minutes. Stop cleanly if needed.',
    anxious: 'Do 5 minutes. Stop cleanly if needed.',
    unclear: 'Do 5 minutes. Stop cleanly if needed.',
    no_time: 'Do 5 minutes. Stop cleanly if needed.',
  },
};

// ── Duration Helpers ───────────────────────────────────────────────────
function clampDuration(seconds: number | undefined, lane: Lane): number {
  const defaultDuration = durationForLane(lane);
  return Math.max(5 * 60, Math.min(seconds ?? defaultDuration, 12 * 60));
}

function durationForLane(lane: Lane): number {
  if (lane === 'student') return 8 * 60;
  if (lane === 'game_like') return 10 * 60;
  if (lane === 'deep_creative') return 7 * 60;
  return 5 * 60;
}

// ── Mode ───────────────────────────────────────────────────────────────
function modeFor(lane: Lane): SessionMode {
  if (lane === 'student') return SessionMode.STUDY;
  if (lane === 'deep_creative') return SessionMode.CREATIVE;
  if (lane === 'game_like') return SessionMode.SPRINT;
  return SessionMode.RECOVERY;
}

// ── Task Description ───────────────────────────────────────────────────
function taskFor(input: RescuePlanInput): string {
  if (input.taskDescription) return input.taskDescription;
  return LANE_RESCUE_COPY[input.lane][input.reason];
}

// ── Plan Creation ──────────────────────────────────────────────────────
export function createRescuePlan(rawInput: RescuePlanInput): RescuePlan {
  const input = RescuePlanInputSchema.parse(rawInput);
  const createdAt = input.createdAt ?? Date.now();
  return RescuePlanSchema.parse({
    id: `rescue:${input.userId}:${createdAt}`,
    userId: input.userId,
    lane: input.lane,
    reason: input.reason,
    durationSeconds: clampDuration(input.durationSeconds, input.lane),
    sessionMode: modeFor(input.lane),
    taskDescription: taskFor(input),
    frictionLevel:
      input.reason === 'distracted' || input.reason === 'anxious' ? 'soft' : 'none',
    createdAt,
  });
}

// ── Eligibility ────────────────────────────────────────────────────────
export function isRescueEligible(
  rawInput: RescueEligibilityInput,
): RescueEligibilityResult {
  const input = RescueEligibilityInputSchema.parse(rawInput);

  const notEligible = (reason: string): RescueEligibilityResult =>
    RescueEligibilityResultSchema.parse({
      eligible: false,
      trigger: null,
      reason,
      lane: input.lane,
      recommendedDurationSeconds: 0,
    });

  if (input.hasActiveSession) return notEligible('Active session in progress.');
  if (input.completedSessions === 0 && input.daysSinceOnboarding === 0) {
    return notEligible('Cold Day 0 — no signal to justify rescue.');
  }

  let trigger: (typeof RescueEligibilityResultSchema)['_output']['trigger'] = null;

  if (input.abandonedSessionExists) {
    trigger = 'abandoned_session';
  } else if (input.missedPlannedSession) {
    trigger = 'missed_planned';
  } else if (input.recentDismissals >= 2) {
    trigger = 'repeated_dismissals';
  } else if (input.streakAtRisk && input.hoursUntilStreakBreak <= 6) {
    trigger = 'streak_risk';
  } else if (input.recentDismissals >= 3) {
    trigger = 'notification_dismissal_pattern';
  }

  if (!trigger) return notEligible('No rescue trigger signal detected.');

  return RescueEligibilityResultSchema.parse({
    eligible: true,
    trigger,
    reason: `Rescue eligible due to ${trigger}.`,
    lane: input.lane,
    recommendedDurationSeconds: durationForLane(input.lane),
  });
}

// ── Reflection ─────────────────────────────────────────────────────────
export function generateRescueReflection(
  plan: RescuePlan,
  outcome: RescueOutcome,
): string {
  const minutes = Math.round(plan.durationSeconds / 60);
  if (outcome === 'completed') {
    return `Completed a ${minutes}-minute rescue block. Reason: ${plan.reason}. Every small step counts.`;
  }
  if (outcome === 'partial') {
    return `Did ${minutes} minutes of a rescue block. Reason: ${plan.reason}. Partial is still progress.`;
  }
  return `Started a rescue block but stepped away. Reason: ${plan.reason}. That is okay. Try again later.`;
}

// ── Completion Record ──────────────────────────────────────────────────
export function buildRescueCompletionRecord(
  plan: RescuePlan,
  outcome: RescueOutcome,
  actualDurationSeconds: number,
): RescueCompletionRecord {
  const worked = outcome === 'completed' || outcome === 'partial';

  const nextMap: Record<Lane, string> = {
    student: 'Try the same weak section again tomorrow for 10 minutes.',
    game_like: 'Do another short recovery encounter when ready.',
    deep_creative: 'Return when the next move is clear.',
    minimal_normal: 'A short session tomorrow keeps the momentum.',
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
  source: 'rescue';
} {
  return {
    rescuePlanId: plan.id,
    rescueTaskDescription: plan.taskDescription,
    presetMode: plan.sessionMode,
    suggestedDurationSeconds: plan.durationSeconds,
    source: 'rescue' as const,
  };
}

// ── Memory Candidate ───────────────────────────────────────────────────
export function buildRescueCompletionMemory(
  plan: RescuePlan,
  outcome?: RescueOutcome,
): RescueCompletionMemory {
  const minutes = Math.round(plan.durationSeconds / 60);
  const result = outcome === 'completed' ? 'successfully' : outcome === 'partial' ? 'partially' : 'with a pause';

  return RescueCompletionMemorySchema.parse({
    id: `${plan.id}:memory`,
    source: 'rescue_completion',
    text: `User completed a ${minutes}-minute rescue block ${result} for ${plan.reason}. Lane: ${plan.lane}.`,
    confidence: outcome === 'completed' ? 0.8 : outcome === 'partial' ? 0.6 : 0.4,
  });
}
