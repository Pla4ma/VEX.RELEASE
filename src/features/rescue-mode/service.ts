import { SessionMode } from '../../session/modes';
import {
  RescueCompletionMemorySchema,
  RescuePlanInputSchema,
  RescuePlanSchema,
  type RescueCompletionMemory,
  type RescuePlan,
  type RescuePlanInput,
} from './schemas';
import type { Lane } from '../lane-engine/types';

function clampDuration(seconds: number | undefined): number {
  return Math.max(5 * 60, Math.min(seconds ?? 8 * 60, 12 * 60));
}

function modeFor(lane: Lane): SessionMode {
  if (lane === 'student') return SessionMode.STUDY;
  if (lane === 'deep_creative') return SessionMode.CREATIVE;
  if (lane === 'game_like') return SessionMode.SPRINT;
  return SessionMode.RECOVERY;
}

function taskFor(input: RescuePlanInput): string {
  if (input.taskDescription) return input.taskDescription;
  if (input.reason === 'too_big') return 'Do the smallest visible piece.';
  if (input.reason === 'unclear') return 'Name the next concrete step.';
  if (input.reason === 'no_time') return 'Use five minutes on the useful edge.';
  return 'Start with one honest minute.';
}

export function createRescuePlan(rawInput: RescuePlanInput): RescuePlan {
  const input = RescuePlanInputSchema.parse(rawInput);
  const createdAt = input.createdAt ?? Date.now();
  return RescuePlanSchema.parse({
    id: `rescue:${input.userId}:${createdAt}`,
    userId: input.userId,
    lane: input.lane,
    reason: input.reason,
    durationSeconds: clampDuration(input.durationSeconds),
    sessionMode: modeFor(input.lane),
    taskDescription: taskFor(input),
    frictionLevel: input.reason === 'distracted' || input.reason === 'anxious' ? 'soft' : 'none',
    createdAt,
  });
}

export function buildRescueCompletionMemory(plan: RescuePlan): RescueCompletionMemory {
  return RescueCompletionMemorySchema.parse({
    id: `${plan.id}:memory`,
    source: 'rescue_completion',
    text: `User used a ${Math.round(plan.durationSeconds / 60)}-minute rescue block for ${plan.reason}.`,
    confidence: 0.64,
  });
}
