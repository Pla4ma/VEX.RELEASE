import { z } from "zod";
import { getSupabaseClient } from "../../config/supabase";
import { createDebugger } from "../../utils/debug";
import { useState, useEffect, useCallback } from "react";


export const PeakFocusWindowSchema = z.object({
  userId: z.string(),
  peakHour: z.number().min(0).max(23),
  confidence: z.number().min(0).max(1), // How consistent is the pattern
  sessionCount: z.number(),
  pattern: z.enum(['CONSISTENT', 'VARIABLE', 'ERRATIC', 'NEW']),
  hourDistribution: z.record(z.number(), z.number()), // hour -> count
});

export const NotificationContentTypeSchema = z.enum([
  'STREAK',
  'BOSS',
  'SOCIAL',
  'POSITIVE',
  'COMEBACK',
  'RANK_REPORT', // PHASE 14.4
]);

export const SmartNotificationConfigSchema = z.object({
  userId: z.string(),
  peakWindow: PeakFocusWindowSchema,
  lastNotificationSent: z.number().optional(),
  notificationCountToday: z.number().default(0),
  preferredContentTypes: z.array(NotificationContentTypeSchema).default(['STREAK', 'BOSS', 'SOCIAL', 'POSITIVE']),
});

export async function analyzePeakFocusWindow(userId: string): Promise<PeakFocusWindow> {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - ANALYSIS_WINDOW_DAYS);

    const { data: sessions, error } = await getSupabaseClient().from('sessions').select('started_at, timezone').eq('user_id', userId).eq('status', 'COMPLETED').gte('started_at', fromDate.toISOString()).order('started_at', { ascending: false });

    if (error || !sessions || sessions.length === 0) {
      // No sessions - return default for new user
      return {
        userId,
        peakHour: DEFAULT_PEAK_HOUR,
        confidence: 0,
        sessionCount: 0,
        pattern: 'NEW',
        hourDistribution: {},
      };
    }

    // Build hour distribution
    const hourDistribution: Record<number, number> = {};

    for (const session of sessions) {
      const timezone = session.timezone || 'UTC';
      const sessionDate = new Date(session.started_at);

      // Get hour in user's timezone
      const hourString = sessionDate.toLocaleString('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
      });
      const hour = parseInt(hourString, 10);

      hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
    }

    // Find peak hour
    let peakHour = DEFAULT_PEAK_HOUR;
    let maxCount = 0;

    for (const [hour, count] of Object.entries(hourDistribution)) {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(hour, 10);
      }
    }

    // Calculate confidence (consistency)
    const totalSessions = sessions.length;
    const peakRatio = maxCount / totalSessions;
    const confidence = Math.min(peakRatio, 1);

    // Determine pattern
    let pattern: PeakFocusWindow['pattern'] = 'CONSISTENT';
    if (totalSessions < 5) {
      pattern = 'NEW';
    } else if (confidence < 0.3) {
      pattern = 'ERRATIC';
    } else if (confidence < 0.6) {
      pattern = 'VARIABLE';
    }

    return {
      userId,
      peakHour,
      confidence,
      sessionCount: totalSessions,
      pattern,
      hourDistribution,
    };
  } catch (error) {
    debug.error('Error analyzing peak focus window', error instanceof Error ? error : undefined);
    return {
      userId,
      peakHour: DEFAULT_PEAK_HOUR,
      confidence: 0,
      sessionCount: 0,
      pattern: 'NEW',
      hourDistribution: {},
    };
  }
}

export function isInPeakWindow(peakHour: number, windowSize = 2): boolean {
  const now = new Date();
  const currentHour = now.getHours();

  // Check if within +/- windowSize hours of peak
  const diff = Math.abs(currentHour - peakHour);
  return diff <= windowSize;
}

export async function processSmartNotifications(): Promise<void> {
  try {
    // Get all users with notifications enabled
    const { data: users, error } = await getSupabaseClient().from('users').select('id, timezone').eq('notifications_enabled', true);

    if (error || !users) {
      debug.error('Failed to fetch users', error instanceof Error ? error : undefined);
      return;
    }

    for (const user of users) {
      await processUserSmartNotification(user.id, user.timezone || 'UTC');
    }
  } catch (error) {
    debug.error('Error processing smart notifications', error instanceof Error ? error : undefined);
  }
}

export async function processUserSmartNotification(userId: string, timezone: string): Promise<void> {
  try {
    // Check rate limit
    const canSend = await checkRateLimit(userId);
    if (!canSend) {
      debug.info('Rate limit reached for user', { userId });
      return;
    }

    // Analyze peak window
    const peakWindow = await analyzePeakFocusWindow(userId);

    // Check if we're in peak window
    if (!isInPeakWindow(peakWindow.peakHour)) {
      debug.info('Not in peak window', { userId, peakHour: peakWindow.peakHour });
      return;
    }

    // Get notification content
    const content = await selectNotificationType(userId, ['COMEBACK', 'BOSS', 'STREAK', 'SOCIAL', 'POSITIVE']);

    if (!content) {
      debug.info('No notification content generated', { userId });
      return;
    }

    // Send notification
    // await sendPushNotification(userId, content);
    debug.info('Would send smart notification', { userId, title: content.title });

    // Record sent
    await recordNotificationSent(userId);
  } catch (error) {
    debug.error('Error processing user notification', error instanceof Error ? error : undefined);
  }
}