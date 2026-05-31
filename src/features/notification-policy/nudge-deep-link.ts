import type { NudgeSignalRecord } from './schemas';
import type { Lane } from '../lane-engine/types';

const RESCUE_IGNORE_TIMEOUT_MS = 30 * 60 * 1000;

export function buildRescueDeepLink(
  rescuePlanId: string,
  taskDescription: string,
  suggestedDurationSeconds: number,
): { type: 'start_rescue'; payload: Record<string, unknown> } {
  return {
    type: 'start_rescue',
    payload: {
      rescuePlanId,
      rescueTaskDescription: taskDescription,
      suggestedDurationSeconds,
      source: 'rescue',
    },
  };
}

export function isRescueDeepLinkValid(deepLink: unknown): boolean {
  if (!deepLink || typeof deepLink !== 'object') {return false;}
  const link = deepLink as Record<string, unknown>;
  return (
    link.type === 'start_rescue' &&
    typeof link.payload === 'object' &&
    link.payload !== null &&
    typeof (link.payload as Record<string, unknown>).rescuePlanId === 'string'
  );
}

export function markExpiredAsIgnored(
  userId: string,
  lane: Lane,
  sentAtOrRecords: number | NudgeSignalRecord[],
): NudgeSignalRecord[] {
  const now = Date.now();
  const cutoff = typeof sentAtOrRecords === 'number' ? sentAtOrRecords : 0;

  const records: NudgeSignalRecord[] =
    typeof sentAtOrRecords === 'number'
      ? []
      : sentAtOrRecords.filter(
          (r) =>
            r.signal === 'sent' &&
            now - r.occurredAt > RESCUE_IGNORE_TIMEOUT_MS,
        );

  if (typeof sentAtOrRecords === 'number') {
    if (now - sentAtOrRecords > RESCUE_IGNORE_TIMEOUT_MS) {
      return [
        {
          userId,
          nudgeType: 'gentle_return',
          signal: 'ignored',
          lane,
          occurredAt: now,
        },
      ];
    }
    return [];
  }

  return records.map((r) => ({
    ...r,
    signal: 'ignored' as const,
    occurredAt: now,
  }));
}
