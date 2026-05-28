/**
 * Smart Notification Scheduler — Content Generators
 *
 * Each generator fetches context from Supabase and returns typed notification content.
 */

import { getSupabaseClient } from "../../config/supabase";
import type {
  NotificationContent,
  NotificationContentType,
} from "./SmartNotificationScheduler-types";
import { generateRankReportNotification } from "./SmartNotificationScheduler-rankReport";

export async function generateStreakNotification(
  userId: string,
): Promise<NotificationContent | null> {
  try {
    const { data: streak, error } = await getSupabaseClient()
      .from("user_streaks")
      .select("current_streak")
      .eq("user_id", userId)
      .single();
    if (error || !streak) {
      return null;
    }
    const streakDays = streak.current_streak;
    if (streakDays === 0) {
      return {
        title: "Start your streak today 🔥",
        body: "Day 1 is the most important. Complete a session to begin!",
        data: { type: "STREAK_START" },
      };
    }
    return {
      title: `Your ${streakDays}-day streak continues 🔥`,
      body: "Complete today's session to keep it alive!",
      data: { type: "STREAK_CONTINUE", streakDays },
    };
  } catch (error) {
    return null;
  }
}

export async function generateBossNotification(
  userId: string,
): Promise<NotificationContent | null> {
  try {
    const { data: encounter, error } = await getSupabaseClient()
      .from("boss_encounters")
      .select("boss_name, current_health, max_health")
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !encounter) {
      return null;
    }
    const healthPercent =
      (encounter.current_health / encounter.max_health) * 100;
    if (healthPercent <= 25) {
      return {
        title: "👹 Boss almost defeated!",
        body: `${encounter.boss_name} has ${healthPercent.toFixed(0)}% health. One more session could finish it!`,
        data: { type: "BOSS_KILLING_BLOW", bossName: encounter.boss_name },
      };
    }
    return {
      title: "Boss needs your attention 👹",
      body: `${encounter.boss_name} has ${healthPercent.toFixed(0)}% health remaining. Deal some damage!`,
      data: {
        type: "BOSS_DAMAGE",
        bossName: encounter.boss_name,
        healthPercent,
      },
    };
  } catch (error) {
    return null;
  }
}

export async function generateSocialNotification(
  userId: string,
): Promise<NotificationContent | null> {
  try {
    const { data: rival, error } = await getSupabaseClient()
      .from("rivals")
      .select("rival_name, rival_minutes, my_minutes")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();
    if (error || !rival) {
      return null;
    }
    const gap = rival.rival_minutes - rival.my_minutes;
    if (gap > 0) {
      return {
        title: `⚔️ ${rival.rival_name} is ahead!`,
        body: `They're ${gap} minutes ahead this week. Time to focus and close the gap!`,
        data: { type: "RIVAL_AHEAD", rivalName: rival.rival_name, gap },
      };
    }
    return {
      title: `⚔️ You're beating ${rival.rival_name}!`,
      body: `You're ${Math.abs(gap)} minutes ahead. Keep the lead!`,
      data: { type: "RIVAL_LEADING", rivalName: rival.rival_name },
    };
  } catch (error) {
    return null;
  }
}

export async function generatePositiveNotification(
  userId: string,
): Promise<NotificationContent | null> {
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const { data: sessions, error } = await getSupabaseClient()
      .from("sessions")
      .select("duration_seconds")
      .eq("user_id", userId)
      .eq("status", "COMPLETED")
      .gte("completed_at", weekStart.toISOString());
    if (error || !sessions || sessions.length === 0) {
      return null;
    }
    const totalMinutes = sessions.reduce(
      (sum, s) => sum + (s.duration_seconds || 0) / 60,
      0,
    );
    return {
      title: "Great momentum this week 📈",
      body: `You've focused for ${Math.round(totalMinutes)} minutes this week. Today's session keeps it going!`,
      data: { type: "MOMENTUM", totalMinutes },
    };
  } catch (error) {
    return null;
  }
}

export async function generateComebackNotification(
  userId: string,
): Promise<NotificationContent | null> {
  try {
    const { data: quest, error } = await getSupabaseClient()
      .from("comeback_quests")
      .select("stage, days_absent")
      .eq("user_id", userId)
      .eq("all_quests_completed", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !quest) {
      return null;
    }
    const stageNum =
      quest.stage === "QUEST_1" ? 1 : quest.stage === "QUEST_2" ? 2 : 3;
    return {
      title: "🔥 Your comeback continues!",
      body: `You're on Quest ${stageNum}/3. Complete today's session to progress!`,
      data: { type: "COMEBACK_QUEST", stage: stageNum },
    };
  } catch (error) {
    return null;
  }
}

export async function selectNotificationType(
  userId: string,
  preferredTypes: NotificationContentType[],
): Promise<NotificationContent | null> {
  const typeGenerators: Record<
    NotificationContentType,
    () => Promise<NotificationContent | null>
  > = {
    COMEBACK: () => generateComebackNotification(userId),
    BOSS: () => generateBossNotification(userId),
    STREAK: () => generateStreakNotification(userId),
    SOCIAL: () => generateSocialNotification(userId),
    POSITIVE: () => generatePositiveNotification(userId),
    RANK_REPORT: () => generateRankReportNotification(userId),
  };
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
