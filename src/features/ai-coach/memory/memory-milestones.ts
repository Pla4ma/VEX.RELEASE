import type { CoachMemory } from './memory-schemas';
import { hasMemoryOfType as repoHasMemoryOfType } from '../repository/memories';
import { storeMemory, getMemoriesByType } from './CoachMemory';

export async function checkFirstSGrade(
  userId: string,
  sessionGrade: string,
  sessionQuality: number,
  sessionDate: number,
): Promise<CoachMemory | null> {
  if (sessionGrade !== 'S') {
    return null;
  }
  const existing = await getMemoriesByType(userId, 'FIRST_S_GRADE');
  if (existing.length > 0) {
    return null;
  }
  return storeMemory(
    userId,
    'FIRST_S_GRADE',
    'First S-Grade Session',
    `Achieved first perfect S-grade session with ${sessionQuality}% quality`,
    { grade: sessionGrade, quality: sessionQuality, date: sessionDate },
  );
}

export async function checkLongestSession(
  userId: string,
  sessionDuration: number,
  previousBest: number,
): Promise<CoachMemory | null> {
  if (sessionDuration <= previousBest) {
    return null;
  }
  return storeMemory(
    userId,
    'LONGEST_SESSION',
    'Personal Best Session',
    `Completed longest session ever: ${sessionDuration} minutes`,
    { duration: sessionDuration, previousBest },
  );
}

export async function checkBestStreak(
  userId: string,
  currentStreak: number,
  previousBest: number,
): Promise<CoachMemory | null> {
  if (currentStreak <= previousBest) {
    return null;
  }
  return storeMemory(
    userId,
    'BEST_STREAK',
    `${currentStreak}-Day Streak Record`,
    `Achieved new personal best streak of ${currentStreak} days`,
    { streakDays: currentStreak, previousBest },
  );
}

export async function checkFirstBossDefeated(
  userId: string,
  bossName: string,
  bossTier: number,
): Promise<CoachMemory | null> {
  const hasExisting = await repoHasMemoryOfType(userId, 'FIRST_BOSS_DEFEATED');
  if (hasExisting) {
    return null;
  }
  return storeMemory(
    userId,
    'FIRST_BOSS_DEFEATED',
    `First Boss Defeated: ${bossName}`,
    `Defeated ${bossName} (Tier ${bossTier}) \u2014 your first boss victory!`,
    { bossName, bossTier },
  );
}

export async function checkFirstRivalWin(
  userId: string,
  rivalName: string,
  margin: number,
): Promise<CoachMemory | null> {
  const hasExisting = await repoHasMemoryOfType(userId, 'FIRST_RIVAL_WIN');
  if (hasExisting) {
    return null;
  }
  return storeMemory(
    userId,
    'FIRST_RIVAL_WIN',
    'First Rival Victory',
    `Beat ${rivalName} by ${margin} minutes in weekly competition`,
    { rivalName, margin },
  );
}
