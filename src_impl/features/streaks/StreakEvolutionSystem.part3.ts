import { eventBus } from "../../events";


export function progressRecovery(
  userId: string,
  _eventType: string
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

export function checkMilestones(streakDays: number): StreakMilestone[] {
  return STREAK_MILESTONES.filter((m) => m.days === streakDays);
}

export function getNextMilestone(currentStreak: number): StreakMilestone | null {
  return STREAK_MILESTONES.find((m) => m.days > currentStreak) ?? null;
}

export function getMilestoneProgress(currentDays: number): { nextMilestone: StreakMilestone | null; percentComplete: number } {
  const exactMatch = STREAK_MILESTONES.find((m) => m.days === currentDays);
  if (exactMatch) {
    return { nextMilestone: exactMatch, percentComplete: 100 };
  }

  const next = STREAK_MILESTONES.find((m) => m.days > currentDays);
  if (!next) {
    return { nextMilestone: null, percentComplete: 100 };
  }

  const percentComplete = Math.min(100, Math.max(0, (currentDays / next.days) * 100));

  return { nextMilestone: next, percentComplete };
}

export function getStreakDisplayText(
  streakDays: number,
  _state?: StreakState,
  _isRecovering?: boolean
): string {
  return `${streakDays} Day${streakDays === 1 ? '' : 's'}`;
}

export function getStreakCelebrationMessage(streakDays: number): string {
  if (streakDays === 1) { return 'Day 1! Your streak begins.'; }
  if (streakDays === 3) { return '3 days! Building momentum.'; }
  if (streakDays === 7) { return `Week Warrior! 7 days strong.`; }
  if (streakDays === 14) { return 'Fortnight Focused! 14 days!'; }
  if (streakDays === 30) { return 'Monthly Master! Incredible dedication.'; }
  if (streakDays === 100) { return 'Century Club! You are legendary.'; }
  return `${streakDays} days! Keep it going!`;
}