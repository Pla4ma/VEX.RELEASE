/**
 * Companion Profile Service
 *
 * Handles companion profile persistence and basic operations.
 * Split from main service to maintain file size limits.
 */

import { z } from 'zod';
import { spendCurrency } from '../economy/wallet-service';
import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';

const profileSchema = z.object({
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

type CompanionProfile = z.infer<typeof profileSchema>;
type PersistOptions = { skipSyncEnqueue?: boolean };

const storage = getDefaultStorageAdapter();

function profileKey(userId: string): string {
  return `companion_profile_${userId}`;
}

function getMoodFromFeedTime(lastFedAt: number): CompanionProfile['mood'] {
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

function getDefaultProfile(userId: string): CompanionProfile {
  const lastFedAt = Date.now();
  return {
    id: `companion_${userId}`,
    name: 'Vexling',
    type: 'focus_wisp',
    mood: 'happy',
    level: 1,
    xp: 0,
    lastFedAt,
    lastPettedAt: null,
    specialAbilityCharge: 0,
    equippedItems: [],
    unlockedAbilities: [],
  };
}

async function loadProfile(userId: string): Promise<CompanionProfile> {
  const raw = await storage.getItem(profileKey(userId));
  if (!raw) {
    return getDefaultProfile(userId);
  }
  const parsed = profileSchema.parse(JSON.parse(raw));
  return { ...parsed, mood: getMoodFromFeedTime(parsed.lastFedAt) };
}

async function saveProfile(
  userId: string,
  profile: CompanionProfile,
): Promise<CompanionProfile> {
  const next = { ...profile, mood: getMoodFromFeedTime(profile.lastFedAt) };
  await storage.setItem(profileKey(userId), JSON.stringify(next));
  return next;
}

function getAbilityUnlocks(
  level: number,
): CompanionProfile['unlockedAbilities'] {
  return [
    ...(level >= 5 ? (['xp_boost_5pct'] as const) : []),
    ...(level >= 10 ? (['coin_boost_10pct'] as const) : []),
    ...(level >= 20 ? (['streak_protection'] as const) : []),
  ];
}

export async function getCompanion(userId: string): Promise<CompanionProfile> {
  return loadProfile(userId);
}

export async function levelUpCompanion(
  userId: string,
): Promise<CompanionProfile> {
  const current = await loadProfile(userId);
  const nextLevel = Math.max(1, Math.floor(current.xp / 500) + 1);
  return saveProfile(userId, {
    ...current,
    level: nextLevel,
    unlockedAbilities: getAbilityUnlocks(nextLevel),
  });
}

export async function feedCompanion(
  userId: string,
  options: PersistOptions = {},
): Promise<CompanionProfile> {
  const spendResult = await spendCurrency({
    userId,
    currency: 'COINS',
    amount: 10,
    sink: 'UPGRADE',
    description: 'Feed companion',
  });
  if (!spendResult.success) {
    throw new Error(spendResult.error?.message ?? 'Failed to spend currency for companion feed');
  }
  const current = await loadProfile(userId);
  const updated = await saveProfile(userId, {
    ...current,
    xp: current.xp + 50,
    lastFedAt: Date.now(),
    mood: 'happy',
  });
  const leveled = await levelUpCompanion(userId);
  options.skipSyncEnqueue;
  return { ...leveled, mood: updated.mood };
}

export async function getCompanionBonus(userId: string): Promise<{
  xpMultiplier: number;
  coinMultiplier: number;
  streakProtection: boolean;
  mood: CompanionProfile['mood'];
}> {
  const companion = await loadProfile(userId);
  const moodMultiplier = { happy: 1.1, neutral: 1, sad: 0.95, starving: 0.9 }[
    companion.mood
  ];
  return {
    xpMultiplier:
      moodMultiplier *
      (companion.unlockedAbilities.includes('xp_boost_5pct') ? 1.05 : 1),
    coinMultiplier: companion.unlockedAbilities.includes('coin_boost_10pct')
      ? 1.1
      : 1,
    streakProtection: companion.unlockedAbilities.includes('streak_protection'),
    mood: companion.mood,
  };
}
