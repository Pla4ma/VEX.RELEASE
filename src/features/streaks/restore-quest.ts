import { captureSilentFailure } from '../../utils/silent-failure';
import { z } from 'zod';

import { MMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';

const QUEST_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const REQUIRED_SESSIONS = 3;
const storage = new MMKVStorageAdapter('streak-restore-quest');

const RestoreQuestSchema = z.object({
  started: z.number(),
  completed: z.array(z.string()),
  required: z.number().int().min(1),
  streakBefore: z.number().int().min(1),
});

export type RestoreQuest = z.infer<typeof RestoreQuestSchema>;

function getQuestKey(userId: string): string {
  return `streak:restore:quest:${userId}`;
}

function getUsageKey(userId: string, monthKey: string): string {
  return `streak:restore:used:${userId}:${monthKey}`;
}

function getMonthKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

async function saveQuest(userId: string, quest: RestoreQuest): Promise<void> {
  await storage.setItem(getQuestKey(userId), JSON.stringify(quest));
}

export async function getStreakRestoreQuest(
  userId: string,
): Promise<RestoreQuest | null> {
  const raw = await storage.getItem(getQuestKey(userId));
  if (!raw) {
    return null;
  }

  try {
    const quest = RestoreQuestSchema.parse(JSON.parse(raw));
    if (Date.now() - quest.started > QUEST_DURATION_MS) {
      await storage.removeItem(getQuestKey(userId));
      return null;
    }
    return quest;
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'streaks',
      operation: 'network-fallback',
      type: 'network',
    });
    await storage.removeItem(getQuestKey(userId));
    return null;
  }
}

export async function hasUsedStreakRestoreThisMonth(
  userId: string,
): Promise<boolean> {
  const value = await storage.getItem(
    getUsageKey(userId, getMonthKey(Date.now())),
  );
  return value === 'true';
}

export async function markStreakRestoreUsed(userId: string): Promise<void> {
  await storage.setItem(getUsageKey(userId, getMonthKey(Date.now())), 'true');
}

export async function startStreakRestoreQuest(
  userId: string,
  streakBefore: number,
): Promise<RestoreQuest> {
  const existing = await getStreakRestoreQuest(userId);
  if (existing) {
    return existing;
  }

  const quest = RestoreQuestSchema.parse({
    started: Date.now(),
    completed: [],
    required: REQUIRED_SESSIONS,
    streakBefore,
  });
  await saveQuest(userId, quest);
  return quest;
}

export async function recordStreakRestoreSession(
  userId: string,
  sessionId: string,
): Promise<{
  quest: RestoreQuest | null;
  shouldRestore: boolean;
  streakBefore: number | null;
}> {
  const quest = await getStreakRestoreQuest(userId);
  if (!quest) {
    return { quest: null, shouldRestore: false, streakBefore: null };
  }

  if (quest.completed.includes(sessionId)) {
    return {
      quest,
      shouldRestore: quest.completed.length >= quest.required,
      streakBefore: quest.streakBefore,
    };
  }

  const nextQuest = RestoreQuestSchema.parse({
    ...quest,
    completed: [...quest.completed, sessionId],
  });
  await saveQuest(userId, nextQuest);

  return {
    quest: nextQuest,
    shouldRestore: nextQuest.completed.length >= nextQuest.required,
    streakBefore: nextQuest.streakBefore,
  };
}

export async function clearStreakRestoreQuest(userId: string): Promise<void> {
  await storage.removeItem(getQuestKey(userId));
}
