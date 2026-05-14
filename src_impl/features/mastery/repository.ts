import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { masteryStateSchema } from './schemas';
import type { MasteryState } from './types';

const STORAGE_KEY = (userId: string) => `mastery_state_${userId}`;
const storage = getDefaultStorageAdapter();

export function loadStoredMasteryState(userId: string): MasteryState | null {
  const parsed = masteryStateSchema.safeParse(storage.getJSONSync<unknown>(STORAGE_KEY(userId)));
  return parsed.success ? parsed.data : null;
}

export function persistMasteryState(state: MasteryState): MasteryState {
  const nextState = { ...state, updatedAt: Date.now() };
  storage.setJSONSync(STORAGE_KEY(state.userId), nextState);
  return nextState;
}
