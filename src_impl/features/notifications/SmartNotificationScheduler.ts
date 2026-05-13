/**
 * SmartNotificationScheduler
 *
 * Analyzes user session times to identify peak focus windows.
 * Sends notifications during those windows, not at fixed times.
 * Rotates notification content: streak, boss, social, positive.
 *
 * @phase 11.5
 */

import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('notifications:smart-scheduler');

// ============================================================================
// Configuration
// ============================================================================

const ANALYSIS_WINDOW_DAYS = 14; // Analyze last 14 days
const DEFAULT_PEAK_HOUR = 19; // 7 PM default for new/erratic users
const MAX_NOTIFICATIONS_PER_DAY = 1; // Rate limit

// ============================================================================
// Schemas
// ============================================================================
// ============================================================================
// Analysis Functions
// ============================================================================
// ============================================================================
// Notification Content Generation
// ============================================================================

interface NotificationContent {
  title: string;
  body: string;
  data: Record<string, unknown>;
}

/**
 * Generate streak-based notification
 */
async function generateStreakNotification(userId: string): Promise<NotificationContent | null> {
  try {
    const { data: streak, error } = await getSupabaseClient().from('user_streaks').select('current_streak').eq('user_id', userId).single();

    if (error || !streak) {
      return null;
    }

    const streakDays = streak.current_streak;

    if (streakDays === 0) {
      return {
        title: 'Start your streak today 🔥',
        body: 'Day 1 is the most important. Complete a session to begin!',
        data: { type: 'STREAK_START' },
      };
    }

    return {
      title: `Your ${streakDays}-day streak continues 🔥`,
      body: "Complete today's session to keep it alive!",
      data: { type: 'STREAK_CONTINUE', streakDays },
    };
  } catch (error) {
    return null;
  }
}

/**
 * Generate boss-based notification
 */
async function generateBossNotification(userId: string): Promise<NotificationContent | null> {
  try {
    const { data: encounter, error } = await getSupabaseClient().from('boss_encounters').select('boss_name, current_health, max_health').eq('user_id', userId).eq('status', 'ACTIVE').order('created_at', { ascending: false }).limit(1).maybeSingle();

    if (error || !encounter) {
      return null;
    }

    const healthPercent = (encounter.current_health / encounter.max_health) * 100;

    if (healthPercent <= 25) {
      return {
        title: '👹 Boss almost defeated!',
        body: `${encounter.boss_name} has ${healthPercent.toFixed(0)}% health. One more session could finish it!`,
        data: { type: 'BOSS_KILLING_BLOW', bossName: encounter.boss_name },
      };
    }

    return {
      title: 'Boss needs your attention 👹',
      body: `${encounter.boss_name} has ${healthPercent.toFixed(0)}% health remaining. Deal some damage!`,
      data: { type: 'BOSS_DAMAGE', bossName: encounter.boss_name, healthPercent },
    };
  } catch (error) {
    return null;
  }
}

/**
 * Generate social (rival) notification
 */
async function generateSocialNotification(userId: string): Promise<NotificationContent | null> {
  try {
    // Get user's rival
    const { data: rival, error } = await getSupabaseClient().from('rivals').select('rival_name, rival_minutes, my_minutes').eq('user_id', userId).eq('is_active', true).maybeSingle();

    if (error || !rival) {
      return null;
    }

    const gap = rival.rival_minutes - rival.my_minutes;

    if (gap > 0) {
      return {
        title: `⚔️ ${rival.rival_name} is ahead!`,
        body: `They're ${gap} minutes ahead this week. Time to focus and close the gap!`,
        data: { type: 'RIVAL_AHEAD', rivalName: rival.rival_name, gap },
      };
    }

    return {
      title: `⚔️ You're beating ${rival.rival_name}!`,
      body: `You're ${Math.abs(gap)} minutes ahead. Keep the lead!`,
      data: { type: 'RIVAL_LEADING', rivalName: rival.rival_name },
    };
  } catch (error) {
    return null;
  }
}

/**
 * Generate positive/momentum notification
 */
async function generatePositiveNotification(userId: string): Promise<NotificationContent | null> {
  try {
    // Get this week's stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const { data: sessions, error } = await getSupabaseClient().from('sessions').select('duration_seconds').eq('user_id', userId).eq('status', 'COMPLETED').gte('completed_at', weekStart.toISOString());

    if (error || !sessions || sessions.length === 0) {
      return null;
    }

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0) / 60, 0);

    return {
      title: 'Great momentum this week 📈',
      body: `You've focused for ${Math.round(totalMinutes)} minutes this week. Today's session keeps it going!`,
      data: { type: 'MOMENTUM', totalMinutes },
    };
  } catch (error) {
    return null;
  }
}

/**
 * PHASE 14.4: Generate weekly rank report notification
 * Every Sunday at 7PM
 */
async function generateRankReportNotification(userId: string): Promise<NotificationContent | null> {
  try {
    // Check if today is Sunday and around 7 PM
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    // Only send on Sunday between 7-8 PM
    if (dayOfWeek !== 0 || hour < 19 || hour >= 20) {
      return null;
    }

    // Get user's weekly focus stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const { data: sessions, error } = await getSupabaseClient().from('sessions').select('duration_seconds').eq('user_id', userId).eq('status', 'COMPLETED').gte('completed_at', weekStart.toISOString());

    if (error) {
      return null;
    }

    const weeklyMinutes = (sessions || []).reduce((sum, s) => sum + (s.duration_seconds || 0) / 60, 0);

    // Get rank info from leaderboard position
    const { data: leaderboard, error: lbError } = await getSupabaseClient().from('weekly_leaderboard').select('user_id, focus_minutes').order('focus_minutes', { ascending: false });

    if (lbError || !leaderboard) {
      return null;
    }

    const userIndex = leaderboard.findIndex((entry) => entry.user_id === userId);
    const totalUsers = leaderboard.length;
    const rankPosition = userIndex >= 0 ? userIndex + 1 : totalUsers;

    // Calculate percentile (higher percentile = better)
    const percentile = totalUsers > 0 ? ((totalUsers - rankPosition) / totalUsers) * 100 : 0;

    // Determine tier based on percentile
    let tier: string;
    let tierIcon: string;
    let sessionsToNext: number | null = null;

    if (percentile >= 99) {
      tier = 'LEGEND';
      tierIcon = '👑';
    } else if (percentile >= 95) {
      tier = 'DIAMOND';
      tierIcon = '💎';
      sessionsToNext = Math.ceil((0.99 * totalUsers - (totalUsers - rankPosition)) * 25);
    } else if (percentile >= 90) {
      tier = 'PLATINUM';
      tierIcon = '⭐';
      sessionsToNext = Math.ceil((0.95 * totalUsers - (totalUsers - rankPosition)) * 25);
    } else if (percentile >= 75) {
      tier = 'GOLD';
      tierIcon = '🥇';
      sessionsToNext = Math.ceil((0.9 * totalUsers - (totalUsers - rankPosition)) * 25);
    } else if (percentile >= 50) {
      tier = 'SILVER';
      tierIcon = '🥈';
      sessionsToNext = Math.ceil((0.75 * totalUsers - (totalUsers - rankPosition)) * 25);
    } else {
      tier = 'BRONZE';
      tierIcon = '🥉';
      sessionsToNext = Math.ceil((0.5 * totalUsers - (totalUsers - rankPosition)) * 25);
    }

    let body = `You're in ${tier} tier this week — top ${Math.round(percentile)}% of VEX users. Keep the focus Sunday!`;
    if (sessionsToNext && sessionsToNext > 0) {
      body += ` About ${sessionsToNext} more sessions to reach the next tier.`;
    }

    return {
      title: `Weekly Rank: ${tierIcon} ${tier}`,
      body,
      data: {
        type: 'RANK_REPORT',
        tier,
        percentile: Math.round(percentile),
        weeklyMinutes: Math.round(weeklyMinutes),
        rankPosition,
        totalUsers,
      },
    };
  } catch (error) {
    return null;
  }
}

/**
 * Generate comeback notification
 */
async function generateComebackNotification(userId: string): Promise<NotificationContent | null> {
  try {
    const { data: quest, error } = await getSupabaseClient().from('comeback_quests').select('stage, days_absent').eq('user_id', userId).eq('all_quests_completed', false).order('created_at', { ascending: false }).limit(1).maybeSingle();

    if (error || !quest) {
      return null;
    }

    const stageNum = quest.stage === 'QUEST_1' ? 1 : quest.stage === 'QUEST_2' ? 2 : 3;

    return {
      title: '🔥 Your comeback continues!',
      body: `You're on Quest ${stageNum}/3. Complete today's session to progress!`,
      data: { type: 'COMEBACK_QUEST', stage: stageNum },
    };
  } catch (error) {
    return null;
  }
}

/**
 * Select notification type based on priority
 */
async function selectNotificationType(userId: string, preferredTypes: NotificationContentType[]): Promise<NotificationContent | null> {
  // Priority order based on urgency
  const typeGenerators: Record<NotificationContentType, () => Promise<NotificationContent | null>> = {
    COMEBACK: () => generateComebackNotification(userId),
    BOSS: () => generateBossNotification(userId),
    STREAK: () => generateStreakNotification(userId),
    SOCIAL: () => generateSocialNotification(userId),
    POSITIVE: () => generatePositiveNotification(userId),
    RANK_REPORT: () => generateRankReportNotification(userId),
  };

  // Try each type in priority order
  for (const type of preferredTypes) {
    const generator = typeGenerators[type];
    if (generator) {
      const content = await generator();
      if (content) {
        return content;
      }
    }
  }

  return null;
}

// ============================================================================
// Rate Limiting
// ============================================================================

/**
 * Check if user has hit daily notification limit
 */
async function checkRateLimit(userId: string): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count, error } = await getSupabaseClient().from('notifications_sent').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('notification_type', 'SMART_REMINDER').gte('sent_at', today.toISOString());

    if (error) {
      debug.warn('Error checking rate limit', error);
      return false; // Allow on error
    }

    return (count ?? 0) < MAX_NOTIFICATIONS_PER_DAY;
  } catch (error) {
    return false;
  }
}

/**
 * Record notification sent
 */
async function recordNotificationSent(userId: string): Promise<void> {
  try {
    await getSupabaseClient().from('notifications_sent').insert({
      user_id: userId,
      notification_type: 'SMART_REMINDER',
      sent_at: new Date().toISOString(),
    });
  } catch (error) {
    debug.warn('Failed to record notification', error instanceof Error ? error : undefined);
  }
}

// ============================================================================
// Main Scheduler
// ============================================================================
// ============================================================================
// React Hook
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

interface UseSmartNotificationsResult {
  peakWindow: PeakFocusWindow | null;
  isLoading: boolean;
  canSendNotification: boolean;
  refresh: () => void;
}

export default {
  analyzePeakFocusWindow,
  isInPeakWindow,
  selectNotificationType,
  processSmartNotifications,
  processUserSmartNotification,
  useSmartNotifications,
  MAX_NOTIFICATIONS_PER_DAY,
};

export * from "./SmartNotificationScheduler.types";
export * from "./SmartNotificationScheduler.types";
export * from "./SmartNotificationScheduler.part1";
export * from "./SmartNotificationScheduler.part2";
