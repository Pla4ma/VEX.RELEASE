import { addXp } from '../features/progression/service';
import type { XpSource } from '../features/progression/schemas';

export type ProgressionServiceState = {
  currentLevel: number;
  level: number;
  totalXp: number;
  xp: number;
};

export type ProgressionService = {
  addXP: (
    amount: number,
    source: string,
    options?: { metadata?: Record<string, unknown>; sessionId?: string }
  ) => Promise<void>;
  getState: () => ProgressionServiceState;
};

const DEFAULT_STATE: ProgressionServiceState = {
  currentLevel: 1,
  level: 1,
  totalXp: 0,
  xp: 0,
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
  };
}
