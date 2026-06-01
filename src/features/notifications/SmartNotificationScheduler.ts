import { getSupabaseClient } from '../../config/supabase';
import { createDebugger } from '../../utils/debug';
import { useState, useEffect, useCallback } from 'react';
import { ANALYSIS_WINDOW_DAYS, DEFAULT_PEAK_HOUR } from './SmartNotificationScheduler-types';
import type { PeakFocusWindow } from './SmartNotificationScheduler-types';
import { selectNotificationType } from './SmartNotificationScheduler-generators';
import { checkRateLimit, recordNotificationSent } from './SmartNotificationScheduler-rankReport';

const debug = createDebugger('notifications:smart-scheduler');

const DEFAULT_RESULT: Omit<PeakFocusWindow, 'userId'> = {
  peakHour: DEFAULT_PEAK_HOUR,
  confidence: 0,
  sessionCount: 0,
  pattern: 'NEW',
  hourDistribution: {},
};

export async function analyzePeakFocusWindow(
  userId: string,
): Promise<PeakFocusWindow> {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - ANALYSIS_WINDOW_DAYS);
    const { data: sessions, error } = await getSupabaseClient()
      .from('sessions')
      .select('started_at, timezone')
      .eq('user_id', userId)
      .eq('status', 'COMPLETED')
      .gte('started_at', fromDate.toISOString())
      .order('started_at', { ascending: false });
    if (error || !sessions || sessions.length === 0) {
      return { userId, ...DEFAULT_RESULT };
    }
    const hourDistribution: Record<number, number> = {};
    for (const session of sessions) {
      const timezone = session.timezone || 'UTC';
      const sessionDate = new Date(session.started_at);
      const hourString = sessionDate.toLocaleString('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
      });
      const hour = parseInt(hourString, 10);
      hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
    }
    let peakHour = DEFAULT_PEAK_HOUR;
    let maxCount = 0;
    for (const [hour, count] of Object.entries(hourDistribution)) {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(hour, 10);
      }
    }
    const totalSessions = sessions.length;
    const confidence = Math.min(maxCount / totalSessions, 1);
    let pattern: PeakFocusWindow['pattern'] = 'CONSISTENT';
    if (totalSessions < 5) {
      pattern = 'NEW';
    } else if (confidence < 0.3) {
      pattern = 'ERRATIC';
    } else if (confidence < 0.6) {
      pattern = 'VARIABLE';
    }
    return { userId, peakHour, confidence, sessionCount: totalSessions, pattern, hourDistribution };
  } catch (error) {
    debug.error('Error analyzing peak focus window', error instanceof Error ? error : undefined);
    return { userId, ...DEFAULT_RESULT };
  }
}

export function isInPeakWindow(peakHour: number, windowSize = 2): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const diff = Math.abs(currentHour - peakHour);
  return diff <= windowSize;
}

export async function processSmartNotifications(): Promise<void> {
  try {
    const { data: users, error } = await getSupabaseClient()
      .from('users')
      .select('id, timezone')
      .eq('notifications_enabled', true);
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

export async function processUserSmartNotification(
  userId: string,
  timezone: string,
): Promise<void> {
  try {
    const canSend = await checkRateLimit(userId);
    if (!canSend) {
      debug.info('Rate limit reached for user', { userId });
      return;
    }
    const peakWindow = await analyzePeakFocusWindow(userId);
    if (!isInPeakWindow(peakWindow.peakHour)) {
      debug.info('Not in peak window', { userId, peakHour: peakWindow.peakHour });
      return;
    }
    const content = await selectNotificationType(userId, [
      'COMEBACK', 'BOSS', 'STREAK', 'SOCIAL', 'POSITIVE',
    ]);
    if (!content) {
      debug.info('No notification content generated', { userId });
      return;
    }
    debug.info('Would send smart notification', { userId, title: content.title });
    await recordNotificationSent(userId);
  } catch (error) {
    debug.error('Error processing user notification', error instanceof Error ? error : undefined);
  }
}

// ─── React Hook ─────────────────────────────────────────────────────────────

interface UseSmartNotificationsResult {
  peakWindow: PeakFocusWindow | null;
  isLoading: boolean;
  canSendNotification: boolean;
  refresh: () => void;
}

export function useSmartNotifications(
  userId: string | undefined,
): UseSmartNotificationsResult {
  const [peakWindow, setPeakWindow] = useState<PeakFocusWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canSend, setCanSend] = useState(false);
  const refresh = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const window = await analyzePeakFocusWindow(userId);
    setPeakWindow(window);
    const inWindow = isInPeakWindow(window.peakHour);
    const underLimit = await checkRateLimit(userId);
    setCanSend(inWindow && underLimit);
    setIsLoading(false);
  }, [userId]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return { peakWindow, isLoading, canSendNotification: canSend, refresh };
}
