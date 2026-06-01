import { STREAK_STATES } from './constants';
import type { StreakState, StreakStateInfo } from './types';

export function determineStreakState(
  streakDays: number,
  hasInsurance: boolean,
  hoursRemaining: number | null,
): StreakState {
  if (hasInsurance) {
    return 'PROTECTED';
  }
  if (hoursRemaining === null || hoursRemaining <= 0) {
    return 'BROKEN';
  }
  if (streakDays === 0) {
    return 'RECOVERING';
  }
  if (hoursRemaining <= 20) {
    return 'AT_RISK';
  }
  return 'ACTIVE';
}

export function calculateHoursUntilStreakBreak(
  currentTime: number = Date.now(),
): number {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const hours = (endOfToday.getTime() - currentTime) / (1000 * 60 * 60);
  return Math.max(0, hours);
}

export function getStreakStateInfo(state: StreakState): StreakStateInfo {
  return (
    STREAK_STATES[state] ?? {
      state: state,
      label: 'Unknown',
      description: 'Unknown state',
      color: '#718096',
      icon: '',
      animation: 'none',
      urgency: 'none',
      coachMessage: '',
    }
  );
}

export function getStreakVisualIndicator(
  state: StreakState,
  streakDays: number,
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
      return {
        type: 'flame',
        intensity: intensityMap.ACTIVE,
        animation: streakDays >= 7 ? 'milestone-glow' : 'glow',
      };
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
