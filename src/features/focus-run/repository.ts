import { storage } from '../../store/mmkv-storage';
import { FocusRunSchema, type FocusRun } from './schemas';

const KEY_PREFIX = 'focus-run:';

function keyFor(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

export async function getStoredFocusRun(
  userId: string,
): Promise<FocusRun | null> {
  const raw = storage.getString(keyFor(userId));
  if (!raw) {return null;}
  return FocusRunSchema.parse(JSON.parse(raw));
}

export async function upsertStoredFocusRun(run: FocusRun): Promise<FocusRun> {
  const parsed = FocusRunSchema.parse(run);
  storage.set(keyFor(parsed.userId), JSON.stringify(parsed));
  return parsed;
}
