import { captureSilentFailure } from '../../utils/silent-failure';
import type { OfflineQueueEntry, OfflineQueueEntryInput } from './queue';

export function reserveQueueCapacity(queue: OfflineQueueEntry[], entry: OfflineQueueEntryInput, limit: number): void {
  if (queue.length < limit || queue.some((item) => item.idempotencyKey === entry.idempotencyKey)) { return; }
  const evictIndex = queue.findIndex((item) => item.priority === 'low');
  if (evictIndex < 0) {
    const error = new Error('Offline sync storage is full. Reconnect before saving more changes.');
    captureSilentFailure(error, { feature: 'lib', operation: 'offline-queue-overflow', type: 'data' });
    throw error;
  }
  const [evicted] = queue.splice(evictIndex, 1);
  if (evicted) { captureSilentFailure(new Error(`Evicted low-priority entry ${evicted.id}`),
    { feature: 'lib', operation: 'offline-queue-evict', type: 'data' }); }
}
