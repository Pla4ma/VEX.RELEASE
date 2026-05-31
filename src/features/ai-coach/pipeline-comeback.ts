import { eventBus } from '../../events';
import * as repository from './repository';
import {
  ComebackPlanSchema,
  ActivateComebackInputSchema,
} from './schemas';

export async function activateComeback(
  input:
    | string
    | { userId: string; previousStreak?: number; daysInactive?: number },
) {
  const normalized =
    typeof input === 'string'
      ? { userId: input, previousStreak: 0, daysInactive: 4 }
      : ActivateComebackInputSchema.partial({
          previousStreak: true,
          daysInactive: true,
        }).parse({ previousStreak: 0, daysInactive: 4, ...input });
  const existing = await repository.fetchActiveComebackPlan(normalized.userId);
  if (existing && existing.status === 'ACTIVE') {
    return existing;
  }
  const now = Date.now();
  const plan = ComebackPlanSchema.parse({
    id: crypto.randomUUID(),
    userId: normalized.userId,
    previousStreak: normalized.previousStreak,
    daysInactive: normalized.daysInactive,
    status: 'ACTIVE',
    startedAt: now,
    expiresAt: now + 48 * 60 * 60 * 1000,
    sessionsCompleted: 0,
    targetSessions: 3,
    bonusMultiplier: 2,
    messages: [],
  });
  const savedPlan = await repository.upsertComebackPlan(plan);
  eventBus.publish('coach:comeback_activated', {
    userId: normalized.userId,
    planId: savedPlan.id,
    targetSessions: savedPlan.targetSessions,
    bonusMultiplier: savedPlan.bonusMultiplier,
    expiresAt: savedPlan.expiresAt,
  });
  return savedPlan;
}
