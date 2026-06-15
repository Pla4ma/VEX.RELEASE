import { eventBus } from '../../events/EventBus';
import type { InsuranceItem } from './types';

const MAX_INSURANCE = 3;

const insuranceStore = new Map<string, InsuranceItem[]>();

export function awardInsurance(
  userId: string,
  source: string,
  count: number,
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

export function getUserInsurance(
  userId: string,
): { insurances: InsuranceItem[]; totalAvailable: number } | null {
  const items = insuranceStore.get(userId);
  if (!items || items.length === 0) {
    return insuranceStore.has(userId)
      ? { insurances: [], totalAvailable: 0 }
      : null;
  }
  return {
    insurances: [...items],
    totalAvailable: items.filter((i) => i.status === 'active').length,
  };
}

export function canUseInsurance(userId: string): {
  canUse: boolean;
  reason: string;
} {
  const count = getAvailableInsuranceCount(userId);
  if (count <= 0) {
    return { canUse: false, reason: 'No insurance available' };
  }
  return { canUse: true, reason: '' };
}

export function useInsurance(
  userId: string,
  _context: string,
): { success: boolean; remainingInsurance: number; error?: string } {
  const items = insuranceStore.get(userId) ?? [];
  const activeItem = items.find((i) => i.status === 'active');
  if (!activeItem) {
    return {
      success: false,
      remainingInsurance: 0,
      error: 'No active insurance available',
    };
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
