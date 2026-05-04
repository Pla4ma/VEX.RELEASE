import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { createDebugger } from '../../utils/debug';
import { LevelStateSchema, type LevelState, type LevelConfig } from '../schemas';

const debug = createDebugger('progression:state');

export function getInitialState(config: LevelConfig): LevelState {
  return {
    currentLevel: 1,
    currentXP: 0,
    totalXP: 0,
    prestige: 0,
    xpToNextLevel: calculateXPForLevel(1, config),
    progressPercent: 0,
    prestigeMultiplier: 1,
    levelUpHistory: [],
    prestigeHistory: [],
  };
}

export function calculateXPForLevel(level: number, config: LevelConfig): number {
  const xp = Math.floor(config.baseXP * Math.pow(config.growthFactor, level - 1));
  return Math.ceil(xp / 100) * 100;
}

export async function loadState(userId: string, config: LevelConfig): Promise<LevelState | null> {
  try {
    const key = `progression:${userId}`;
    const storage = getMMKVStorageAdapter();
    const data = await storage.getItem(key);

    if (data) {
      const parsed = JSON.parse(data);
      const state = LevelStateSchema.parse({
        ...getInitialState(config),
        ...parsed,
      });
      debug.info('Loaded progression state: Level %d, %d XP', state.currentLevel, state.totalXP);
      return state;
    }
  } catch (error) {
    debug.error('Failed to load progression state', error as Error);
  }
  return null;
}

export async function saveState(userId: string, state: LevelState): Promise<void> {
  try {
    const key = `progression:${userId}`;
    const storage = getMMKVStorageAdapter();
    await storage.setItem(key, JSON.stringify(state));
  } catch (error) {
    debug.error('Failed to save progression state', error as Error);
  }
}

export async function clearState(userId: string): Promise<void> {
  const storage = getMMKVStorageAdapter();
  await storage.removeItem(`progression:${userId}`).catch((error: unknown) => {
    debug.error('Failed to clear progression local state', error as Error);
  });
}
