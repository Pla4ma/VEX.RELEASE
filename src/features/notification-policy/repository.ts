import { storage } from '../../store/mmkv-storage';

const DISMISS_PREFIX = 'notification-policy:dismissals:';

export async function getStoredRecentDismissals(userId: string): Promise<number> {
  const raw = storage.getString(`${DISMISS_PREFIX}${userId}`);
  const count = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(count) ? count : 0;
}

export async function recordStoredDismissal(userId: string): Promise<number> {
  const next = (await getStoredRecentDismissals(userId)) + 1;
  storage.set(`${DISMISS_PREFIX}${userId}`, String(next));
  return next;
}
