import { eventBus } from '../../events';
import type { StreakRecoveryPlan } from './types';

const recoveryPlans = new Map<string, StreakRecoveryPlan>();

export function createRecoveryPlan(
  userId: string,
  daysLost: number,
  _xpAtRisk: number,
): StreakRecoveryPlan {
  let sessionsRequired = 1;
  if (daysLost >= 7 && daysLost <= 14) {
    sessionsRequired = 2;
  } else if (daysLost > 14) {
    sessionsRequired = 3;
  }
  const plan: StreakRecoveryPlan = {
    userId,
    daysLost,
    sessionsRequired,
    currentProgress: 0,
    completed: false,
    reward: { type: 'XP', value: Math.max(100, daysLost * 50) },
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    previousStreak: daysLost,
    isRecovering: true,
  };
  recoveryPlans.set(userId, plan);
  eventBus.publish('streak:recovery_plan_created', { userId, planId: userId });
  return plan;
}

export function getRecoveryPlan(userId: string): StreakRecoveryPlan | null {
  const plan = recoveryPlans.get(userId);
  if (!plan) {
    return null;
  }
  if (plan.expiresAt < Date.now()) {
    recoveryPlans.delete(userId);
    return null;
  }
  return plan;
}

export function progressRecovery(
  userId: string,
  _eventType: string,
): { progressed: boolean; currentProgress: number } {
  const plan = recoveryPlans.get(userId);
  if (!plan) {
    return { progressed: false, currentProgress: 0 };
  }
  plan.currentProgress += 1;
  if (plan.currentProgress >= plan.sessionsRequired) {
    plan.completed = true;
    plan.isRecovering = false;
  }
  return { progressed: true, currentProgress: plan.currentProgress };
}

export function clearRecoveryPlan(userId: string): void {
  recoveryPlans.delete(userId);
}
