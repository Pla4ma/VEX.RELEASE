import { storage } from '../../store/mmkv-storage';
import { RescuePlanSchema, type RescuePlan } from './schemas';

const KEY_PREFIX = 'rescue-mode:active:';

export async function getActiveRescuePlan(userId: string): Promise<RescuePlan | null> {
  const raw = storage.getString(`${KEY_PREFIX}${userId}`);
  if (!raw) return null;
  return RescuePlanSchema.parse(JSON.parse(raw));
}

export async function saveActiveRescuePlan(plan: RescuePlan): Promise<RescuePlan> {
  const parsed = RescuePlanSchema.parse(plan);
  storage.set(`${KEY_PREFIX}${parsed.userId}`, JSON.stringify(parsed));
  return parsed;
}
