import { CompanionMood, CompanionPhase, CompanionSessionEvent, CompanionState } from "./types";
import { CompanionGrowthService } from "./growth-service";
import { getDefaultStorageAdapter } from "../../persistence/MMKVStorageAdapter";
import { getEconomyService } from "../../economy/EconomyService";
import { z } from "zod";


export function getCompanionService(initialState?: CompanionState): CompanionService {
  if (!companionServiceInstance) {
    companionServiceInstance = new CompanionService(initialState);
  }
  return companionServiceInstance;
}

export function resetCompanionService(): void {
  companionServiceInstance = null;
}

export async function getCompanion(userId: string): Promise<_CompanionProfile> {
  return _loadProfile(userId);
}

export async function feedCompanion(
  userId: string,
  options: { skipSyncEnqueue?: boolean } = {}
): Promise<_CompanionProfile> {
  void options;
  const economy = getEconomyService();
  await economy.spendCurrency(userId, 'COINS', 10, 'companion_feed');
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
  return _saveProfile(userId, {
    ...current,
    lastPettedAt: Date.now(),
  });
}

export async function levelUpCompanion(userId: string): Promise<_CompanionProfile> {
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
  event: SessionEvent
): Promise<_CompanionProfile> {
  const current = await _loadProfile(userId);
  let xpGain = 0;
  let chargeGain = 0;

  if (event.type === 'session_complete') {
    const qualityMultiplier = { good: 1.5, average: 1.0, poor: 0.5 }[event.quality] ?? 1;
    xpGain = Math.floor(event.duration * 4 * qualityMultiplier);
  } else if (event.type === 'streak_milestone') {
    chargeGain = Math.min(50, event.streakDays * 5);
  }

  return _saveProfile(userId, {
    ...current,
    xp: current.xp + xpGain,
    specialAbilityCharge: Math.min(100, current.specialAbilityCharge + chargeGain),
  });
}

export async function getCompanionBonuses(userId: string): Promise<{
  xpBoost: number;
  coinBoost: number;
  streakProtection: boolean;
}> {
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

export async function useSpecialAbility(userId: string): Promise<{ success: boolean; effect: string }> {
  const profile = await _loadProfile(userId);
  if (profile.specialAbilityCharge < 100) {
    throw new Error('Special ability not charged');
  }
  await _saveProfile(userId, { ...profile, specialAbilityCharge: 0 });
  return { success: true, effect: 'xp_boost' };
}