import {
  RescueCompletionMemorySchema,
  type RescueCompletionMemory,
  type RescueOutcome,
  type RescuePlan,
} from './schemas';

export function buildRescueCompletionMemory(
  plan: RescuePlan,
  outcome?: RescueOutcome,
): RescueCompletionMemory {
  const minutes = Math.round(plan.durationSeconds / 60);
  const result =
    outcome === 'completed'
      ? 'successfully'
      : outcome === 'partial'
        ? 'partially'
        : 'with a pause';

  return RescueCompletionMemorySchema.parse({
    id: `${plan.id}:memory`,
    source: 'rescue_completion',
    text: `User completed a ${minutes}-minute rescue block ${result} for ${plan.reason}. Lane: ${plan.lane}.`,
    confidence:
      outcome === 'completed' ? 0.8 : outcome === 'partial' ? 0.6 : 0.4,
  });
}

export interface RescuePushInput {
  eligibility: { eligible: boolean };
  userMuted: boolean;
  quietHoursActive: boolean;
  budgetRemaining: number;
  sentToday: number;
  maxDaily: number;
}

export function shouldSendRescuePush(input: RescuePushInput): boolean {
  if (!input.eligibility.eligible) {return false;}
  if (input.userMuted) {return false;}
  if (input.quietHoursActive) {return false;}
  if (input.budgetRemaining <= 0) {return false;}
  if (input.sentToday >= input.maxDaily) {return false;}
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
