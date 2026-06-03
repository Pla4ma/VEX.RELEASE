import { captureSilentFailure } from '../../../utils/silent-failure';
import { MMKV } from 'react-native-mmkv';
import type { CoachMemory, SessionFacts, StreakFacts } from './coach-memory-types';
import {
  createEmptyMemory,
  updateProductiveTimeOfDay,
  updateMostUsedDuration,
  generateInsights,
} from './coach-memory-helpers';
import { getMmkvEncryptionKeySync } from '../../../persistence/mmkv-key';

export type { CoachMemory, SessionFacts, StreakFacts };
export { generatePersonalizedMessage, getMemoryBasedSuggestions } from './coach-memory-messages';

let _storage: MMKV | null = null;
function getStorage(): MMKV {
  if (!_storage) {
    _storage = new MMKV({ id: 'coach-memory', encryptionKey: getMmkvEncryptionKeySync() });
  }
  return _storage;
}

const STORAGE_KEY = 'coach_user_memory';

export function getOrCreateMemory(userId: string): CoachMemory {
  const key = `${STORAGE_KEY}_${userId}`;
  const stored = getStorage().getString(key);
  if (stored) {
    try {
      return JSON.parse(stored) as CoachMemory;
    } catch (error) {
      captureSilentFailure(error, {
        feature: 'ai-coach',
        operation: 'network-fallback',
        type: 'network',
      });
    }
  }
  return createEmptyMemory(userId);
}

export function saveMemory(memory: CoachMemory): void {
  const key = `${STORAGE_KEY}_${memory.userId}`;
  getStorage().set(key, JSON.stringify({ ...memory, lastUpdated: Date.now() }));
}

export function updateMemoryAfterSession(
  userId: string,
  session: SessionFacts,
): CoachMemory {
  const memory = getOrCreateMemory(userId);
  memory.totalSessionsCompleted += 1;
  memory.totalFocusMinutes += session.duration;
  if (session.quality > memory.bestSessionQuality) {
    memory.bestSessionQuality = session.quality;
    memory.bestSessionQualityDate = session.completedAt;
  }
  const totalQuality =
    memory.averageSessionQuality * (memory.totalSessionsCompleted - 1) +
    session.quality;
  memory.averageSessionQuality = totalQuality / memory.totalSessionsCompleted;
  updateProductiveTimeOfDay(memory, session);
  updateMostUsedDuration(memory, session);
  saveMemory(memory);
  return memory;
}

export function updateMemoryAfterStreak(
  userId: string,
  streak: StreakFacts,
): CoachMemory {
  const memory = getOrCreateMemory(userId);
  if (streak.longestDays > memory.longestStreak) {
    memory.longestStreak = streak.longestDays;
    memory.longestStreakDate = Date.now();
  }
  if (streak.wasRecentlyBroken && streak.currentDays > 1) {
    memory.comebackCount += 1;
  }
  saveMemory(memory);
  return memory;
}

export function updateMemoryAfterBossDefeat(
  userId: string,
  bossId: string,
  bossName: string,
): CoachMemory {
  const memory = getOrCreateMemory(userId);
  memory.lastBossDefeated = bossName;
  memory.lastBossDefeatedDate = Date.now();
  saveMemory(memory);
  return memory;
}

export function getPersonalizedContext(
  userId: string,
): Record<string, unknown> {
  const memory = getOrCreateMemory(userId);
  return {
    personalBestStreak: memory.longestStreak,
    personalBestStreakDate: memory.longestStreakDate,
    personalBestQuality: memory.bestSessionQuality,
    personalAverageQuality: Math.round(memory.averageSessionQuality),
    productiveTimeOfDay: memory.mostProductiveTimeOfDay,
    preferredDuration: memory.mostUsedSessionDuration,
    favoriteSessionType: memory.favoriteSessionType,
    totalSessions: memory.totalSessionsCompleted,
    totalFocusMinutes: memory.totalFocusMinutes,
    lastBossDefeated: memory.lastBossDefeated,
    comebackCount: memory.comebackCount,
    personalizedInsights: generateInsights(memory),
  };
}

export function clearMemory(userId: string): void {
  const key = `${STORAGE_KEY}_${userId}`;
  getStorage().delete(key);
}

export function getMemoryStats(userId: string): {
  exists: boolean;
  lastUpdated: number | null;
  dataSize: number;
} {
  const key = `${STORAGE_KEY}_${userId}`;
  const stored = getStorage().getString(key);
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
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'ai-coach',
      operation: 'network-fallback',
      type: 'network',
    });
    return { exists: true, lastUpdated: null, dataSize: stored.length };
  }
}

export type { CoachMemory as CoachMemoryType };
