import { z } from 'zod';

import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import {
  parseJsonWithSchema,
  stringifyJsonSafe,
} from '../../persistence/safe-json';

const SPRINT_CHAIN_WINDOW_MS = 2 * 60 * 60 * 1000;
const SPRINT_CHAIN_COMPLETE_COUNT = 4;

const SprintChainStateSchema = z.object({
  completedCount: z.number().min(0).max(SPRINT_CHAIN_COMPLETE_COUNT),
  lastCompletedAt: z.number().nullable(),
});

export type SprintChainState = z.infer<typeof SprintChainStateSchema>;

function getSprintChainKey(userId: string): string {
  return `session:sprint-chain:${userId}`;
}

function getInitialState(): SprintChainState {
  return {
    completedCount: 0,
    lastCompletedAt: null,
  };
}

export class SprintChainService {
  private storage = getMMKVStorageAdapter();

  async getState(userId: string): Promise<SprintChainState> {
    const key = getSprintChainKey(userId);
    const raw = await this.storage.getItem(key);
    if (!raw) {
      return getInitialState();
    }

    const parsed = parseJsonWithSchema(raw, SprintChainStateSchema, {
      feature: 'session',
      key,
    });
    if (!parsed) {
      await this.reset(userId);
      return getInitialState();
    }

    if (this.isExpired(parsed)) {
      await this.reset(userId);
      return getInitialState();
    }

    return parsed;
  }

  async recordSprintCompleted(
    userId: string,
    completedAt = Date.now(),
  ): Promise<SprintChainState> {
    const current = await this.getState(userId);
    const nextCount =
      current.completedCount >= SPRINT_CHAIN_COMPLETE_COUNT
        ? 1
        : current.completedCount + 1;
    const nextState = SprintChainStateSchema.parse({
      completedCount: nextCount,
      lastCompletedAt: completedAt,
    });

    if (nextCount >= SPRINT_CHAIN_COMPLETE_COUNT) {
      await this.reset(userId);
      return nextState;
    }

    const key = getSprintChainKey(userId);
    const encoded = stringifyJsonSafe(nextState, { feature: 'session', key });
    if (encoded) {
      await this.storage.setItem(key, encoded);
    }
    return nextState;
  }

  async reset(userId: string): Promise<void> {
    await this.storage.removeItem(getSprintChainKey(userId));
  }

  private isExpired(state: SprintChainState): boolean {
    if (!state.lastCompletedAt) {
      return false;
    }

    return Date.now() - state.lastCompletedAt > SPRINT_CHAIN_WINDOW_MS;
  }
}

let sprintChainService: SprintChainService | null = null;

export function getSprintChainService(): SprintChainService {
  if (!sprintChainService) {
    sprintChainService = new SprintChainService();
  }

  return sprintChainService;
}
