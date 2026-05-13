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
// ============================================================================
// Core Functions
// ============================================================================
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

function updateProductiveTimeOfDay(memory: CoachMemory, session: SessionFacts): void {
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

function updateMostUsedDuration(memory: CoachMemory, session: SessionFacts): void {
  // Simple approach: update if this duration is different and high quality
  // In production, this would track actual frequency
  if (session.quality >= 70) {
    // Slight preference for quality sessions
    const currentDiff = Math.abs(session.duration - memory.mostUsedSessionDuration);
    if (currentDiff < 5 || memory.totalSessionsCompleted < 5) {
      // Gradually shift towards most common successful duration
      const alpha = 0.1; // Learning rate
      memory.mostUsedSessionDuration = Math.round(memory.mostUsedSessionDuration * (1 - alpha) + session.duration * alpha);
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
export * from "./coach-memory.types";
export * from "./coach-memory.part1";
export * from "./coach-memory.part2";
