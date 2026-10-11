import { enqueue, getQueue, clearQueue, processEntry, registerProcessor, isProcessing } from '../queue';
import { reserveQueueCapacity } from '../queue-capacity';
import { pruneQueueEntries, OFFLINE_QUEUE_TTL_MS } from '../queue-maintenance';
import type { OfflineQueueEntry } from '../queue';

beforeEach(() => clearQueue());

it('does not evict a different receipt when updating an existing key at capacity', () => {
  for (let i = 0; i < 100; i += 1) {
    enqueue({ feature: 'sessions', operation: 'CREATE', payload: {}, idempotencyKey: `receipt:${i}` });
  }
  enqueue({ feature: 'sessions', operation: 'CREATE', payload: { enriched: true }, idempotencyKey: 'receipt:0' });
  expect(getQueue()).toHaveLength(100);
  expect(getQueue().some((entry) => entry.idempotencyKey === 'receipt:99')).toBe(true);
});

it('keeps a replacement receipt and releases the old processing lock', async (): Promise<void> => {
  const old = enqueue({ feature: 'sessions', operation: 'CREATE', payload: {}, idempotencyKey: 'receipt' });
  registerProcessor('sessions', 'CREATE', async (): Promise<void> => {
    enqueue({ feature: 'sessions', operation: 'CREATE', payload: { newer: true }, idempotencyKey: 'receipt' });
  });
  await processEntry(old);
  expect(getQueue()).toHaveLength(1);
  expect(getQueue()[0]?.payload.newer).toBe(true);
  expect(isProcessing(old.id)).toBe(false);
});

it('retains old completion receipts for manual repair after the normal queue TTL', () => {
  const entry = enqueue({ feature: 'sessions', operation: 'CREATE', payload: { ledger: {} }, idempotencyKey: 'old-receipt' });
  const entries: OfflineQueueEntry[] = [{ ...entry, createdAt: Date.now() - OFFLINE_QUEUE_TTL_MS - 1 }];
  const persist = jest.fn();
  pruneQueueEntries(entries, jest.fn(), persist);
  expect(entries).toHaveLength(1);
  expect(entries[0]?.status).toBe('dead_letter');
  expect(persist).toHaveBeenCalled();
});

it('reports a full queue without discarding an existing important receipt', () => {
  const entry = enqueue({ feature: 'sessions', operation: 'CREATE', payload: {}, idempotencyKey: 'saved' });
  const entries = [entry];
  expect(() => reserveQueueCapacity(entries, { feature: 'sessions', operation: 'CREATE',
    payload: {}, idempotencyKey: 'new' }, 1)).toThrow('storage is full');
  expect(entries).toEqual([entry]);
});
