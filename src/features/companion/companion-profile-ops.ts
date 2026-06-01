/**
 * Companion Profile Operations
 *
 * Standalone async functions for companion profile CRUD,
 * session event processing, ability unlocks, and bonuses.
 * Uses MMKV storage for persistence.
 */

import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { z } from 'zod';

const _profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  mood: z.enum(['happy', 'neutral', 'sad', 'starving']),
  level: z.number().min(1),
  xp: z.number().min(0),
  lastFedAt: z.number(),
  lastPettedAt: z.number().nullable(),
  specialAbilityCharge: z.number().min(0),
  equippedItems: z.array(z.string()),
  unlockedAbilities: z.array(
    z.enum(['xp_boost_5pct', 'coin_boost_10pct', 'streak_protection']),
  ),
});

type _CompanionProfile = z.infer<typeof _profileSchema>;

function _profileKey(userId: string): string {
  return `companion_profile_${userId}`;
}

function _getMoodFromFeedTime(lastFedAt: number): _CompanionProfile['mood'] {
  const hours = (Date.now() - lastFedAt) / (1000 * 60 * 60);
  if (hours < 12) {
    return 'happy';
  }
  if (hours < 24) {
    return 'neutral';
  }
  if (hours < 48) {
    return 'sad';
  }
  return 'starving';
}

function _getDefaultProfile(userId: string): _CompanionProfile {
  return {
    id: `companion_${userId}`,
    name: 'Vexling',
    type: 'focus_wisp',
    mood: 'happy',
    level: 1,
    xp: 0,
    lastFedAt: Date.now(),
    lastPettedAt: null,
    specialAbilityCharge: 0,
    equippedItems: [],
    unlockedAbilities: [],
  };
}

async function _loadProfile(userId: string): Promise<_CompanionProfile> {
  const storage = getDefaultStorageAdapter();
  const raw = await storage.getItem(_profileKey(userId));
  if (!raw) {
    return _getDefaultProfile(userId);
  }
  const parsed = _profileSchema.parse(JSON.parse(raw));
  return { ...parsed, mood: _getMoodFromFeedTime(parsed.lastFedAt) };
}

async function _saveProfile(
  userId: string,
  profile: _CompanionProfile,
): Promise<_CompanionProfile> {
  const storage = getDefaultStorageAdapter();
  const next = { ...profile, mood: _getMoodFromFeedTime(profile.lastFedAt) };
  await storage.setItem(_profileKey(userId), JSON.stringify(next));
  return next;
}

function _getAbilityUnlocks(
  level: number,
): _CompanionProfile['unlockedAbilities'] {
  return [
    ...(level >= 5 ? (['xp_boost_5pct'] as const) : []),
    ...(level >= 10 ? (['coin_boost_10pct'] as const) : []),
    ...(level >= 20 ? (['streak_protection'] as const) : []),
  ];
}

type SessionEvent =
  | {
      type: 'session_complete';
      duration: number;
      quality: 'good' | 'average' | 'poor';
    }
  | { type: 'streak_milestone'; streakDays: number };

export async function getCompanion(userId: string): Promise<_CompanionProfile> {
  return _loadProfile(userId);
}

export async function feedCompanion(
  userId: string,
  options: { skipSyncEnqueue?: boolean } = {},
): Promise<_CompanionProfile> {
  void options;
  const current = await _loadProfile(userId);
  return _saveProfile(userId, {
    ...current,
    xp: current.xp + 50,
    lastFedAt: Date.now(),
    mood: 'happy',
  });
}

export async function petCompanion(userId: string): Promise<_CompanionProfile> {
  const current = await _loadProfile(userId);
  return _saveProfile(userId, { ...current, lastPettedAt: Date.now() });
}

export async function levelUpCompanion(
  userId: string,
): Promise<_CompanionProfile> {
  const current = await _loadProfile(userId);
  const nextLevel = Math.max(1, Math.floor(current.xp / 500) + 1);
  return _saveProfile(userId, {
    ...current,
    level: nextLevel,
    unlockedAbilities: _getAbilityUnlocks(nextLevel),
  });
}

export async function processSessionEvent(
  userId: string,
  event: SessionEvent,
): Promise<_CompanionProfile> {
  const current = await _loadProfile(userId);
  let xpGain = 0;
  let chargeGain = 0;
  if (event.type === 'session_complete') {
    const qualityMultiplier =
      { good: 1.5, average: 1.0, poor: 0.5 }[event.quality] ?? 1;
    xpGain = Math.floor(event.duration * 4 * qualityMultiplier);
  } else if (event.type === 'streak_milestone') {
    chargeGain = Math.min(50, event.streakDays * 5);
  }
  return _saveProfile(userId, {
    ...current,
    xp: current.xp + xpGain,
    specialAbilityCharge: Math.min(
      100,
      current.specialAbilityCharge + chargeGain,
    ),
  });
}

export async function getCompanionBonuses(
  userId: string,
): Promise<{ xpBoost: number; coinBoost: number; streakProtection: boolean }> {
  const profile = await _loadProfile(userId);
  return {
    xpBoost: profile.unlockedAbilities.includes('xp_boost_5pct') ? 0.05 : 0,
    coinBoost: profile.unlockedAbilities.includes('coin_boost_10pct') ? 0.1 : 0,
    streakProtection: profile.unlockedAbilities.includes('streak_protection'),
  };
}

export async function canUseSpecialAbility(userId: string): Promise<boolean> {
  const profile = await _loadProfile(userId);
  return profile.specialAbilityCharge >= 100;
}

export async function useSpecialAbility(
  userId: string,
): Promise<{ success: boolean; effect: string }> {
  const profile = await _loadProfile(userId);
  if (profile.specialAbilityCharge < 100) {
    throw new Error('Special ability not charged');
  }
  await _saveProfile(userId, { ...profile, specialAbilityCharge: 0 });
  return { success: true, effect: 'xp_boost' };
}
