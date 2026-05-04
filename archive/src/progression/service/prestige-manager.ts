import { getRewardService } from '../../rewards/RewardService';
import { getEconomyService } from '../../economy/EconomyService';
import { eventBus } from '../../events';
import { createDebugger } from '../../utils/debug';
import { PrestigeHistoryEntrySchema, type LevelState, type LevelConfig, type PrestigeRewardPreview } from '../schemas';
import { calculateXPForLevel } from './state-manager';

const debug = createDebugger('progression:prestige');

export function getSeasonalPrestigeBonus(nextPrestige: number): number {
  return nextPrestige * 250;
}

export function getPrestigeRewardPreview(state: LevelState): PrestigeRewardPreview {
  const nextPrestige = state.prestige + 1;
  return {
    gems: 5 * nextPrestige,
    badge: `prestige_${nextPrestige}`,
    seasonalBonus: getSeasonalPrestigeBonus(nextPrestige),
  };
}

export function canPrestige(state: LevelState, config: LevelConfig): boolean {
  return state.currentLevel >= config.maxLevel && config.prestigeEnabled;
}

export async function prestige(
  userId: string,
  state: LevelState,
  config: LevelConfig,
): Promise<LevelState> {
  if (!canPrestige(state, config)) {
    throw new Error('Prestige is not available');
  }

  const previousLevel = state.currentLevel;
  const resetXP = state.currentXP;
  const preview = getPrestigeRewardPreview(state);
  const nextPrestige = state.prestige + 1;
  const rewardService = getRewardService(userId);
  const economyService = getEconomyService(userId);

  const gemsReward = await rewardService.grantReward(
    'PREMIUM',
    'SEASON_REWARD',
    { baseAmount: preview.gems },
    { exactAmount: preview.gems, prestige: nextPrestige, source: 'PRESTIGE' },
  );

  await economyService.addCurrency(
    'SEASONAL',
    preview.seasonalBonus,
    'PRESTIGE',
    { exactAmount: preview.seasonalBonus, prestige: nextPrestige, seasonId: 'current', badge: preview.badge },
  );

  eventBus.publish('achievement:unlock', { achievementId: preview.badge, userId });

  const historyEntry = PrestigeHistoryEntrySchema.parse({
    prestige: nextPrestige,
    timestamp: Date.now(),
    previousLevel,
    gems: preview.gems,
    badge: preview.badge,
    seasonalBonus: preview.seasonalBonus,
  });

  const newState: LevelState = {
    ...state,
    prestige: nextPrestige,
    currentLevel: 1,
    currentXP: 0,
    xpToNextLevel: calculateXPForLevel(1, config),
    progressPercent: 0,
    prestigeMultiplier: 1 + nextPrestige * 0.1,
    prestigeHistory: [...state.prestigeHistory, historyEntry],
  };

  eventBus.publish('progression:prestige', {
    userId,
    prestige: newState.prestige,
    previousLevel,
    resetXP,
    multiplier: newState.prestigeMultiplier,
  });

  eventBus.publish('social:prestige', {
    userId,
    prestige: newState.prestige,
    previousLevel,
    timestamp: historyEntry.timestamp,
    seasonalBonus: preview.seasonalBonus,
    badge: preview.badge,
    rewards: [gemsReward.id],
  });

  debug.info('Prestige! Level %d reset, prestige %d', previousLevel, newState.prestige);
  return newState;
}
