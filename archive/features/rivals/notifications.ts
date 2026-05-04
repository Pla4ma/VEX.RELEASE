/**
 * Rivals Notification System
 *
 * Handles "Rival just focused" notifications with rate limiting.
 * Max 3 notifications per day per rival to prevent spam.
 * User settings control (on by default, can disable).
 *
 * @phase 7
 */

import { z } from 'zod';
import { eventBus } from '../../events';
import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { createDebugger } from '../../utils/debug';
import * as repository from './repository';
import { getRivalAheadNotification } from './service';

const debug = createDebugger('rivals:notifications');

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

/** Maximum rival notifications per day per rival */
const MAX_RIVAL_NOTIFICATIONS_PER_DAY = 3;

/** Cooldown between notifications from the same rival (4 hours) */
const RIVAL_NOTIFICATION_COOLDOWN_MS = 4 * 60 * 60 * 1000;

/** Store key prefix for tracking sent notifications */
const NOTIFICATION_TRACKING_KEY = 'rival-notifications-sent';

// ============================================================================
// Types
// ============================================================================

export interface RivalNotificationSettings {
  /** Master toggle for all rival notifications */
  enabled: boolean;
  /** Max notifications per day per rival (default: 3) */
  maxPerDay: number;
  /** Only notify when rival pulls ahead (default: false - notify on any session) */
  onlyWhenAhead: boolean;
  /** Quiet hours start (24h format, default: 22 = 10 PM) */
  quietStartHour: number;
  /** Quiet hours end (24h format, default: 8 = 8 AM) */
  quietEndHour: number;
}

interface SentNotification {
  rivalId: string;
  timestamp: number;
  sessionMinutes: number;
}

interface NotificationTracking {
  sent: SentNotification[];
  lastCleanup: number;
}

const RivalNotificationSettingsSchema = z.object({
  enabled: z.boolean(),
  maxPerDay: z.number().int().positive(),
  onlyWhenAhead: z.boolean(),
  quietStartHour: z.number().int().min(0).max(23),
  quietEndHour: z.number().int().min(0).max(23),
});

const NotificationTrackingSchema = z.object({
  sent: z.array(
    z.object({
      rivalId: z.string().min(1),
      timestamp: z.number().nonnegative(),
      sessionMinutes: z.number().nonnegative(),
    })
  ),
  lastCleanup: z.number().nonnegative(),
});

function getSettingsKey(userId: string): string {
  return `${NOTIFICATION_TRACKING_KEY}:settings:${userId}`;
}

// ============================================================================
// Settings Management
// ============================================================================

/** Default notification settings */
export const DEFAULT_RIVAL_NOTIFICATION_SETTINGS: RivalNotificationSettings = {
  enabled: true,
  maxPerDay: MAX_RIVAL_NOTIFICATIONS_PER_DAY,
  onlyWhenAhead: false,
  quietStartHour: 22,
  quietEndHour: 8,
};

export async function getRivalNotificationSettings(
  userId: string
): Promise<RivalNotificationSettings> {
  const raw = await getMMKVStorageAdapter().getItem(getSettingsKey(userId));

  if (!raw) {
    return DEFAULT_RIVAL_NOTIFICATION_SETTINGS;
  }

  const parsed = RivalNotificationSettingsSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    debug.warn('Invalid rival notification settings were reset for user %s', userId);
    return DEFAULT_RIVAL_NOTIFICATION_SETTINGS;
  }

  return parsed.data;
}

/**
 * Update user's rival notification settings
 */
export async function updateRivalNotificationSettings(
  userId: string,
  settings: Partial<RivalNotificationSettings>
): Promise<void> {
  const current = await getRivalNotificationSettings(userId);
  const next = RivalNotificationSettingsSchema.parse({ ...current, ...settings });
  await getMMKVStorageAdapter().setItem(getSettingsKey(userId), JSON.stringify(next));
}

/**
 * Check if rival notifications are enabled for user
 */
export async function areRivalNotificationsEnabled(userId: string): Promise<boolean> {
  const settings = await getRivalNotificationSettings(userId);
  return settings.enabled;
}

// ============================================================================
// Rate Limiting
// ============================================================================

async function getNotificationTracking(): Promise<NotificationTracking> {
  try {
    const raw = await getMMKVStorageAdapter().getItem(NOTIFICATION_TRACKING_KEY);
    if (!raw) {
      return { sent: [], lastCleanup: Date.now() };
    }

    const parsed = NotificationTrackingSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      debug.warn('Invalid rival notification tracking payload was reset');
      return { sent: [], lastCleanup: Date.now() };
    }

    return parsed.data;
  } catch (error) {
    debug.warn('Failed to read rival notification tracking', error);
    return { sent: [], lastCleanup: Date.now() };
  }
}

/**
 * Save tracking data to storage
 */
async function saveNotificationTracking(tracking: NotificationTracking): Promise<void> {
  try {
    const next = NotificationTrackingSchema.parse(tracking);
    await getMMKVStorageAdapter().setItem(NOTIFICATION_TRACKING_KEY, JSON.stringify(next));
  } catch (error) {
    debug.error('Failed to save notification tracking', error as Error);
  }
}

/**
 * Clean up old notification records (older than 24 hours)
 */
function cleanupOldNotifications(
  tracking: NotificationTracking,
  cutoffTime: number = Date.now() - 24 * 60 * 60 * 1000
): NotificationTracking {
  const filtered = tracking.sent.filter((n) => n.timestamp > cutoffTime);
  return {
    sent: filtered,
    lastCleanup: Date.now(),
  };
}

/**
 * Check if we should send a notification based on rate limits
 */
async function shouldSendNotification(
  userId: string,
  rivalId: string,
  settings: RivalNotificationSettings
): Promise<{ allowed: boolean; reason?: string }> {
  // Check if notifications are enabled
  if (!settings.enabled) {
    return { allowed: false, reason: 'Notifications disabled' };
  }

  // Check quiet hours
  const now = new Date();
  const currentHour = now.getHours();
  if (settings.quietStartHour <= settings.quietEndHour) {
    if (currentHour >= settings.quietStartHour && currentHour < settings.quietEndHour) {
      return { allowed: false, reason: 'Quiet hours' };
    }
  } else {
    // Overnight quiet hours (e.g., 22:00 - 08:00)
    if (currentHour >= settings.quietStartHour || currentHour < settings.quietEndHour) {
      return { allowed: false, reason: 'Quiet hours' };
    }
  }

  // Get tracking data
  let tracking = await getNotificationTracking();

  // Cleanup old notifications every hour
  if (Date.now() - tracking.lastCleanup > 60 * 60 * 1000) {
    tracking = cleanupOldNotifications(tracking);
  }

  // Filter to notifications for this rival today
  const rivalNotificationsToday = tracking.sent.filter(
    (n) => n.rivalId === rivalId && n.timestamp > Date.now() - 24 * 60 * 60 * 1000
  );

  // Check daily limit
  if (rivalNotificationsToday.length >= settings.maxPerDay) {
    return { allowed: false, reason: 'Daily limit reached' };
  }

  // Check cooldown (last notification from this rival)
  const lastNotification = rivalNotificationsToday[rivalNotificationsToday.length - 1];
  if (lastNotification && Date.now() - lastNotification.timestamp < RIVAL_NOTIFICATION_COOLDOWN_MS) {
    return { allowed: false, reason: 'Cooldown period' };
  }

  return { allowed: true };
}

/**
 * Record that we sent a notification
 */
async function recordNotification(
  rivalId: string,
  sessionMinutes: number
): Promise<void> {
  const tracking = await getNotificationTracking();
  tracking.sent.push({
    rivalId,
    timestamp: Date.now(),
    sessionMinutes,
  });
  await saveNotificationTracking(tracking);
}

// ============================================================================
// Notification Content
// ============================================================================

/**
 * Build rival notification content
 */
export function buildRivalNotification(
  rivalName: string,
  sessionMinutes: number,
  myScore: number,
  theirScore: number,
  isPullingAhead: boolean
): { title: string; body: string; priority: 'high' | 'normal' | 'low' } {
  const notification = getRivalAheadNotification(
    rivalName,
    sessionMinutes,
    myScore - theirScore
  );

  return {
    title: isPullingAhead ? `⚔️ ${rivalName} just focused!` : notification.title,
    body: notification.body,
    priority: isPullingAhead ? 'high' : 'normal',
  };
}

/**
 * Get detailed notification with context
 */
export function getDetailedRivalNotification(
  rivalName: string,
  sessionMinutes: number,
  myScore: number,
  theirScore: number,
  daysRemaining: number
): { title: string; body: string; action?: string } {
  const diff = theirScore - myScore;
  const iAmAhead = myScore > theirScore;

  if (diff > 0) {
    // Rival is ahead
    if (diff <= 15) {
      return {
        title: `⚔️ ${rivalName} is pulling ahead!`,
        body: `They just focused ${sessionMinutes} min and lead by ${diff} min. ${daysRemaining} days left to catch up!`,
        action: 'Start a session now',
      };
    } else if (diff <= 60) {
      return {
        title: `⚔️ ${rivalName} extends their lead`,
        body: `${rivalName} added ${sessionMinutes} min. You're ${diff} min behind with ${daysRemaining} days remaining.`,
        action: 'Focus to catch up',
      };
    } else {
      return {
        title: `⚔️ ${rivalName} is dominating`,
        body: `${rivalName} focused ${sessionMinutes} min more. Gap is ${diff} min — time to fight back!`,
        action: 'Don\'t give up!',
      };
    }
  } else if (iAmAhead) {
    // I'm still ahead
    const myLead = myScore - theirScore;
    return {
      title: `⚔️ ${rivalName} is chasing you`,
      body: `${rivalName} just did ${sessionMinutes} min but you still lead by ${myLead} min. Keep it up!`,
      action: 'Stay in the lead',
    };
  } else {
    // Tied
    return {
      title: `⚔️ It's a tie with ${rivalName}!`,
      body: `Both at ${myScore} min after their ${sessionMinutes} min session. One session could decide it!`,
      action: 'Break the tie',
    };
  }
}

// ============================================================================
// Main Notification Handler
// ============================================================================

/**
 * Handle rival session completion notification
 * Called when a rival completes a session
 *
 * @returns true if notification was sent, false otherwise
 */
export async function handleRivalSessionComplete(
  userId: string,
  rivalId: string,
  rivalName: string,
  sessionMinutes: number,
  myCurrentScore: number,
  theirCurrentScore: number,
  daysRemaining: number
): Promise<boolean> {
  try {
    // Get user settings
    const settings = await getRivalNotificationSettings(userId);

    // Check if we should send
    const { allowed, reason } = await shouldSendNotification(userId, rivalId, settings);

    if (!allowed) {
      debug.info('Blocked rival notification for %s: %s', rivalName, reason ?? 'unknown');
      return false;
    }

    // Check "only when ahead" setting
    const iAmBehind = myCurrentScore < theirCurrentScore;
    if (settings.onlyWhenAhead && !iAmBehind) {
      debug.info('Skipped rival notification because user is not behind');
      return false;
    }

    // Build notification content
    const notification = getDetailedRivalNotification(
      rivalName,
      sessionMinutes,
      myCurrentScore,
      theirCurrentScore,
      daysRemaining
    );

    eventBus.publish('notification:send', {
      userId,
      type: 'RIVAL_SESSION_COMPLETE',
      title: notification.title,
      body: notification.body,
      data: {
        type: 'RIVAL_SESSION_COMPLETE',
        rivalId,
        screen: 'Rivals',
      },
      priority: 'high',
    });

    // Record that we sent this notification
    await recordNotification(rivalId, sessionMinutes);

    return true;
  } catch (error) {
    debug.error('[RivalNotification] Error sending notification', error as Error);
    return false;
  }
}

/**
 * Check and notify for all rivals when a session completes
 * This would be called from the session completion flow
 */
export async function checkAndNotifyRivalsOnSessionComplete(
  userId: string,
  sessionMinutes: number
): Promise<void> {
  try {
    // Get current week start
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    // Find active rival relationship
    const relationship = await repository.getCurrentRival(userId, weekStart.getTime());

    if (!relationship) {
      return; // No active rival
    }

    // Determine if user is challenger or challenged
    const isChallenger = relationship.challengerId === userId;
    const rivalId = isChallenger ? relationship.challengedId : relationship.challengerId;

    // Get scores
    const myScore = isChallenger ? relationship.challengerScore : relationship.challengedScore;
    const theirScore = isChallenger ? relationship.challengedScore : relationship.challengerScore;

    // Calculate days remaining
    const daysRemaining = 7 - dayOfWeek || 7;

    await handleRivalSessionComplete(
      rivalId,
      userId,
      'Your rival',
      sessionMinutes,
      theirScore,
      myScore,
      daysRemaining
    );

  } catch (error) {
    debug.error('[RivalNotification] Error checking rivals', error as Error);
  }
}

// ============================================================================
// Notification Status
// ============================================================================

/**
 * Get notification status for debugging/monitoring
 */
export async function getRivalNotificationStatus(
  userId: string
): Promise<{
  settings: RivalNotificationSettings;
  sentToday: number;
  remaining: number;
  nextAvailable: Date | null;
}> {
  const settings = await getRivalNotificationSettings(userId);
  const tracking = await getNotificationTracking();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sentToday = tracking.sent.filter((n) => n.timestamp > today.getTime()).length;

  // Find next available time based on cooldown
  const lastNotification = tracking.sent[tracking.sent.length - 1];
  const nextAvailable = lastNotification
    ? new Date(lastNotification.timestamp + RIVAL_NOTIFICATION_COOLDOWN_MS)
    : null;

  return {
    settings,
    sentToday,
    remaining: Math.max(0, settings.maxPerDay - sentToday),
    nextAvailable,
  };
}

/**
 * Reset notification tracking (for testing or user request)
 */
export async function resetRivalNotificationTracking(): Promise<void> {
  await saveNotificationTracking({ sent: [], lastCleanup: Date.now() });
}
