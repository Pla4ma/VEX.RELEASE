import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * Coach Memory Service
 *
 * Phase 9.2 — Coach memory via user history
 * Stores key facts about user in MMKV for personalized coaching messages.
 */

import { MMKV } from 'react-native-mmkv';

// Storage instance for coach memory
const storage = new MMKV({
  id: 'coach-memory',
  encryptionKey: 'coach-memory-key',
});

const STORAGE_KEY = 'coach_user_memory';

// ============================================================================
// Memory Types
// ============================================================================

export interface CoachMemory {
  userId: string;
  longestStreak: number;
  longestStreakDate: number | null; // timestamp
  bestSessionQuality: number; // 0-100
  bestSessionQualityDate: number | null;
  mostProductiveTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | null;
  mostUsedSessionDuration: number; // minutes
  totalSessionsCompleted: number;
  totalFocusMinutes: number;
  lastBossDefeated: string | null;
  lastBossDefeatedDate: number | null;
  favoriteSessionType: string | null;
  averageSessionQuality: number;
  comebackCount: number; // Number of times streak was broken and rebuilt
  lastUpdated: number;
}

export interface SessionFacts {
  duration: number;
  quality: number;
  completedAt: number;
  sessionType: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface StreakFacts {
  currentDays: number;
  longestDays: number;
  lastQualifyingSessionAt: number;
  wasRecentlyBroken: boolean;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get or initialize coach memory for a user
 */
export function getOrCreateMemory(userId: string): CoachMemory {
  const key = `${STORAGE_KEY}_${userId}`;
  const stored = storage.getString(key);

  if (stored) {
    try {
      return JSON.parse(stored) as CoachMemory;
    } catch (error) { captureSilentFailure(error, { feature: 'ai-coach', operation: 'network-fallback', type: 'network' });
      // Invalid stored data, create fresh
    }
  }

  return createEmptyMemory(userId);
}

/**
 * Save memory to storage
 */
export function saveMemory(memory: CoachMemory): void {
  const key = `${STORAGE_KEY}_${memory.userId}`;
  storage.set(key, JSON.stringify({
    ...memory,
    lastUpdated: Date.now(),
  }));
}

/**
 * Update memory after session completion
 * Called by session service after each completed session
 */
export function updateMemoryAfterSession(
  userId: string,
  session: SessionFacts
): CoachMemory {
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

/**
 * Update memory after streak change
 */
export function updateMemoryAfterStreak(
  userId: string,
  streak: StreakFacts
): CoachMemory {
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

/**
 * Update memory after boss defeat
 */
export function updateMemoryAfterBossDefeat(
  userId: string,
  bossId: string,
  bossName: string
): CoachMemory {
  const memory = getOrCreateMemory(userId);

  memory.lastBossDefeated = bossName;
  memory.lastBossDefeatedDate = Date.now();

  saveMemory(memory);
  return memory;
}

/**
 * Get personalized message context based on memory
 * Used by message generator to include personal facts
 */
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

/**
 * Generate personalized coach message using memory
 */
export function generatePersonalizedMessage(
  userId: string,
  baseMessage: string,
  category: string
): string {
  const memory = getOrCreateMemory(userId);
  const context = getPersonalizedContext(userId);

  // Replace memory variables in message
  let personalized = baseMessage;

  // Streak references
  if (personalized.includes('{{personalBestStreak}}')) {
    personalized = personalized.replace(
      /\{\{personalBestStreak\}\}/g,
      String(memory.longestStreak)
    );
  }

  // Quality references
  if (personalized.includes('{{personalBestQuality}}')) {
    personalized = personalized.replace(
      /\{\{personalBestQuality\}\}/g,
      String(memory.bestSessionQuality)
    );
  }

  // Time preference references
  if (personalized.includes('{{productiveTimeOfDay}}') && memory.mostProductiveTimeOfDay) {
    personalized = personalized.replace(
      /\{\{productiveTimeOfDay\}\}/g,
      memory.mostProductiveTimeOfDay
    );
  }

  // Total progress references
  if (personalized.includes('{{totalSessions}}')) {
    personalized = personalized.replace(
      /\{\{totalSessions\}\}/g,
      String(memory.totalSessionsCompleted)
    );
  }

  if (personalized.includes('{{totalFocusHours}}')) {
    personalized = personalized.replace(
      /\{\{totalFocusHours\}\}/g,
      String(Math.round(memory.totalFocusMinutes / 60))
    );
  }

  // Boss references
  if (personalized.includes('{{lastBossDefeated}}') && memory.lastBossDefeated) {
    personalized = personalized.replace(
      /\{\{lastBossDefeated\}\}/g,
      memory.lastBossDefeated
    );
  }

  // Resilience references
  if (personalized.includes('{{comebackCount}}')) {
    personalized = personalized.replace(
      /\{\{comebackCount\}\}/g,
      String(memory.comebackCount)
    );
  }

  return personalized;
}

/**
 * Get memory-based message suggestions for specific categories
 */
export function getMemoryBasedSuggestions(
  userId: string,
  category: 'STREAK_RISK' | 'MILESTONE_HYPE' | 'COMEBACK_SUPPORT' | 'PROGRESS_REMINDER'
): string[] {
  const memory = getOrCreateMemory(userId);
  const suggestions: string[] = [];

  switch (category) {
    case 'STREAK_RISK':
      if (memory.longestStreak > 0) {
        suggestions.push(
          `You had a ${memory.longestStreak}-day streak in the past. Let's beat that record!`,
          `Your personal best is ${memory.longestStreak} days. I know you can protect this one.`,
          `You've done ${memory.longestStreak} days before. This current streak could be even longer!`
        );
      }
      break;

    case 'MILESTONE_HYPE':
      if (memory.bestSessionQuality > 90) {
        suggestions.push(
          `Your best session ever scored ${memory.bestSessionQuality}! That kind of focus is legendary.`,
          `Remember that ${memory.bestSessionQuality}-quality session? You're capable of incredible things!`
        );
      }
      if (memory.totalSessionsCompleted > 50) {
        suggestions.push(
          `${memory.totalSessionsCompleted} total sessions! You're building something amazing.`,
          `Over ${Math.round(memory.totalFocusMinutes / 60)} hours of focused work. That's dedication!`
        );
      }
      break;

    case 'COMEBACK_SUPPORT':
      if (memory.comebackCount > 0) {
        suggestions.push(
          `This is comeback #${memory.comebackCount} for you. Each one made you stronger.`,
          `You've bounced back ${memory.comebackCount} times before. This is just the next chapter.`,
          `Your ${memory.comebackCount} previous comebacks prove your resilience. Let's make this #${memory.comebackCount + 1}!`
        );
      }
      if (memory.longestStreak > 7) {
        suggestions.push(
          `That ${memory.longestStreak}-day streak? You built that. You can build again.`,
          'You\'ve done long streaks before. The ability is still there.'
        );
      }
      break;

    case 'PROGRESS_REMINDER':
      if (memory.mostProductiveTimeOfDay) {
        suggestions.push(
          `Your most productive time tends to be ${memory.mostProductiveTimeOfDay}s. Use that knowledge!`,
          `You've crushed sessions during ${memory.mostProductiveTimeOfDay} before. That's your power time!`
        );
      }
      if (memory.mostUsedSessionDuration > 0) {
        suggestions.push(
          `${memory.mostUsedSessionDuration} minutes is your sweet spot. Stick with what works!`,
          `You've preferred ${memory.mostUsedSessionDuration}-minute sessions. Trust that pattern.`
        );
      }
      break;
  }

  return suggestions;
}

/**
 * Clear all memory for a user (for testing/debugging)
 */
export function clearMemory(userId: string): void {
  const key = `${STORAGE_KEY}_${userId}`;
  storage.delete(key);
}

/**
 * Get all memory statistics for debugging
 */
export function getMemoryStats(userId: string): {
  exists: boolean;
  lastUpdated: number | null;
  dataSize: number;
} {
  const key = `${STORAGE_KEY}_${userId}`;
  const stored = storage.getString(key);

  if (!stored) {
    return { exists: false, lastUpdated: null, dataSize: 0 };
  }

  try {
    const parsed = JSON.parse(stored) as CoachMemory;
    return {
      exists: true,
      lastUpdated: parsed.lastUpdated,
      dataSize: stored.length,
    };
  } catch (error) { captureSilentFailure(error, { feature: 'ai-coach', operation: 'network-fallback', type: 'network' });
    return { exists: true, lastUpdated: null, dataSize: stored.length };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function createEmptyMemory(userId: string): CoachMemory {
  return {
    userId,
    longestStreak: 0,
    longestStreakDate: null,
    bestSessionQuality: 0,
    bestSessionQualityDate: null,
    mostProductiveTimeOfDay: null,
    mostUsedSessionDuration: 25, // Default Pomodoro
    totalSessionsCompleted: 0,
    totalFocusMinutes: 0,
    lastBossDefeated: null,
    lastBossDefeatedDate: null,
    favoriteSessionType: null,
    averageSessionQuality: 0,
    comebackCount: 0,
    lastUpdated: Date.now(),
  };
}

function updateProductiveTimeOfDay(
  memory: CoachMemory,
  session: SessionFacts
): void {
  // Track time of day productivity using a simple counter
  // In production, this would use more sophisticated analysis
  const timeCounts: Record<string, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  // Get existing counts from memory (if stored)
  // For now, we'll use a simple recency-based approach
  if (memory.mostProductiveTimeOfDay) {
    timeCounts[memory.mostProductiveTimeOfDay] = 1;
  }

  // Weight by session quality
  const qualityWeight = session.quality / 100;
  timeCounts[session.timeOfDay] += qualityWeight;

  // Find most productive
  let maxTime: string | null = null;
  let maxCount = 0;

  for (const [time, count] of Object.entries(timeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxTime = time;
    }
  }

  if (maxTime) {
    memory.mostProductiveTimeOfDay = maxTime as CoachMemory['mostProductiveTimeOfDay'];
  }
}

function updateMostUsedDuration(
  memory: CoachMemory,
  session: SessionFacts
): void {
  // Simple approach: update if this duration is different and high quality
  // In production, this would track actual frequency
  if (session.quality >= 70) {
    // Slight preference for quality sessions
    const currentDiff = Math.abs(session.duration - memory.mostUsedSessionDuration);
    if (currentDiff < 5 || memory.totalSessionsCompleted < 5) {
      // Gradually shift towards most common successful duration
      const alpha = 0.1; // Learning rate
      memory.mostUsedSessionDuration = Math.round(
        memory.mostUsedSessionDuration * (1 - alpha) + session.duration * alpha
      );
    }
  }
}

function generateInsights(memory: CoachMemory): string[] {
  const insights: string[] = [];

  if (memory.longestStreak >= 14) {
    insights.push('You have elite-level consistency (14+ day streaks)');
  } else if (memory.longestStreak >= 7) {
    insights.push('You build strong weekly habits (7+ day streaks)');
  }

  if (memory.bestSessionQuality >= 90) {
    insights.push('You are capable of elite focus sessions (90+ quality)');
  }

  if (memory.totalFocusMinutes >= 600) {
    insights.push('You are a 10+ hour focus veteran');
  }

  if (memory.comebackCount >= 2) {
    insights.push('You have proven resilience (multiple comebacks)');
  }

  return insights;
}

// ============================================================================
// Export Types
// ============================================================================

export type { CoachMemory as CoachMemoryType };
