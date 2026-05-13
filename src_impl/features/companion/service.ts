import { CompanionMood, CompanionPhase, CompanionSessionEvent, CompanionState } from './types';
import { CompanionGrowthService } from './growth-service';
import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { getEconomyService } from '../../economy/EconomyService';
import { z } from 'zod';
let companionServiceInstance: CompanionService | null = null;
// ============================================================================
// Standalone function-based API (for direct use without class instance)
// ============================================================================

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
  unlockedAbilities: z.array(z.enum(['xp_boost_5pct', 'coin_boost_10pct', 'streak_protection'])),
});

type _CompanionProfile = z.infer<typeof _profileSchema>;

function _profileKey(userId: string): string {
  return `companion_profile_${userId}`;
}

function _getMoodFromFeedTime(lastFedAt: number): _CompanionProfile['mood'] {
  const hours = (Date.now() - lastFedAt) / (1000 * 60 * 60);
  if (hours < 12) { return 'happy'; }
  if (hours < 24) { return 'neutral'; }
  if (hours < 48) { return 'sad'; }
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
  if (!raw) { return _getDefaultProfile(userId); }
  const parsed = _profileSchema.parse(JSON.parse(raw));
  return { ...parsed, mood: _getMoodFromFeedTime(parsed.lastFedAt) };
}

async function _saveProfile(userId: string, profile: _CompanionProfile): Promise<_CompanionProfile> {
  const storage = getDefaultStorageAdapter();
  const next = { ...profile, mood: _getMoodFromFeedTime(profile.lastFedAt) };
  await storage.setItem(_profileKey(userId), JSON.stringify(next));
  return next;
}

function _getAbilityUnlocks(level: number): _CompanionProfile['unlockedAbilities'] {
  return [
    ...(level >= 5 ? (['xp_boost_5pct'] as const) : []),
    ...(level >= 10 ? (['coin_boost_10pct'] as const) : []),
    ...(level >= 20 ? (['streak_protection'] as const) : []),
  ];
}

type SessionEvent =
  | { type: 'session_complete'; duration: number; quality: 'good' | 'average' | 'poor' }
  | { type: 'streak_milestone'; streakDays: number };
export * from "./service.types";
export * from "./service.part1";
export * from "./service.part2";
