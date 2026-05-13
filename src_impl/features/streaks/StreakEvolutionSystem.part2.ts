import { eventBus } from "../../events";


export function calculateHoursUntilStreakBreak(currentTime: number = Date.now()): number {
  // Use real Date() (not mocked) as the reference for "end of today"
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const hours = (endOfToday.getTime() - currentTime) / (1000 * 60 * 60);
  return Math.max(0, hours);
}

export function getStreakStateInfo(state: StreakState): StreakStateInfo {
  return STREAK_STATES[state] ?? {
    state: state,
    label: 'Unknown',
    description: 'Unknown state',
    color: '#718096',
    icon: '❓',
    animation: 'none',
    urgency: 'none',
    coachMessage: '',
  };
}

export function getStreakVisualIndicator(
  state: StreakState,
  streakDays: number
): { type: string; intensity: number; animation: string } {
  const intensityMap: Record<StreakState, number> = {
    ACTIVE: Math.min(1, 0.3 + streakDays * 0.05),
    AT_RISK: 0.6,
    CRITICAL: 1.0,
    BROKEN: 0,
    RECOVERING: 0.3,
    PROTECTED: 0.8,
  };

  switch (state) {
    case 'ACTIVE':
      return { type: 'flame', intensity: intensityMap.ACTIVE, animation: streakDays >= 7 ? 'milestone-glow' : 'glow' };
    case 'AT_RISK':
      return { type: 'pulse', intensity: 0.6, animation: 'warning-pulse' };
    case 'CRITICAL':
      return { type: 'critical', intensity: 1.0, animation: 'shake' };
    case 'BROKEN':
      return { type: 'broken', intensity: 0, animation: 'none' };
    case 'RECOVERING':
      return { type: 'recover', intensity: 0.3, animation: 'gentle-pulse' };
    case 'PROTECTED':
      return { type: 'shield', intensity: 0.8, animation: 'shield' };
    default:
      return { type: 'flame', intensity: 0, animation: 'none' };
  }
}

export function awardInsurance(
  userId: string,
  source: string,
  count: number
): { success: boolean; userInsurance: { totalAvailable: number } } {
  const existing = insuranceStore.get(userId) ?? [];
  const currentActive = existing.filter((i) => i.status === 'active').length;
  const toAdd = Math.min(MAX_INSURANCE - currentActive, count);
  const newItems: InsuranceItem[] = Array.from({ length: toAdd }, (_, idx) => ({
    id: `ins-${Date.now()}-${idx}`,
    source,
    status: 'active' as const,
    earnedAt: Date.now(),
  }));
  const updated = [...existing, ...newItems];
  insuranceStore.set(userId, updated);
  const totalAvailable = updated.filter((i) => i.status === 'active').length;

  eventBus.publish('streak:insurance_awarded', {
    userId,
    insuranceId: newItems[0]?.id ?? '',
    source,
  });

  return { success: true, userInsurance: { totalAvailable } };
}

export function getAvailableInsuranceCount(userId: string): number {
  const items = insuranceStore.get(userId) ?? [];
  return items.filter((i) => i.status === 'active').length;
}

export function getUserInsurance(userId: string): { insurances: InsuranceItem[]; totalAvailable: number } | null {
  const items = insuranceStore.get(userId);
  if (!items || items.length === 0) {
    return insuranceStore.has(userId) ? { insurances: [], totalAvailable: 0 } : null;
  }
  return {
    insurances: [...items],
    totalAvailable: items.filter((i) => i.status === 'active').length,
  };
}

export function canUseInsurance(userId: string): { canUse: boolean; reason: string } {
  const count = getAvailableInsuranceCount(userId);
  if (count <= 0) {
    return { canUse: false, reason: 'No insurance available' };
  }
  return { canUse: true, reason: '' };
}

export function useInsurance(userId: string, _context: string): { success: boolean; remainingInsurance: number; error?: string } {
  const items = insuranceStore.get(userId) ?? [];
  const activeItem = items.find((i) => i.status === 'active');
  if (!activeItem) {
    return { success: false, remainingInsurance: 0, error: 'No active insurance available' };
  }
  activeItem.status = 'used';
  const remaining = items.filter((i) => i.status === 'active').length;

  eventBus.publish('streak:insurance_used', {
    userId,
    insuranceId: activeItem.id,
    streakDays: 0,
    source: activeItem.source,
  });

  return { success: true, remainingInsurance: remaining };
}

export function createRecoveryPlan(
  userId: string,
  daysLost: number,
  _xpAtRisk: number
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

  eventBus.publish('streak:recovery_plan_created', {
    userId,
    planId: userId,
  });

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