import { storage } from '../../store/mmkv-storage';
import { FocusMemorySchema, type FocusMemory } from './schemas';

const KEY_PREFIX = 'focus-memory:';

function keyFor(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

export async function readMemories(userId: string): Promise<FocusMemory[]> {
  const raw = storage.getString(keyFor(userId));
  if (!raw) return [];
  return FocusMemorySchema.array().parse(JSON.parse(raw));
}

export async function writeMemories(userId: string, memories: FocusMemory[]): Promise<FocusMemory[]> {
  const parsed = FocusMemorySchema.array().parse(memories);
  storage.set(keyFor(userId), JSON.stringify(parsed));
  return parsed;
}
