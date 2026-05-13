import { eventBus } from '../../events';

export interface StreakMilestone {
  days: number;
  title: string;
  name: string;
  description: string;
  badgeIcon: string;
  rewardType: 'COSMETIC' | 'SHIELD' | 'XP' | 'FEATURE';
  rewardId: string;
  visualEffect: string;
  achieved: boolean;
  achievedAt: number | null;
  rewards: Array<{ type: string; value: number }>;
}

export interface StreakRecoveryPlan {
  userId: string;
  daysLost: number;
  sessionsRequired: number;
  currentProgress: number;
  completed: boolean;
  reward: { type: string; value: number };
  expiresAt: number;
  previousStreak: number;
  isRecovering: boolean;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 3, title: 'First Steps', name: 'First Steps',
    description: '3 days of consistent focus - you are building a habit',
    badgeIcon: '🌱', rewardType: 'XP', rewardId: 'momentum-bonus',
    visualEffect: 'sparkle', achieved: false, achievedAt: null,
    rewards: [{ type: 'XP', value: 150 }],
  },
  {
    days: 7, title: 'Week Warrior', name: 'Week Warrior',
    description: 'A full week of dedication - you are a force of nature',
    badgeIcon: '🛡️', rewardType: 'SHIELD', rewardId: 'week-shield',
    visualEffect: 'shield-glow', achieved: false, achievedAt: null,
    rewards: [{ type: 'SHIELD', value: 1 }, { type: 'XP', value: 500 }],
  },
  {
    days: 14, title: 'Fortnight Focused', name: 'Fortnight Focused',
    description: '14 days strong - your consistency is inspiring',
    badgeIcon: '🎆', rewardType: 'COSMETIC', rewardId: 'animated-avatar-frame',
    visualEffect: 'fireworks', achieved: false, achievedAt: null,
    rewards: [{ type: 'COSMETIC', value: 1 }, { type: 'XP', value: 1000 }],
  },
  {
    days: 30, title: 'Monthly Master', name: 'Monthly Master',
    description: 'A month of mastery - you are unstoppable',
    badgeIcon: '👑', rewardType: 'COSMETIC', rewardId: 'premium-cosmetic-set',
    visualEffect: 'crown-coronation', achieved: false, achievedAt: null,
    rewards: [{ type: 'COSMETIC', value: 3 }, { type: 'SHIELD', value: 1 }, { type: 'XP', value: 3000 }],
  },
  {
    days: 100, title: 'Century Club', name: 'Century Club',
    description: '100 days of excellence - you are legendary',
    badgeIcon: '🏆', rewardType: 'FEATURE', rewardId: 'exclusive-boss-unlock',
    visualEffect: 'legendary-aura', achieved: false, achievedAt: null,
    rewards: [{ type: 'FEATURE', value: 1 }, { type: 'SHIELD', value: 2 }, { type: 'XP', value: 10000 }],
  },
];

export function checkMilestones(streakDays: number): StreakMilestone[] {
  return STREAK_MILESTONES.filter((m) => m.days === streakDays);
}

export function getNextMilestone(currentStreak: number): StreakMilestone | null {
  return STREAK_MILESTONES.find((m) => m.days > currentStreak) ?? null;
}

export function getMilestoneProgress(currentDays: number): { nextMilestone: StreakMilestone | null; percentComplete: number } {
  const exactMatch = STREAK_MILESTONES.find((m) => m.days === currentDays);
  if (exactMatch) { return { nextMilestone: exactMatch, percentComplete: 100 }; }
  const next = STREAK_MILESTONES.find((m) => m.days > currentDays);
  if (!next) { return { nextMilestone: null, percentComplete: 100 }; }
  const percentComplete = Math.min(100, Math.max(0, (currentDays / next.days) * 100));
  return { nextMilestone: next, percentComplete };
}

// ============================================================================
// Streak Insurance System
// ============================================================================

const MAX_INSURANCE = 3;

interface InsuranceItem {
  id: string;
  source: string;
  status: 'active' | 'used';
  earnedAt: number;
}

const insuranceStore = new Map<string, InsuranceItem[]>();

export function awardInsurance(userId: string, source: string, count: number): { success: boolean; userInsurance: { totalAvailable: number } } {
  const existing = insuranceStore.get(userId) ?? [];
  const currentActive = existing.filter((i) => i.status === 'active').length;
  const toAdd = Math.min(MAX_INSURANCE - currentActive, count);
  const newItems: InsuranceItem[] = Array.from({ length: toAdd }, (_, idx) => ({
    id: `ins-${Date.now()}-${idx}`, source, status: 'active' as const, earnedAt: Date.now(),
  }));
  const updated = [...existing, ...newItems];
  insuranceStore.set(userId, updated);
  const totalAvailable = updated.filter((i) => i.status === 'active').length;
  eventBus.publish('streak:insurance_awarded', { userId, insuranceId: newItems[0]?.id ?? '', source });
  return { success: true, userInsurance: { totalAvailable } };
}

export function getAvailableInsuranceCount(userId: string): number {
  const items = insuranceStore.get(userId) ?? [];
  return items.filter((i) => i.status === 'active').length;
}

export function getUserInsurance(userId: string): { insurances: InsuranceItem[]; totalAvailable: number } | null {
  const items = insuranceStore.get(userId);
  if (!items || items.length === 0) { return insuranceStore.has(userId) ? { insurances: [], totalAvailable: 0 } : null; }
  return { insurances: [...items], totalAvailable: items.filter((i) => i.status === 'active').length };
}

export function canUseInsurance(userId: string): { canUse: boolean; reason: string } {
  const count = getAvailableInsuranceCount(userId);
  return count <= 0 ? { canUse: false, reason: 'No insurance available' } : { canUse: true, reason: '' };
}

export function useInsurance(userId: string, _context: string): { success: boolean; remainingInsurance: number; error?: string } {
  const items = insuranceStore.get(userId) ?? [];
  const activeItem = items.find((i) => i.status === 'active');
  if (!activeItem) { return { success: false, remainingInsurance: 0, error: 'No active insurance available' }; }
  activeItem.status = 'used';
  const remaining = items.filter((i) => i.status === 'active').length;
  eventBus.publish('streak:insurance_used', { userId, insuranceId: activeItem.id, streakDays: 0, source: activeItem.source });
  return { success: true, remainingInsurance: remaining };
}

// ============================================================================
// Streak Recovery System
// ============================================================================

const recoveryPlans = new Map<string, StreakRecoveryPlan>();

export function createRecoveryPlan(userId: string, daysLost: number, _xpAtRisk: number): StreakRecoveryPlan {
  let sessionsRequired = 1;
  if (daysLost >= 7 && daysLost <= 14) { sessionsRequired = 2; }
  else if (daysLost > 14) { sessionsRequired = 3; }
  const plan: StreakRecoveryPlan = {
    userId, daysLost, sessionsRequired, currentProgress: 0, completed: false,
    reward: { type: 'XP', value: Math.max(100, daysLost * 50) },
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    previousStreak: daysLost, isRecovering: true,
  };
  recoveryPlans.set(userId, plan);
  eventBus.publish('streak:recovery_plan_created', { userId, planId: userId });
  return plan;
}

export function getRecoveryPlan(userId: string): StreakRecoveryPlan | null {
  const plan = recoveryPlans.get(userId);
  if (!plan) { return null; }
  if (plan.expiresAt < Date.now()) { recoveryPlans.delete(userId); return null; }
  return plan;
}

export function progressRecovery(userId: string, _eventType: string): { progressed: boolean; currentProgress: number } {
  const plan = recoveryPlans.get(userId);
  if (!plan) { return { progressed: false, currentProgress: 0 }; }
  plan.currentProgress += 1;
  if (plan.currentProgress >= plan.sessionsRequired) { plan.completed = true; plan.isRecovering = false; }
  return { progressed: true, currentProgress: plan.currentProgress };
}

export function clearRecoveryPlan(userId: string): void {
  recoveryPlans.delete(userId);
}
