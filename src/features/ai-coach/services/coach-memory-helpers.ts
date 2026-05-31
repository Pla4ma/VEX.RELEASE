import type { CoachMemory, SessionFacts } from './coach-memory-types';

export function createEmptyMemory(userId: string): CoachMemory {
  return {
    userId,
    longestStreak: 0,
    longestStreakDate: null,
    bestSessionQuality: 0,
    bestSessionQualityDate: null,
    mostProductiveTimeOfDay: null,
    mostUsedSessionDuration: 25,
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

export function updateProductiveTimeOfDay(
  memory: CoachMemory,
  session: SessionFacts,
): void {
  const timeCounts: Record<string, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };
  if (memory.mostProductiveTimeOfDay) {
    timeCounts[memory.mostProductiveTimeOfDay] = 1;
  }
  const qualityWeight = session.quality / 100;
  timeCounts[session.timeOfDay] =
    (timeCounts[session.timeOfDay] ?? 0) + qualityWeight;
  let maxTime: string | null = null;
  let maxCount = 0;
  for (const [time, count] of Object.entries(timeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxTime = time;
    }
  }
  if (maxTime) {
    memory.mostProductiveTimeOfDay =
      maxTime as CoachMemory['mostProductiveTimeOfDay'];
  }
}

export function updateMostUsedDuration(
  memory: CoachMemory,
  session: SessionFacts,
): void {
  if (session.quality >= 70) {
    const currentDiff = Math.abs(
      session.duration - memory.mostUsedSessionDuration,
    );
    if (currentDiff < 5 || memory.totalSessionsCompleted < 5) {
      const alpha = 0.1;
      memory.mostUsedSessionDuration = Math.round(
        memory.mostUsedSessionDuration * (1 - alpha) + session.duration * alpha,
      );
    }
  }
}

export function generateInsights(memory: CoachMemory): string[] {
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
