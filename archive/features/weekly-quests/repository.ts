import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { WeeklyQuestStateSchema, type WeeklyQuestState } from './schemas';

const storage = getMMKVStorageAdapter();

function keyFor(userId: string, weekKey: string): string {
  return `weekly-quest:${userId}:${weekKey}`;
}

export async function fetchWeeklyQuestState(
  userId: string,
  weekKey: string,
): Promise<WeeklyQuestState | null> {
  const raw = await storage.getItem(keyFor(userId, weekKey));
  if (!raw) {
    return null;
  }
  const parsed = WeeklyQuestStateSchema.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : null;
}

export async function saveWeeklyQuestState(state: WeeklyQuestState): Promise<void> {
  const validated = WeeklyQuestStateSchema.parse(state);
  await storage.setItem(keyFor(validated.userId, validated.weekKey), JSON.stringify(validated));
}
