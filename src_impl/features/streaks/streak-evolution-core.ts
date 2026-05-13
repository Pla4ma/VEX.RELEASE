import { eventBus } from '../../events';

export type StreakState = 'ACTIVE' | 'AT_RISK' | 'CRITICAL' | 'BROKEN' | 'RECOVERING' | 'PROTECTED';

export interface StreakStateInfo {
  state: StreakState;
  label: string;
  description: string;
  color: string;
  icon: string;
  animation: string;
  urgency: 'none' | 'low' | 'medium' | 'high' | 'critical';
  coachMessage: string;
  entryThreshold?: number;
  exitThreshold?: number;
}

export const STREAK_STATES: Record<StreakState, StreakStateInfo> = {
  ACTIVE: {
    state: 'ACTIVE', label: 'Active', description: 'Your streak is safe and growing',
    color: 'theme.colors.primary[500]', icon: '🔥', animation: 'glow', urgency: 'none',
    coachMessage: 'Your streak is building momentum. Keep it going!',
  },
  AT_RISK: {
    state: 'AT_RISK', label: 'At Risk', description: 'Complete a session today to protect your streak',
    color: 'theme.colors.primary[500]', icon: '⚠️', animation: 'pulse', urgency: 'medium',
    coachMessage: 'Your streak needs attention soon. One quick session keeps it alive.',
    entryThreshold: 20, exitThreshold: 4,
  },
  CRITICAL: {
    state: 'CRITICAL', label: 'Critical', description: 'URGENT: Less than 1 hour remaining',
    color: 'theme.colors.primary[500]', icon: '🚨', animation: 'shake', urgency: 'critical',
    coachMessage: 'CRITICAL: Your streak breaks soon. Start a session NOW.',
    entryThreshold: 4, exitThreshold: 0,
  },
  BROKEN: {
    state: 'BROKEN', label: 'Broken', description: 'Your streak has ended. Time for a comeback!',
    color: 'theme.colors.primary[500]', icon: '💔', animation: 'none', urgency: 'low',
    coachMessage: "Streaks break. What matters is coming back. Let's restart together.",
  },
  RECOVERING: {
    state: 'RECOVERING', label: 'Recovering', description: 'Working to rebuild your streak',
    color: 'theme.colors.primary[500]', icon: '🌱', animation: 'pulse', urgency: 'low',
    coachMessage: 'Welcome back! Each session rebuilds your momentum.',
  },
  PROTECTED: {
    state: 'PROTECTED', label: 'Protected', description: 'Insurance used - streak maintained',
    color: 'theme.colors.primary[500]', icon: '🛡️', animation: 'shield', urgency: 'none',
    coachMessage: 'Your streak was protected by insurance. Ready to continue?',
  },
};

export function determineStreakState(streakDays: number, hasInsurance: boolean, hoursRemaining: number | null): StreakState {
  if (hasInsurance) { return 'PROTECTED'; }
  if (hoursRemaining === null || hoursRemaining <= 0) { return 'BROKEN'; }
  if (streakDays === 0) { return 'RECOVERING'; }
  if (hoursRemaining <= 20) { return 'AT_RISK'; }
  return 'ACTIVE';
}

export function calculateHoursUntilStreakBreak(currentTime: number = Date.now()): number {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const hours = (endOfToday.getTime() - currentTime) / (1000 * 60 * 60);
  return Math.max(0, hours);
}

export function getStreakStateInfo(state: StreakState): StreakStateInfo {
  return STREAK_STATES[state] ?? {
    state, label: 'Unknown', description: 'Unknown state',
    color: 'theme.colors.primary[500]', icon: '❓', animation: 'none', urgency: 'none', coachMessage: '',
  };
}

export function getStreakVisualIndicator(state: StreakState, streakDays: number): { type: string; intensity: number; animation: string } {
  const intensityMap: Record<StreakState, number> = {
    ACTIVE: Math.min(1, 0.3 + streakDays * 0.05), AT_RISK: 0.6, CRITICAL: 1.0,
    BROKEN: 0, RECOVERING: 0.3, PROTECTED: 0.8,
  };
  switch (state) {
    case 'ACTIVE': return { type: 'flame', intensity: intensityMap.ACTIVE, animation: streakDays >= 7 ? 'milestone-glow' : 'glow' };
    case 'AT_RISK': return { type: 'pulse', intensity: 0.6, animation: 'warning-pulse' };
    case 'CRITICAL': return { type: 'critical', intensity: 1.0, animation: 'shake' };
    case 'BROKEN': return { type: 'broken', intensity: 0, animation: 'none' };
    case 'RECOVERING': return { type: 'recover', intensity: 0.3, animation: 'gentle-pulse' };
    case 'PROTECTED': return { type: 'shield', intensity: 0.8, animation: 'shield' };
    default: return { type: 'flame', intensity: 0, animation: 'none' };
  }
}

export function getStreakDisplayText(streakDays: number): string {
  return `${streakDays} Day${streakDays === 1 ? '' : 's'}`;
}

export function getStreakCelebrationMessage(streakDays: number): string {
  if (streakDays === 1) { return 'Day 1! Your streak begins.'; }
  if (streakDays === 3) { return '3 days! Building momentum.'; }
  if (streakDays === 7) { return 'Week Warrior! 7 days strong.'; }
  if (streakDays === 14) { return 'Fortnight Focused! 14 days!'; }
  if (streakDays === 30) { return 'Monthly Master! Incredible dedication.'; }
  if (streakDays === 100) { return 'Century Club! You are legendary.'; }
  return `${streakDays} days! Keep it going!`;
}
