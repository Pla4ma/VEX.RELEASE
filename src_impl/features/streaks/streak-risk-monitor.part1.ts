import { eventBus } from "../../events";
import { createDebugger } from "../../utils/debug";
import * as repository from "./repository";
import type { Streak, RiskLevel } from "./schemas";


export function calculateStreakRisk(streak: Streak, now: number = Date.now()): StreakRiskStatus {
  if (!streak.lastQualifyingSessionAt || streak.currentDays === 0) {
    return {
      userId: streak.userId,
      currentDays: streak.currentDays,
      hoursRemaining: 24,
      minutesRemaining: 24 * 60,
      riskLevel: 'NONE',
      flameHealthPercent: 100,
      isAtRisk: false,
      isCritical: false,
      notificationsSent: [],
    };
  }

  const deadline = streak.lastQualifyingSessionAt + 24 * 60 * 60 * 1000; // 24 hours
  const remainingMs = deadline - now;
  const remainingHours = remainingMs / (60 * 60 * 1000);
  const remainingMinutes = remainingMs / (60 * 1000);

  let riskLevel: RiskLevel = 'NONE';
  let isAtRisk = false;
  let isCritical = false;

  if (remainingHours <= 0) {
    riskLevel = 'CRITICAL';
    isAtRisk = true;
    isCritical = true;
  } else if (remainingHours <= 1) {
    riskLevel = 'CRITICAL';
    isAtRisk = true;
    isCritical = true;
  } else if (remainingHours <= 4) {
    riskLevel = 'HIGH';
    isAtRisk = true;
  } else if (remainingHours <= 8) {
    riskLevel = 'MEDIUM';
    isAtRisk = true;
  } else if (remainingHours <= 12) {
    riskLevel = 'LOW';
  }

  // Flame health depletes linearly over 24 hours (100% → 0%)
  const flameHealthPercent = Math.max(0, Math.min(100, (remainingHours / 24) * 100));

  return {
    userId: streak.userId,
    currentDays: streak.currentDays,
    hoursRemaining: Math.max(0, remainingHours),
    minutesRemaining: Math.max(0, remainingMinutes),
    riskLevel,
    flameHealthPercent,
    isAtRisk,
    isCritical,
    notificationsSent: [], // Will be populated from stored state
  };
}

export async function checkAndSendRiskNotifications(userId: string): Promise<void> {
  const streak = await repository.fetchStreak(userId);
  if (!streak || streak.currentDays === 0) {return;}

  const riskStatus = calculateStreakRisk(streak);

  if (!riskStatus.isAtRisk) {return;}

  // Check which notification thresholds should trigger
  for (const threshold of NOTIFICATION_THRESHOLDS) {
    if (riskStatus.hoursRemaining <= threshold.hoursRemaining &&
        riskStatus.hoursRemaining > threshold.hoursRemaining - 0.5) {
      // Trigger notification
      eventBus.publish('notification:send', {
        userId,
        type: 'STREAK_AT_RISK',
        title: `${streak.currentDays}-day streak within reach`,
        body: threshold.message,
        data: {
          streakDays: streak.currentDays,
          hoursRemaining: riskStatus.hoursRemaining,
          urgency: threshold.urgency,
          action: 'START_SESSION',
        },
        priority: threshold.urgency === 'CRITICAL' ? 'high' : 'normal',
      });
    }
  }

  // Publish risk status update for UI
  eventBus.publish('streak:risk_updated', riskStatus);
}

export async function checkAllStreaksAtRisk(): Promise<StreakRiskStatus[]> {
  const atRiskUsers = await repository.fetchUsersWithActiveStreaks();
  const riskStatuses: StreakRiskStatus[] = [];

  for (const userId of atRiskUsers) {
    try {
      await checkAndSendRiskNotifications(userId);
      const streak = await repository.fetchStreak(userId);
      if (streak) {
        riskStatuses.push(calculateStreakRisk(streak));
      }
    } catch (error) {
      debug.error(
        `Failed to check streak risk for user ${userId}`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  return riskStatuses;
}

export async function processStreakBreaks(): Promise<string[]> {
  const brokenStreaks: string[] = [];
  const activeUsers = await repository.fetchUsersWithActiveStreaks();
  const now = Date.now();

  for (const userId of activeUsers) {
    const streak = await repository.fetchStreak(userId);
    if (!streak || !streak.lastQualifyingSessionAt) {continue;}

    const deadline = streak.lastQualifyingSessionAt + 24 * 60 * 60 * 1000;

    if (now > deadline) {
      // Streak has expired - break it
      await breakStreakInternal(userId, streak);
      brokenStreaks.push(userId);
    }
  }

  return brokenStreaks;
}