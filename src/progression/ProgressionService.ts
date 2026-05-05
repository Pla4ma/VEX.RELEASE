import { addXp } from '../features/progression/service';
import type { XpSource } from '../features/progression/schemas';

export type ProgressionServiceState = {
  currentLevel: number;
  level: number;
  totalXp: number;
  xp: number;
  progressPercent: number;
  xpToNextLevel: number;
};

export type LevelState = ProgressionServiceState;

export type ProgressionService = {
  addXP: (
    amount: number,
    source: string,
    options?: { metadata?: Record<string, unknown>; sessionId?: string }
  ) => Promise<void>;
  getState: () => ProgressionServiceState;
  canPrestige: () => boolean;
  prestige: () => Promise<void>;
};

const DEFAULT_STATE: ProgressionServiceState = {
  currentLevel: 1,
  level: 1,
  totalXp: 0,
  xp: 0,
  progressPercent: 0,
  xpToNextLevel: 100,
};

function normalizeXpSource(source: string): XpSource {
  if (source === 'STREAK_BONUS' || source === 'BOSS_BONUS' || source === 'SQUAD_BONUS') {
    return source;
  }
  return 'SESSION_COMPLETE';
}

export function getProgressionService(userId?: string): ProgressionService {
  return {
    async addXP(amount, source, options): Promise<void> {
      if (!userId || amount <= 0) {
        return;
      }

      await addXp(userId, {
        userId,
        amount,
        source: normalizeXpSource(source),
        metadata: options?.metadata,
        sessionId: options?.sessionId,
      });
    },
    getState(): ProgressionServiceState {
      return DEFAULT_STATE;
    },
    canPrestige(): boolean {
      return DEFAULT_STATE.level >= 10; // Basic prestige requirement
    },
    async prestige(): Promise<void> {
      if (!this.canPrestige()) {
        throw new Error('Cannot prestige: requirements not met');
      }
      // Reset progression with prestige benefits
      DEFAULT_STATE.level = 1;
      DEFAULT_STATE.totalXp = 0;
      DEFAULT_STATE.xp = 0;
    },
  };
}
