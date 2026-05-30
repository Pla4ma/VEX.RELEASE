import { addXp } from "../features/progression/service";
import type { XpSource } from "../features/progression/schemas";

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
    options?: {
      metadata?: Record<string, unknown>;
      sessionId?: string;
      idempotencyKey?: string;
    },
  ) => Promise<void>;
  getState: () => ProgressionServiceState;
  canPrestige: () => boolean;
  prestige: () => Promise<void>;
};

function normalizeXpSource(source: string): XpSource {
  if (
    source === "STREAK_BONUS" ||
    source === "BOSS_BONUS" ||
    source === "SQUAD_BONUS"
  ) {
    return source;
  }
  return "SESSION_COMPLETE";
}

function createDefaultState(): ProgressionServiceState {
  return {
    currentLevel: 1,
    level: 1,
    totalXp: 0,
    xp: 0,
    progressPercent: 0,
    xpToNextLevel: 100,
  };
}

export function getProgressionService(userId?: string): ProgressionService {
  const state = createDefaultState();

  return {
    async addXP(amount, source, options): Promise<void> {
      if (!userId || amount <= 0) {
        return;
      }

      await addXp(
        userId,
        {
          userId,
          amount,
          source: normalizeXpSource(source),
          metadata: options?.metadata,
          sessionId: options?.sessionId,
        },
        { idempotencyKey: options?.idempotencyKey },
      );
    },
    getState(): ProgressionServiceState {
      return { ...state };
    },
    canPrestige(): boolean {
      return state.level >= 10;
    },
    async prestige(): Promise<void> {
      if (!this.canPrestige()) {
        throw new Error("Cannot prestige: requirements not met");
      }
      state.level = 1;
      state.totalXp = 0;
      state.xp = 0;
    },
  };
}
