/**
 * BossSpawnScheduler
 *
 * Daily Boss Prime Time Window system.
 * Every boss has a 2-hour "Prime Time" window daily where damage earns 2× XP.
 * Creates appointment mechanics - users know when to show up for max rewards.
 *
 * @phase 11.1
 */

import { z } from "zod";
import { getSupabaseClient } from "../../config/supabase";
import { createDebugger } from "../../utils/debug";
import { dispatchUrgencyNotification, type NotificationContext } from "../notifications/service";

const debug = createDebugger("boss:spawn-scheduler");

// ============================================================================
// Configuration
// ============================================================================

const PRIME_TIME_DURATION_MINUTES = 120; // 2 hours
const PRE_NOTIFICATION_MINUTES = 30; // Notify 30 min before

// Boss-specific prime time windows (local time hours)
const BOSS_PRIME_TIME_WINDOWS: Record<number, { startHour: number; endHour: number }> = {
  1: { startHour: 9, endHour: 11 }, // Slacker - Morning
  2: { startHour: 14, endHour: 16 }, // Distraction Demon - Afternoon
  3: { startHour: 20, endHour: 22 }, // Infinite Scroller - Evening
  4: { startHour: 10, endHour: 12 }, // Master of Multitasking - Late morning
  5: { startHour: 15, endHour: 17 }, // Perfectionist - Afternoon
  6: { startHour: 19, endHour: 21 }, // Burnout Beast - Early evening
};

// ============================================================================
// Schemas
// ============================================================================

export const PrimeTimeWindowSchema = z.object({
  bossId: z.string(),
  bossTier: z.number().min(1).max(6),
  startTime: z.number(), // Unix timestamp
  endTime: z.number(),
  isActive: z.boolean(),
  isPreWindow: z.boolean(), // 30 min before start
  timeRemainingMinutes: z.number(),
  xpMultiplier: z.number().default(2),
});

export type PrimeTimeWindow = z.infer<typeof PrimeTimeWindowSchema>;

export const BossSpawnScheduleSchema = z.object({
  userId: z.string(),
  timezone: z.string(),
  bossId: z.string(),
  bossTier: z.number(),
  primeTimeStart: z.number(),
  primeTimeEnd: z.number(),
  preNotificationSent: z.boolean().default(false),
  primeTimeStartNotificationSent: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type BossSpawnSchedule = z.infer<typeof BossSpawnScheduleSchema>;

// ============================================================================
// Timezone Utilities
// ============================================================================

/**
 * Get current hour in user's timezone
 */
export function getCurrentHourInTimezone(timezone: string): number {
  const now = new Date();
  const timeString = now.toLocaleString("en-US", { timeZone: timezone, hour: "numeric", hour12: false });
  return parseInt(timeString, 10);
}

/**
 * Get today's date at a specific hour in user's timezone
 */
function getTodayAtHour(timezone: string, hour: number): Date {
  const now = new Date();
  const timeString = now.toLocaleString("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [month, day, year] = timeString.split("/").map(Number);
  return new Date(year, month - 1, day, hour, 0, 0);
}

/**
 * Calculate prime time window for a boss
 */
export function calculatePrimeTimeWindow(bossTier: number, timezone: string, bossId: string): PrimeTimeWindow {
  const window = BOSS_PRIME_TIME_WINDOWS[bossTier] ?? BOSS_PRIME_TIME_WINDOWS[1];
  const now = Date.now();

  const startTime = getTodayAtHour(timezone, window.startHour).getTime();
  const endTime = startTime + PRIME_TIME_DURATION_MINUTES * 60 * 1000;

  const isActive = now >= startTime && now < endTime;
  const isPreWindow = now >= startTime - PRE_NOTIFICATION_MINUTES * 60 * 1000 && now < startTime;
  const timeRemainingMinutes = isActive ? Math.ceil((endTime - now) / (60 * 1000)) : isPreWindow ? Math.ceil((startTime - now) / (60 * 1000)) : 0;

  return {
    bossId,
    bossTier,
    startTime,
    endTime,
    isActive,
    isPreWindow,
    timeRemainingMinutes,
    xpMultiplier: 2,
  };
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Check if prime time is active for a boss
 */
export function isPrimeTimeActive(bossTier: number, timezone: string): boolean {
  const window = calculatePrimeTimeWindow(bossTier, timezone, "");
  return window.isActive;
}

/**
 * Get formatted time remaining for display
 */
export function formatTimeRemaining(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Get display text for prime time status
 */
export function getPrimeTimeStatusText(window: PrimeTimeWindow): string {
  if (window.isActive) {
    return `⚡ PRIME TIME ACTIVE — ${formatTimeRemaining(window.timeRemainingMinutes)} remaining`;
  }
  if (window.isPreWindow) {
    return `⏰ Prime Time starts in ${formatTimeRemaining(window.timeRemainingMinutes)}`;
  }
  const nextStart = new Date(window.startTime);
  const timeString = nextStart.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `Next Prime Time: ${timeString}`;
}

/**
 * Calculate XP with prime time bonus
 */
export function calculatePrimeTimeXP(baseXP: number, bossTier: number, timezone: string): { totalXP: number; bonusXP: number; isPrimeTime: boolean } {
  const isPrimeTime = isPrimeTimeActive(bossTier, timezone);
  const multiplier = isPrimeTime ? 2 : 1;
  const totalXP = baseXP * multiplier;
  const bonusXP = totalXP - baseXP;

  return { totalXP, bonusXP, isPrimeTime };
}

// ============================================================================
// Notification Scheduling
// ============================================================================

/**
 * Send pre-prime-time notification
 */
export async function sendPrePrimeTimeNotification(userId: string, bossName: string, bossTier: number, startTime: number): Promise<void> {
  const startTimeFormatted = new Date(startTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const context: NotificationContext = {
    userId,
  };

  await dispatchUrgencyNotification(context, undefined, 22, 8);

  debug.info("Pre-Prime Time notification sent", {
    userId,
    bossName,
    startTime: startTimeFormatted,
  });
}

/**
 * Send prime time start notification
 */
export async function sendPrimeTimeStartNotification(userId: string, bossName: string, bossTier: number): Promise<void> {
  const context: NotificationContext = {
    userId,
  };

  await dispatchUrgencyNotification(context, undefined, 22, 8);

  debug.info("Prime Time start notification sent", {
    userId,
    bossName,
  });
}

/**
 * Check and send prime time notifications for all active boss encounters
 */
export async function checkAndSendPrimeTimeNotifications(): Promise<void> {
  try {
    const { data: activeEncounters, error } = await getSupabaseClient().from("boss_encounters").select("*, users!inner(timezone)").eq("status", "ACTIVE");

    if (error || !activeEncounters) {
      debug.warn("Failed to fetch active encounters", error);
      return;
    }

    for (const encounter of activeEncounters) {
      const timezone = encounter.users?.timezone || "UTC";
      const window = calculatePrimeTimeWindow(encounter.boss_tier, timezone, encounter.boss_id);

      // Check if we should send pre-notification
      if (window.isPreWindow && !encounter.pre_notification_sent) {
        await sendPrePrimeTimeNotification(encounter.user_id, encounter.boss_name, encounter.boss_tier, window.startTime);

        // Mark as sent
        await getSupabaseClient().from("boss_encounters").update({ pre_notification_sent: true }).eq("id", encounter.id);
      }

      // Check if we should send prime time start notification
      if (window.isActive && !encounter.prime_time_start_notification_sent) {
        await sendPrimeTimeStartNotification(encounter.user_id, encounter.boss_name, encounter.boss_tier);

        // Mark as sent
        await getSupabaseClient().from("boss_encounters").update({ prime_time_start_notification_sent: true }).eq("id", encounter.id);
      }
    }
  } catch (error) {
    debug.error("Error checking prime time notifications", error instanceof Error ? error : undefined);
  }
}

// ============================================================================
// Hook for React Components
// ============================================================================

import { useState, useEffect, useCallback } from "react";

interface UsePrimeTimeResult {
  window: PrimeTimeWindow | null;
  isLoading: boolean;
  refresh: () => void;
}

/**
 * Hook to track prime time status for a boss
 */
export function usePrimeTime(bossTier: number, bossId: string, timezone: string = "UTC"): UsePrimeTimeResult {
  const [window, setWindow] = useState<PrimeTimeWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    const newWindow = calculatePrimeTimeWindow(bossTier, timezone, bossId);
    setWindow(newWindow);
    setIsLoading(false);
  }, [bossTier, timezone, bossId]);

  useEffect(() => {
    refresh();

    // Update every minute to keep time remaining accurate
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { window, isLoading, refresh };
}

export default {
  calculatePrimeTimeWindow,
  isPrimeTimeActive,
  formatTimeRemaining,
  getPrimeTimeStatusText,
  calculatePrimeTimeXP,
  checkAndSendPrimeTimeNotifications,
  usePrimeTime,
};
