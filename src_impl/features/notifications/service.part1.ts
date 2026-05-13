import { z } from "zod";
import { eventBus } from "../../events";
import { MMKVStorageAdapter } from "../../persistence/MMKVStorageAdapter";
import * as repository from "./repository";


export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const validatedUserId = UserIdSchema.parse(userId);
  const count = await repository.fetchUnreadNotificationsCount(validatedUserId);
  return UnreadNotificationsCountSchema.parse(count);
}

export function isQuietHours(userTimezone: string = 'UTC', quietStart: number = DEFAULT_QUIET_START_HOUR, quietEnd: number = DEFAULT_QUIET_END_HOUR): boolean {
  const now = new Date();
  const userTime = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
  const hour = userTime.getHours();

  if (quietStart <= quietEnd) {
    return hour >= quietStart && hour < quietEnd;
  }
  // Overnight quiet hours (e.g., 22:00 - 08:00)
  return hour >= quietStart || hour < quietEnd;
}

export function getNextNotificationWindow(userTimezone: string = 'UTC', quietEnd: number = DEFAULT_QUIET_END_HOUR): Date {
  const now = new Date();
  const userTime = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));

  const nextWindow = new Date(userTime);
  nextWindow.setHours(quietEnd, 0, 0, 0);

  if (userTime.getHours() >= quietEnd) {
    nextWindow.setDate(nextWindow.getDate() + 1);
  }

  return nextWindow;
}

export function shouldNotifyStreakAtRisk(context: NotificationContext): {
  shouldSend: boolean;
  priority: number;
  message: { title: string; body: string };
} {
  const { streakRisk } = context;

  if (!streakRisk || streakRisk.hoursRemaining > 12) {
    return { shouldSend: false, priority: 0, message: { title: '', body: '' } };
  }

  const urgency = streakRisk.riskLevel === 'CRITICAL' ? '🚨 LAST CHANCE' : streakRisk.riskLevel === 'HIGH' ? '⚠️ Streak at Risk' : '⏰ Streak Warning';

  return {
    shouldSend: true,
    priority: streakRisk.riskLevel === 'CRITICAL' ? 10 : 8,
    message: {
      title: urgency,
      body: `Your 🔥 ${streakRisk.streakDays}-day streak ends in ${streakRisk.hoursRemaining} hours! Start a session now.`,
    },
  };
}

export function shouldNotifyBossEscape(context: NotificationContext): {
  shouldSend: boolean;
  priority: number;
  message: { title: string; body: string };
} {
  const { bossEscape } = context;

  if (!bossEscape || bossEscape.hoursRemaining > 4) {
    return { shouldSend: false, priority: 0, message: { title: '', body: '' } };
  }

  return {
    shouldSend: true,
    priority: 9,
    message: {
      title: '👹 Boss Escaping Soon!',
      body: `${bossEscape.bossName} has ${bossEscape.healthPercent.toFixed(0)}% health and escapes in ${bossEscape.hoursRemaining}h! Defeat them now!`,
    },
  };
}

export function shouldNotifySquadStreakAtRisk(context: NotificationContext): {
  shouldSend: boolean;
  priority: number;
  message: { title: string; body: string };
} {
  const { squadStreak } = context;

  if (!squadStreak) {
    return { shouldSend: false, priority: 0, message: { title: '', body: '' } };
  }

  return {
    shouldSend: true,
    priority: 7,
    message: {
      title: '🔥 Squad Streak at Risk!',
      body: `${squadStreak.atRiskMemberName} hasn't focused today — your ${squadStreak.streakDays}-day squad streak is at risk!`,
    },
  };
}

export function shouldNotifyRivalAhead(context: NotificationContext): {
  shouldSend: boolean;
  priority: number;
  message: { title: string; body: string };
} {
  const { rivalUpdate } = context;

  if (!rivalUpdate || rivalUpdate.myScore >= rivalUpdate.theirScore) {
    return { shouldSend: false, priority: 0, message: { title: '', body: '' } };
  }

  const diff = rivalUpdate.theirScore - rivalUpdate.myScore;

  return {
    shouldSend: true,
    priority: 6,
    message: {
      title: '⚔️ Rival Alert!',
      body: `${rivalUpdate.rivalName} just focused for ${rivalUpdate.theirNewSessionMinutes} min. You're ${diff} min behind this week!`,
    },
  };
}

export function shouldNotifyChestFull(context: NotificationContext): {
  shouldSend: boolean;
  priority: number;
  message: { title: string; body: string };
} {
  const { chestStatus } = context;

  if (!chestStatus || chestStatus.unopenedCount < chestStatus.maxCapacity) {
    return { shouldSend: false, priority: 0, message: { title: '', body: '' } };
  }

  return {
    shouldSend: true,
    priority: 5,
    message: {
      title: '🎁 Chests Full!',
      body: `Your chest inventory is full (${chestStatus.unopenedCount}/${chestStatus.maxCapacity}). Open one to make room for more!`,
    },
  };
}

export function shouldNotifyChallengeExpiring(context: NotificationContext): {
  shouldSend: boolean;
  priority: number;
  message: { title: string; body: string };
} {
  const { challengeExpiry } = context;

  if (!challengeExpiry || challengeExpiry.hoursRemaining > 2 || challengeExpiry.progressPercent >= 50) {
    return { shouldSend: false, priority: 0, message: { title: '', body: '' } };
  }

  return {
    shouldSend: true,
    priority: 4,
    message: {
      title: '⏰ Challenge Ending!',
      body: `"${challengeExpiry.challengeName}" expires in ${challengeExpiry.hoursRemaining}h and you're only ${challengeExpiry.progressPercent}% complete!`,
    },
  };
}