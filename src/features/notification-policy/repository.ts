import { storage } from "../../store/mmkv-storage";
import type { NudgeSignalRecord } from "./schemas";

const DISMISS_PREFIX = "notification-policy:dismissals:";
const SIGNAL_PREFIX = "notification-policy:signals:";

export async function getStoredRecentDismissals(
  userId: string,
): Promise<number> {
  const raw = storage.getString(`${DISMISS_PREFIX}${userId}`);
  const count = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(count) ? count : 0;
}

export async function recordStoredDismissal(userId: string): Promise<number> {
  const next = (await getStoredRecentDismissals(userId)) + 1;
  storage.set(`${DISMISS_PREFIX}${userId}`, String(next));
  return next;
}

export async function recordSignal(record: NudgeSignalRecord): Promise<void> {
  const key = `${SIGNAL_PREFIX}${record.userId}`;
  const existing = getSignals(record.userId);
  existing.push(record);
  storage.set(key, JSON.stringify(existing.slice(-20)));
}

export function getSignals(userId: string): NudgeSignalRecord[] {
  const raw = storage.getString(`${SIGNAL_PREFIX}${userId}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as NudgeSignalRecord[];
  } catch (error: unknown) {
    return [];
  }
}

export function resetSignals(userId: string): void {
  storage.delete(`${SIGNAL_PREFIX}${userId}`);
}

export function getDismissalCountForLane(userId: string, lane: string): number {
  const signals = getSignals(userId);
  return signals.filter((s) => s.signal === "dismissed" && s.lane === lane)
    .length;
}

export function resetDismissals(userId: string): void {
  storage.delete(`${DISMISS_PREFIX}${userId}`);
}
