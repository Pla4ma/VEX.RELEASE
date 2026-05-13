import { captureSilentFailure } from "../../../utils/silent-failure";
import { MMKV } from "react-native-mmkv";


export function getOrCreateMemory(userId: string): CoachMemory {
  const key = `${STORAGE_KEY}_${userId}`;
  const stored = storage.getString(key);

  if (stored) {
    try {
      return JSON.parse(stored) as CoachMemory;
    } catch (error) {
      captureSilentFailure(error, { feature: 'ai-coach', operation: 'network-fallback', type: 'network' });
      // Invalid stored data, create fresh
    }
  }

  return createEmptyMemory(userId);
}

export function saveMemory(memory: CoachMemory): void {
  const key = `${STORAGE_KEY}_${memory.userId}`;
  storage.set(
    key,
    JSON.stringify({
      ...memory,
      lastUpdated: Date.now(),
    }),
  );
}

export function updateMemoryAfterSession(userId: string, session: SessionFacts): CoachMemory {
  const memory = getOrCreateMemory(userId);

  // Update total sessions
  memory.totalSessionsCompleted += 1;
  memory.totalFocusMinutes += session.duration;

  // Update best session quality
  if (session.quality > memory.bestSessionQuality) {
    memory.bestSessionQuality = session.quality;
    memory.bestSessionQualityDate = session.completedAt;
  }

  // Update average quality
  const totalQuality = memory.averageSessionQuality * (memory.totalSessionsCompleted - 1) + session.quality;
  memory.averageSessionQuality = totalQuality / memory.totalSessionsCompleted;

  // Update most productive time of day
  updateProductiveTimeOfDay(memory, session);

  // Update most used session duration
  updateMostUsedDuration(memory, session);

  saveMemory(memory);
  return memory;
}

export function updateMemoryAfterStreak(userId: string, streak: StreakFacts): CoachMemory {
  const memory = getOrCreateMemory(userId);

  // Update longest streak
  if (streak.longestDays > memory.longestStreak) {
    memory.longestStreak = streak.longestDays;
    memory.longestStreakDate = Date.now();
  }

  // Track comebacks (streak was broken but now rebuilding)
  if (streak.wasRecentlyBroken && streak.currentDays > 1) {
    memory.comebackCount += 1;
  }

  saveMemory(memory);
  return memory;
}

export function updateMemoryAfterBossDefeat(userId: string, bossId: string, bossName: string): CoachMemory {
  const memory = getOrCreateMemory(userId);

  memory.lastBossDefeated = bossName;
  memory.lastBossDefeatedDate = Date.now();

  saveMemory(memory);
  return memory;
}

export function getPersonalizedContext(userId: string): Record<string, unknown> {
  const memory = getOrCreateMemory(userId);

  return {
    // Streak facts
    personalBestStreak: memory.longestStreak,
    personalBestStreakDate: memory.longestStreakDate,

    // Session quality facts
    personalBestQuality: memory.bestSessionQuality,
    personalAverageQuality: Math.round(memory.averageSessionQuality),

    // Time preference
    productiveTimeOfDay: memory.mostProductiveTimeOfDay,

    // Session preferences
    preferredDuration: memory.mostUsedSessionDuration,
    favoriteSessionType: memory.favoriteSessionType,

    // Progress facts
    totalSessions: memory.totalSessionsCompleted,
    totalFocusHours: Math.round(memory.totalFocusMinutes / 60),

    // Boss facts
    lastBossDefeated: memory.lastBossDefeated,

    // Resilience facts
    comebackCount: memory.comebackCount,

    // Generated insights for messages
    personalizedInsights: generateInsights(memory),
  };
}

export function generatePersonalizedMessage(userId: string, baseMessage: string, category: string): string {
  const memory = getOrCreateMemory(userId);
  const context = getPersonalizedContext(userId);

  // Replace memory variables in message
  let personalized = baseMessage;

  // Streak references
  if (personalized.includes('{{personalBestStreak}}')) {
    personalized = personalized.replace(/\{\{personalBestStreak\}\}/g, String(memory.longestStreak));
  }

  // Quality references
  if (personalized.includes('{{personalBestQuality}}')) {
    personalized = personalized.replace(/\{\{personalBestQuality\}\}/g, String(memory.bestSessionQuality));
  }

  // Time preference references
  if (personalized.includes('{{productiveTimeOfDay}}') && memory.mostProductiveTimeOfDay) {
    personalized = personalized.replace(/\{\{productiveTimeOfDay\}\}/g, memory.mostProductiveTimeOfDay);
  }

  // Total progress references
  if (personalized.includes('{{totalSessions}}')) {
    personalized = personalized.replace(/\{\{totalSessions\}\}/g, String(memory.totalSessionsCompleted));
  }

  if (personalized.includes('{{totalFocusHours}}')) {
    personalized = personalized.replace(/\{\{totalFocusHours\}\}/g, String(Math.round(memory.totalFocusMinutes / 60)));
  }

  // Boss references
  if (personalized.includes('{{lastBossDefeated}}') && memory.lastBossDefeated) {
    personalized = personalized.replace(/\{\{lastBossDefeated\}\}/g, memory.lastBossDefeated);
  }

  // Resilience references
  if (personalized.includes('{{comebackCount}}')) {
    personalized = personalized.replace(/\{\{comebackCount\}\}/g, String(memory.comebackCount));
  }

  return personalized;
}