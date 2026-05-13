import { z } from "zod";
import { eventBus } from "../../events";
import { MMKVStorageAdapter } from "../../persistence/MMKVStorageAdapter";
import * as repository from "./repository";


export function shouldNotifySeasonEnding(context: NotificationContext): {
  shouldSend: boolean;
  priority: number;
  message: { title: string; body: string };
} {
  const { seasonEnding } = context;

  if (!seasonEnding || seasonEnding.hoursRemaining > 24 || seasonEnding.unclaimedTiers === 0) {
    return { shouldSend: false, priority: 0, message: { title: '', body: '' } };
  }

  return {
    shouldSend: true,
    priority: 8,
    message: {
      title: '🌙 Season Ending!',
      body: `Season ends in ${Math.floor(seasonEnding.hoursRemaining)} hours! You have ${seasonEnding.unclaimedTiers} unclaimed reward tiers!`,
    },
  };
}

export function createRivalSessionNotification(rivalName: string, sessionMinutes: number, currentDiff: number): { title: string; body: string } {
  const diffText = currentDiff === 0 ? "You're tied now!" : currentDiff > 0 ? `Still ahead by ${currentDiff} min` : `${Math.abs(currentDiff)} min behind`;

  return {
    title: `${rivalName} just focused for ${sessionMinutes} min`,
    body: `${diffText} — start a session to stay in the lead!`,
  };
}

export function createSquadNudgeNotification(nudgerName: string, squadName: string, squadStreak: number): { title: string; body: string } {
  return {
    title: `⚡ ${nudgerName} nudged you!`,
    body: `From ${squadName}: Your squad's ${squadStreak}-day streak depends on you. Start a quick session?`,
  };
}

export function createSquadMilestoneNotification(squadName: string, milestoneDays: number, bonusXp: number): { title: string; body: string } {
  return {
    title: `🔥 ${squadName} Milestone!`,
    body: `Your squad hit a ${milestoneDays}-day streak! You all earned a ${bonusXp} XP bonus!`,
  };
}

export function createFeedReactionNotification(reactorName: string, reactionEmoji: string, postTitle: string): { title: string; body: string } {
  return {
    title: `${reactorName} reacted ${reactionEmoji}`,
    body: `To your post: "${postTitle.substring(0, 50)}${postTitle.length > 50 ? '...' : ''}"`,
  };
}

export function evaluateNotificationRules(context: NotificationContext): {
  shouldSend: boolean;
  notification?: { title: string; body: string; priority: number };
} {
  const rules = [shouldNotifyStreakAtRisk(context), shouldNotifyBossEscape(context), shouldNotifySquadStreakAtRisk(context), shouldNotifyRivalAhead(context), shouldNotifyChestFull(context), shouldNotifyChallengeExpiring(context), shouldNotifySeasonEnding(context)];

  // Filter to only sendable notifications
  const sendable = rules.filter((r) => r.shouldSend);

  if (sendable.length === 0) {
    return { shouldSend: false };
  }

  // Sort by priority descending
  sendable.sort((a, b) => b.priority - a.priority);

  // Return highest priority
  const top = sendable[0];
  return {
    shouldSend: true,
    notification: {
      ...top.message,
      priority: top.priority,
    },
  };
}

export function checkDailyNotificationLimit(userId: string): {
  canSend: boolean;
  remaining: number;
} {
  const key = `notifications:${userId}:${new Date().toDateString()}`;
  const raw = notificationLimitStorage.getItemSync(key);
  const count = raw ? Number.parseInt(raw, 10) : 0;
  const safeCount = Number.isFinite(count) ? count : 0;

  return {
    canSend: safeCount < MAX_NOTIFICATIONS_PER_DAY,
    remaining: Math.max(0, MAX_NOTIFICATIONS_PER_DAY - safeCount),
  };
}

export function recordNotificationSent(userId: string): void {
  const key = `notifications:${userId}:${new Date().toDateString()}`;
  const raw = notificationLimitStorage.getItemSync(key);
  const count = raw ? Number.parseInt(raw, 10) : 0;
  const safeCount = Number.isFinite(count) ? count : 0;
  notificationLimitStorage.setItemSync(key, String(safeCount + 1));
}

export async function dispatchUrgencyNotification(context: NotificationContext, userTimezone: string = 'UTC', quietStart: number = DEFAULT_QUIET_START_HOUR, quietEnd: number = DEFAULT_QUIET_END_HOUR): Promise<{ sent: boolean; reason?: string; deferred?: boolean; nextWindow?: Date }> {
  // Check quiet hours
  if (isQuietHours(userTimezone, quietStart, quietEnd)) {
    return {
      sent: false,
      reason: 'quiet_hours',
      deferred: true,
      nextWindow: getNextNotificationWindow(userTimezone, quietEnd),
    };
  }

  // Check daily limit
  const limit = checkDailyNotificationLimit(context.userId);
  if (!limit.canSend) {
    return { sent: false, reason: 'daily_limit_reached' };
  }

  // Evaluate rules
  const evaluation = evaluateNotificationRules(context);
  if (!evaluation.shouldSend) {
    return { sent: false, reason: 'no_urgent_context' };
  }

  eventBus.publish('notification:send', {
    userId: context.userId,
    type: 'URGENCY',
    title: evaluation.notification?.title ?? 'VEX',
    body: evaluation.notification?.body ?? 'You have an update waiting.',
    priority: 'high',
  });

  // Record sent
  recordNotificationSent(context.userId);

  return { sent: true };
}