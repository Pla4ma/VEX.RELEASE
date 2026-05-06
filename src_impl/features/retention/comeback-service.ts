/**
 * Comeback Flow Service
 *
 * Manages user re-engagement after breaks or streak losses.
 */

import { z } from "zod";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("retention:comeback");

// Comeback quest types
export type ComebackQuestType = "mini_session" | "streak_restore" | "boss_fight" | "social_reconnect";

// Comeback quest status
export type ComebackQuestStatus = "active" | "completed" | "expired";

// Comeback quest schema
export const ComebackQuestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(["mini_session", "streak_restore", "boss_fight", "social_reconnect"]),
  title: z.string(),
  description: z.string(),
  reward: z.object({
    xp: z.number(),
    coins: z.number(),
    streakRestored: z.boolean(),
  }),
  status: z.enum(["active", "completed", "expired"]),
  expiresAt: z.number(),
  completedAt: z.number().nullable(),
  createdAt: z.number(),
});

export type ComebackQuest = z.infer<typeof ComebackQuestSchema>;

// Comeback context
export interface ComebackContext {
  daysSinceLastSession: number;
  previousStreak: number;
  streakBroken: boolean;
  wasInvitedBack: boolean;
  inviterName?: string;
}

// Generate comeback quest based on context
export function generateComebackQuest(userId: string, context: ComebackContext): ComebackQuest {
  const now = Date.now();
  const expiresAt = now + 48 * 60 * 60 * 1000; // 48 hours

  if (context.streakBroken && context.previousStreak > 3) {
    return {
      id: `comeback-streak-${userId}-${now}`,
      userId,
      type: "streak_restore",
      title: "Win Back Your Streak",
      description: `Complete a 15-minute session to restore your ${context.previousStreak}-day streak.`,
      reward: {
        xp: 50,
        coins: 100,
        streakRestored: true,
      },
      status: "active",
      expiresAt,
      completedAt: null,
      createdAt: now,
    };
  }

  if (context.daysSinceLastSession > 7) {
    return {
      id: `comeback-mini-${userId}-${now}`,
      userId,
      type: "mini_session",
      title: "Gentle Return",
      description: "Start with a quick 5-minute session to ease back in.",
      reward: {
        xp: 25,
        coins: 50,
        streakRestored: false,
      },
      status: "active",
      expiresAt,
      completedAt: null,
      createdAt: now,
    };
  }

  if (context.wasInvitedBack && context.inviterName) {
    return {
      id: `comeback-social-${userId}-${now}`,
      userId,
      type: "social_reconnect",
      title: `${context.inviterName} Misses You`,
      description: `${context.inviterName} invited you back. Join them for a session.`,
      reward: {
        xp: 75,
        coins: 150,
        streakRestored: false,
      },
      status: "active",
      expiresAt,
      completedAt: null,
      createdAt: now,
    };
  }

  return {
    id: `comeback-boss-${userId}-${now}`,
    userId,
    type: "boss_fight",
    title: "Boss Awaits",
    description: "Your nemesis is undefeated. Return and claim victory.",
    reward: {
      xp: 100,
      coins: 200,
      streakRestored: false,
    },
    status: "active",
    expiresAt,
    completedAt: null,
    createdAt: now,
  };
}

// Check if user qualifies for comeback flow
export function qualifiesForComeback(daysSinceLastSession: number, currentStreak: number): boolean {
  // Qualify if:
  // - Been gone 3+ days with any streak
  // - Been gone 1+ days and had a streak broken
  // - Been gone 7+ days regardless
  return daysSinceLastSession >= 3 || (daysSinceLastSession >= 1 && currentStreak === 0) || daysSinceLastSession >= 7;
}

// Calculate comeback motivation message
export function getComebackMessage(daysSinceLastSession: number, previousStreak: number): string {
  if (daysSinceLastSession === 1) {
    return "One day off is healthy. Ready to continue?";
  }
  if (daysSinceLastSession <= 3) {
    return "Your routine is waiting for you.";
  }
  if (previousStreak > 7) {
    return `You had ${previousStreak} days. Let's start a new streak.`;
  }
  return "Every expert was once a beginner. Start again.";
}

// Create comeback notification
export function createComebackNotification(quest: ComebackQuest): {
  title: string;
  body: string;
  actionType: ComebackQuestType;
} {
  switch (quest.type) {
    case "streak_restore":
      return {
        title: quest.title,
        body: `${quest.description} Restore your progress!`,
        actionType: "streak_restore",
      };
    case "mini_session":
      return {
        title: "Welcome Back",
        body: quest.description,
        actionType: "mini_session",
      };
    case "social_reconnect":
      return {
        title: quest.title,
        body: quest.description,
        actionType: "social_reconnect",
      };
    case "boss_fight":
      return {
        title: quest.title,
        body: quest.description,
        actionType: "boss_fight",
      };
  }
}

// Simulate storage (replace with actual Supabase calls)
const activeQuests = new Map<string, ComebackQuest>();

export async function saveComebackQuest(quest: ComebackQuest): Promise<void> {
  activeQuests.set(quest.userId, quest);
  debug.info("Saved comeback quest for user %s: %s", quest.userId, quest.id);
}

export async function getActiveComebackQuest(userId: string): Promise<ComebackQuest | null> {
  const quest = activeQuests.get(userId);
  if (!quest) {
    return null;
  }

  // Check if expired
  if (quest.status === "active" && quest.expiresAt < Date.now()) {
    const expired = { ...quest, status: "expired" as const };
    activeQuests.set(userId, expired);
    return expired;
  }

  return quest;
}

export async function completeComebackQuest(userId: string, questId: string): Promise<ComebackQuest | null> {
  const quest = activeQuests.get(userId);
  if (!quest || quest.id !== questId) {
    return null;
  }

  const completed: ComebackQuest = {
    ...quest,
    status: "completed",
    completedAt: Date.now(),
  };

  activeQuests.set(userId, completed);
  debug.info("Completed comeback quest %s for user %s", questId, userId);

  return completed;
}

// Calculate re-engagement probability
export function calculateReEngagementProbability(daysSinceLastSession: number, previousSessionsCount: number, averageSessionQuality: number): number {
  // Base probability
  let probability = 0.7;

  // Decrease with time away
  if (daysSinceLastSession > 7) {
    probability -= 0.2;
  }
  if (daysSinceLastSession > 14) {
    probability -= 0.2;
  }
  if (daysSinceLastSession > 30) {
    probability -= 0.2;
  }

  // Increase with engagement history
  if (previousSessionsCount > 10) {
    probability += 0.1;
  }
  if (previousSessionsCount > 50) {
    probability += 0.1;
  }

  // Quality bonus
  if (averageSessionQuality > 80) {
    probability += 0.1;
  }

  // Clamp to 0-1
  return Math.max(0, Math.min(1, probability));
}
