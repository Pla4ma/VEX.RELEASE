import type { OfflineQueueEntry } from './queue';

export interface ConflictResolution {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  resolvedData?: Record<string, unknown>;
}

export const OFFLINE_QUEUE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function resolveConflict(
  serverData: Record<string, unknown>,
  clientData: Record<string, unknown>,
  strategy: ConflictResolution['strategy'],
): Record<string, unknown> {
  switch (strategy) {
    case 'client-wins':
      return { ...serverData, ...clientData, _resolvedAt: Date.now() };
    case 'server-wins':
      return { ...serverData, _resolvedAt: Date.now() };
    case 'merge':
      return { ...serverData, ...clientData, _resolvedAt: Date.now() };
    default:
      throw new Error('Manual conflict resolution required');
  }
}

export function pruneQueueEntries(
  queue: OfflineQueueEntry[],
  notify: () => void,
  persist: () => void,
): void {
  const cutoff = Date.now() - OFFLINE_QUEUE_TTL_MS;
  const before = queue.length;
  for (let index = queue.length - 1; index >= 0; index -= 1) {
    if ((queue[index]?.createdAt ?? 0) < cutoff) {
      const entry = queue[index];
      if (entry?.feature === 'sessions' && entry.operation === 'CREATE' && entry.payload.ledger) {
        if (entry.status !== 'dead_letter') {
          queue[index] = { ...entry, status: 'dead_letter', deadLetteredAt: Date.now(),
            error: 'Completion needs manual repair after a long offline period' };
          persist();
          notify();
        }
      } else { queue.splice(index, 1); }
    }
  }
  if (queue.length < before) {
    notify();
    persist();
  }
}
