import type { Streak, StreakMilestone } from "./schemas";
import { v4 } from "../../utils/uuid";

export const QUALIFYING_SESSION_MIN_DURATION = 10 * 60; 
export const QUALIFYING_SESSION_MIN_QUALITY = 50; 
export const STREAK_WINDOW_HOURS = 24; 
export const MILESTONE_DAYS = [3, 7, 14, 30, 60, 100, 180, 365];

export const MILESTONE_REWARDS: Record<number, Partial<StreakMilestone>> = {
  3: { rewardType: 'COINS', rewardAmount: 100, badgeId: 'streak-3' },
  7: { rewardType: 'COINS', rewardAmount: 250, badgeId: 'streak-7' },
  14: { rewardType: 'GEMS', rewardAmount: 25, badgeId: 'streak-14' },
  30: { rewardType: 'STREAK_SHIELD', rewardAmount: 1, badgeId: 'streak-30' },
  60: { rewardType: 'GEMS', rewardAmount: 100, badgeId: 'streak-60' },
  100: { rewardType: 'GEMS', rewardAmount: 250, badgeId: 'streak-100' },
  180: { rewardType: 'GEMS', rewardAmount: 500, badgeId: 'streak-180' },
  365: { rewardType: 'GEMS', rewardAmount: 1000, badgeId: 'streak-365' },
};

export function calculateNextDeadline(streak: Streak): number | null {
  if (streak.currentDays === 0 || !streak.lastQualifyingSessionAt) {
    return null;
  }
  return streak.lastQualifyingSessionAt + STREAK_WINDOW_HOURS * 60 * 60 * 1000;
}

export function getComebackMultiplier(daysAbsent: number): number {
  if (daysAbsent >= 30) return 3.0;
  if (daysAbsent >= 7) return 2.0;
  if (daysAbsent >= 3) return 1.5;
  return 1.0;
}

export function getComebackMessage(daysAbsent: number, _streakBefore: number): string {
  if (daysAbsent >= 30) return "A legendary return. Let's rebuild something great.";
  if (daysAbsent >= 7) return "It's been a while, but your focus potential hasn't gone anywhere.";
  if (daysAbsent >= 3) return `Welcome back! You were gone ${daysAbsent} days. Pick up where you left off.`;
  return 'Ready when you are.';
}
