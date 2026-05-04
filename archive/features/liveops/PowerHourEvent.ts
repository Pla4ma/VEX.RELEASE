/**
 * PowerHourEvent
 *
 * Weekly 1-hour event with 3× XP for all sessions.
 * Creates appointment mechanics - announced 24 hours in advance.
 *
 * @phase 11.2
 */

import { z } from 'zod';
import { createDebugger } from '../../utils/debug';
import { getSupabaseClient } from '../../config/supabase';
import { dispatchUrgencyNotification } from '../notifications/service';

const debug = createDebugger('liveops:power-hour');

// ============================================================================
// Configuration
// ============================================================================

export const POWER_HOUR_CONFIG = {
  // Default: Wednesday at 7 PM local time
  defaultDay: 3, // 0 = Sunday, 3 = Wednesday
  defaultHour: 19, // 7 PM
  defaultDurationMinutes: 60,
  defaultXPMultiplier: 3,
  preAnnouncementHours: 24,
} as const;

// ============================================================================
// Schemas
// ============================================================================

export const PowerHourScheduleSchema = z.object({
  id: z.string(),
  dayOfWeek: z.number().min(0).max(6), // 0-6 (Sun-Sat)
  hour: z.number().min(0).max(23),
  durationMinutes: z.number().default(60),
  xpMultiplier: z.number().default(3),
  isActive: z.boolean().default(true),
  announcementSent: z.boolean().default(false),
  eventStartNotificationSent: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type PowerHourSchedule = z.infer<typeof PowerHourScheduleSchema>;

export const PowerHourStatusSchema = z.object({
  isActive: z.boolean(),
  isPreAnnouncement: z.boolean(),
  timeRemainingMinutes: z.number(),
  nextEventStart: z.number(),
  nextEventEnd: z.number(),
  xpMultiplier: z.number(),
  participantsSoFar: z.number().default(0),
});

export type PowerHourStatus = z.infer<typeof PowerHourStatusSchema>;

// ============================================================================
// Time Utilities
// ============================================================================

/**
 * Get next occurrence of a specific day/hour in a timezone
 */
export function getNextOccurrence(
  dayOfWeek: number,
  hour: number,
  timezone: string
): Date {
  const now = new Date();

  // Get current date parts in target timezone
  const dateString = now.toLocaleDateString('en-US', {
    timeZone: timezone,
    weekday: 'short',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  // Parse to get current day
  const tempDate = new Date(dateString);
  const currentDay = tempDate.getDay(); // 0-6

  const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7 || 7;

  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + daysUntilTarget);
  targetDate.setHours(hour, 0, 0, 0);

  return targetDate;
}

/**
 * Calculate Power Hour status
 */
export function calculatePowerHourStatus(
  schedule: PowerHourSchedule,
  timezone: string,
  participantsSoFar = 0
): PowerHourStatus {
  const now = Date.now();
  const nextStart = getNextOccurrence(schedule.dayOfWeek, schedule.hour, timezone).getTime();
  const endTime = nextStart + schedule.durationMinutes * 60 * 1000;

  // If the event already passed today, get next week's
  let startTime = nextStart;
  let eventEnd = endTime;

  if (now > endTime) {
    // Event passed, calculate for next week
    startTime = nextStart + 7 * 24 * 60 * 60 * 1000;
    eventEnd = startTime + schedule.durationMinutes * 60 * 1000;
  }

  const isActive = now >= startTime && now < eventEnd;
  const timeUntilStart = startTime - now;
  const isPreAnnouncement = timeUntilStart > 0 && timeUntilStart <= POWER_HOUR_CONFIG.preAnnouncementHours * 60 * 60 * 1000;
  const timeRemainingMinutes = isActive
    ? Math.ceil((eventEnd - now) / (60 * 1000))
    : Math.ceil((startTime - now) / (60 * 1000));

  return {
    isActive,
    isPreAnnouncement: isPreAnnouncement && !isActive,
    timeRemainingMinutes,
    nextEventStart: startTime,
    nextEventEnd: eventEnd,
    xpMultiplier: schedule.xpMultiplier,
    participantsSoFar,
  };
}

/**
 * Format time remaining for display
 */
export function formatPowerHourTime(minutes: number, isActive: boolean): string {
  if (isActive) {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m left`;
    }
    return `${minutes}m left`;
  } else {
    if (minutes >= 60 * 24) {
      const days = Math.floor(minutes / (60 * 24));
      const hours = Math.floor((minutes % (60 * 24)) / 60);
      return `${days}d ${hours}h`;
    }
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  }
}

/**
 * Get day name
 */
export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] ?? 'Unknown';
}

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Get Power Hour schedule from database (LiveOps config)
 */
export async function getPowerHourSchedule(): Promise<PowerHourSchedule | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('liveops_config')
      .select('*')
      .eq('feature_key', 'power_hour')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // Return default schedule
      return {
        id: 'default',
        dayOfWeek: POWER_HOUR_CONFIG.defaultDay,
        hour: POWER_HOUR_CONFIG.defaultHour,
        durationMinutes: POWER_HOUR_CONFIG.defaultDurationMinutes,
        xpMultiplier: POWER_HOUR_CONFIG.defaultXPMultiplier,
        isActive: true,
        announcementSent: false,
        eventStartNotificationSent: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    return PowerHourScheduleSchema.parse({
      id: data.id,
      dayOfWeek: data.config?.dayOfWeek ?? POWER_HOUR_CONFIG.defaultDay,
      hour: data.config?.hour ?? POWER_HOUR_CONFIG.defaultHour,
      durationMinutes: data.config?.durationMinutes ?? POWER_HOUR_CONFIG.defaultDurationMinutes,
      xpMultiplier: data.config?.xpMultiplier ?? POWER_HOUR_CONFIG.defaultXPMultiplier,
      isActive: data.is_active ?? true,
      announcementSent: data.announcement_sent ?? false,
      eventStartNotificationSent: data.start_notification_sent ?? false,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    });
  } catch (error) {
    debug.error('Failed to get Power Hour schedule', error instanceof Error ? error : undefined);
    return null;
  }
}

/**
 * Update Power Hour notification flags
 */
export async function updatePowerHourNotificationFlags(
  scheduleId: string,
  flags: { announcementSent?: boolean; eventStartNotificationSent?: boolean }
): Promise<void> {
  try {
    await getSupabaseClient()
      .from('liveops_config')
      .update({
        announcement_sent: flags.announcementSent,
        start_notification_sent: flags.eventStartNotificationSent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', scheduleId);
  } catch (error) {
    debug.error('Failed to update notification flags', error instanceof Error ? error : undefined);
  }
}

/**
 * Get count of users who focused during current Power Hour
 */
export async function getPowerHourParticipantsCount(): Promise<number> {
  try {
    const schedule = await getPowerHourSchedule();
    if (!schedule) {return 0;}

    const now = Date.now();
    const nextStart = getNextOccurrence(schedule.dayOfWeek, schedule.hour, 'UTC').getTime();
    const endTime = nextStart + schedule.durationMinutes * 60 * 1000;

    let startTime = nextStart;
    if (now > endTime) {
      startTime = nextStart + 7 * 24 * 60 * 60 * 1000;
    }

    const { count, error } = await getSupabaseClient()
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('started_at', new Date(startTime).toISOString())
      .lte('started_at', new Date(startTime + schedule.durationMinutes * 60 * 1000).toISOString())
      .eq('status', 'COMPLETED');

    if (error) {
      debug.warn('Failed to get participant count', error);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    debug.error('Error getting participant count', error instanceof Error ? error : undefined);
    return 0;
  }
}

// ============================================================================
// Notifications
// ============================================================================

/**
 * Send Power Hour announcement (24 hours before)
 */
export async function sendPowerHourAnnouncement(
  userId: string,
  schedule: PowerHourSchedule
): Promise<void> {
  const dayName = getDayName(schedule.dayOfWeek);
  const timeString = new Date()
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/:\d+ /, ' '); // Remove minutes for cleaner display

  debug.info('Sending Power Hour announcement', { userId, dayName, time: timeString });

  // In production, this would call push notification service
  // await sendPushNotification(userId, {
  //   title: '🌟 Power Hour Tomorrow!',
  //   body: `Triple XP starts ${dayName} at ${timeString}. Don't miss it!`,
  //   data: { type: 'POWER_HOUR_ANNOUNCEMENT' },
  // });
}

/**
 * Send Power Hour start notification
 */
export async function sendPowerHourStartNotification(userId: string): Promise<void> {
  debug.info('Sending Power Hour start notification', { userId });

  // await sendPushNotification(userId, {
  //   title: '⚡ Power Hour is LIVE!',
  //   body: '3× XP for the next hour! Start a session now!',
  //   data: { type: 'POWER_HOUR_START' },
  // });
}

/**
 * Check and send Power Hour notifications
 */
export async function checkAndSendPowerHourNotifications(): Promise<void> {
  try {
    const schedule = await getPowerHourSchedule();
    if (!schedule || !schedule.isActive) {return;}

    // Get all users with timezone
    const { data: users, error } = await getSupabaseClient()
      .from('users')
      .select('id, timezone')
      .eq('notifications_enabled', true);

    if (error || !users) {
      debug.warn('Failed to fetch users for notifications', error);
      return;
    }

    for (const user of users) {
      const status = calculatePowerHourStatus(schedule, user.timezone || 'UTC');

      // Send pre-announcement (24 hours before)
      if (status.isPreAnnouncement && !schedule.announcementSent) {
        await sendPowerHourAnnouncement(user.id, schedule);
      }

      // Send start notification
      if (status.isActive && !schedule.eventStartNotificationSent) {
        await sendPowerHourStartNotification(user.id);
      }
    }

    // Update flags
    if (schedule.id !== 'default') {
      const now = Date.now();
      const nextStart = getNextOccurrence(schedule.dayOfWeek, schedule.hour, 'UTC').getTime();

      if (now >= nextStart) {
        await updatePowerHourNotificationFlags(schedule.id, {
          announcementSent: true,
          eventStartNotificationSent: true,
        });
      }
    }
  } catch (error) {
    debug.error('Error checking Power Hour notifications', error instanceof Error ? error : undefined);
  }
}

// ============================================================================
// XP Calculation
// ============================================================================

/**
 * Calculate XP with Power Hour bonus
 */
export function calculatePowerHourXP(
  baseXP: number,
  isPowerHourActive: boolean,
  multiplier = 3
): { totalXP: number; bonusXP: number; isPowerHour: boolean } {
  if (!isPowerHourActive) {
    return { totalXP: baseXP, bonusXP: 0, isPowerHour: false };
  }

  const totalXP = baseXP * multiplier;
  const bonusXP = totalXP - baseXP;

  return { totalXP, bonusXP, isPowerHour: true };
}

// ============================================================================
// React Hook
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

interface UsePowerHourResult {
  status: PowerHourStatus | null;
  schedule: PowerHourSchedule | null;
  isLoading: boolean;
  refresh: () => void;
}

/**
 * Hook to track Power Hour status
 */
export function usePowerHour(timezone: string = 'UTC'): UsePowerHourResult {
  const [status, setStatus] = useState<PowerHourStatus | null>(null);
  const [schedule, setSchedule] = useState<PowerHourSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const sched = await getPowerHourSchedule();
    setSchedule(sched);

    if (sched) {
      const participants = await getPowerHourParticipantsCount();
      setStatus(calculatePowerHourStatus(sched, timezone, participants));
    }

    setIsLoading(false);
  }, [timezone]);

  useEffect(() => {
    refresh();

    // Update every minute
    const interval = setInterval(() => {
      if (schedule) {
        getPowerHourParticipantsCount().then((participants) => {
          setStatus(calculatePowerHourStatus(schedule, timezone, participants));
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [refresh, schedule, timezone]);

  return { status, schedule, isLoading, refresh };
}

export default {
  calculatePowerHourStatus,
  formatPowerHourTime,
  getPowerHourSchedule,
  calculatePowerHourXP,
  checkAndSendPowerHourNotifications,
  usePowerHour,
  POWER_HOUR_CONFIG,
};
