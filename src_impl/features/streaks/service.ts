/**
 * Streaks Service
 * Business logic for streak management
 *
 * Dependencies:
 * - Sessions (qualifying sessions increment streaks)
 * - Rewards (streak milestone rewards)
 * - Progression (streak XP bonuses)
 */

import { v4 } from '../../utils/uuid';
import * as repository from './repository';
import { hasUsedStreakRestoreThisMonth } from './restore-quest';
import { RecordSessionInputSchema, UseShieldInputSchema, FreezeStreakInputSchema, RestoreStreakInputSchema, ComebackStateSchema, type Streak, type StreakSummary, type StreakMilestone, type StreakEngineResult, type RecordSessionInput, type UseShieldInput, type RestoreStreakInput, type ComebackState, type RiskLevel } from './schemas';

// ============================================================================
// Constants
// ============================================================================

const QUALIFYING_SESSION_MIN_DURATION = 10 * 60; // 10 minutes in seconds - lowered for better D1 retention
const QUALIFYING_SESSION_MIN_QUALITY = 50; // 0-100
const STREAK_WINDOW_HOURS = 24; // Hours to maintain streak - CRITICAL: 24h creates daily urgency, 48h kills retention
const MILESTONE_DAYS = [3, 7, 14, 30, 60, 100, 180, 365];

const MILESTONE_REWARDS: Record<number, Partial<StreakMilestone>> = {
  3: { rewardType: 'COINS', rewardAmount: 100, badgeId: 'streak-3' },
  7: { rewardType: 'COINS', rewardAmount: 250, badgeId: 'streak-7' },
  14: { rewardType: 'GEMS', rewardAmount: 25, badgeId: 'streak-14' },
  30: { rewardType: 'STREAK_SHIELD', rewardAmount: 1, badgeId: 'streak-30' },
  60: { rewardType: 'GEMS', rewardAmount: 100, badgeId: 'streak-60' },
  100: { rewardType: 'GEMS', rewardAmount: 250, badgeId: 'streak-100' },
  180: { rewardType: 'GEMS', rewardAmount: 500, badgeId: 'streak-180' },
  365: { rewardType: 'GEMS', rewardAmount: 1000, badgeId: 'streak-365' },
};

// ============================================================================
// Streak State Management
// ============================================================================
// ============================================================================
// Streak Engine
// ============================================================================
// ============================================================================
// Streak Protection
// ============================================================================

async function applyShieldInternal(userId: string, streak: Streak): Promise<void> {
  const shieldId = await repository.getAvailableShield(userId);
  if (shieldId) {
    await repository.recordShieldUsed(userId, shieldId);
    await repository.updateStreak(userId, {
      shieldsAvailable: streak.shieldsAvailable - 1,
      gracePeriodUsed: true,
    });
  }
}

// ============================================================================
// Streak Recovery
// ============================================================================
// ============================================================================
// Comeback Detection
// ============================================================================
// ============================================================================
// Risk Calculation
// ============================================================================

function calculateNextDeadline(streak: Streak): number | null {
  if (streak.currentDays === 0 || !streak.lastQualifyingSessionAt) {
    return null;
  }
  return streak.lastQualifyingSessionAt + STREAK_WINDOW_HOURS * 60 * 60 * 1000;
}

// ============================================================================
// Multiplier Calculation
// ============================================================================

function getComebackMultiplier(daysAbsent: number): number {
  if (daysAbsent >= 30) {
    return 3.0;
  }
  if (daysAbsent >= 7) {
    return 2.0;
  }
  if (daysAbsent >= 3) {
    return 1.5;
  }
  return 1.0;
}

function getComebackMessage(daysAbsent: number, _streakBefore: number): string {
  if (daysAbsent >= 30) {
    return "A legendary return. Let's rebuild something great.";
  }
  if (daysAbsent >= 7) {
    return "It's been a while, but your focus potential hasn't gone anywhere.";
  }
  if (daysAbsent >= 3) {
    return `Welcome back! You were gone ${daysAbsent} days. Pick up where you left off.`;
  }
  return 'Ready when you are.';
}

export async function disableProtectionForUsers(userIds: string[], expiresAt: number): Promise<void> {
  for (const userId of userIds) {
    await repository.updateStreak(userId, {
      protectionDisabledUntil: expiresAt,
    });
  }
}


export * from "./service.part1";
export * from "./service.part2";
