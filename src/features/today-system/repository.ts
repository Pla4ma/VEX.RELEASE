import { storage } from '../../store/mmkv-storage';
import { TodaySystemSchema, type TodaySystem } from './schemas';

const KEY_PREFIX = 'today-system:';

export async function getStoredTodaySystem(userId: string): Promise<TodaySystem | null> {
  const raw = storage.getString(`${KEY_PREFIX}${userId}`);
  if (!raw) return null;
  return TodaySystemSchema.parse(JSON.parse(raw));
}

export async function saveStoredTodaySystem(userId: string, system: TodaySystem): Promise<TodaySystem> {
  const parsed = TodaySystemSchema.parse(system);
  storage.set(`${KEY_PREFIX}${userId}`, JSON.stringify(parsed));
  return parsed;
}
