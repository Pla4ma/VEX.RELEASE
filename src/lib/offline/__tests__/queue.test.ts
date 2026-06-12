import { describe, expect, it, jest, beforeEach } from '@jest/globals';

const mockStorageMap = new Map<string, string>();

jest.mock('../../../persistence/MMKVStorageAdapter', () => ({
  MMKVStorageAdapter: jest.fn().mockImplementation(() => ({
    getItemSync: jest.fn((key: string) => mockStorageMap.get(key) ?? null),
    setItemSync: jest.fn((key: string, value: string) => { mockStorageMap.set(key, value); }),
    removeItemSync: jest.fn((key: string) => { mockStorageMap.delete(key); }),
  })),
}));

jest.mock('../../../utils/silent-failure', () => ({
  captureSilentFailure: jest.fn(),
}));

jest.mock('../../../utils/uuid', () => ({
  v4: jest.fn(() => `test-uuid-${Math.random().toString(36).slice(2, 10)}`),
}));

jest.mock('../../repository/base', () => ({
  getConnectionState: jest.fn(() => 'online'),
  subscribeToConnectionChanges: jest.fn(() => jest.fn()),
  updateConnectionState: jest.fn(),
}));

import {
  enqueue,
  dequeue,
  getQueue,
  getQueueLength,
  clearQueue,
  updateEntry,
  markProcessing,
  isProcessing,
  subscribe,
  registerProcessor,
  unregisterProcessor,
  processEntry,
  resolveConflict,
  pruneExpiredEntries,
  OfflineQueueEntrySchema,
  type OfflineQueueEntry,
  type OfflineQueueEntryInput,
} from '../queue';

describe('OfflineQueueEntrySchema', () => {
  it('validates a correct entry', () => {
    const entry = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      operation: 'CREATE' as const,
      feature: 'sessions' as const,
      payload: { userId: '1' },
      idempotencyKey: 'key-1',
      createdAt: Date.now(),
      retryCount: 0,
      maxRetries: 3,
      priority: 'normal' as const,
    };
    expect(OfflineQueueEntrySchema.safeParse(entry).success).toBe(true);
  });

  it('rejects invalid operation', () => {
    expect(OfflineQueueEntrySchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      operation: 'INVALID',
      feature: 'sessions',
      payload: {},
      idempotencyKey: 'key-1',
      createdAt: Date.now(),
    }).success).toBe(false);
  });

  it('applies defaults for optional fields', () => {
    const result = OfflineQueueEntrySchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      operation: 'CREATE',
      feature: 'sessions',
      payload: {},
      idempotencyKey: 'key-1',
      createdAt: Date.now(),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.retryCount).toBe(0);
      expect(result.data.maxRetries).toBe(3);
      expect(result.data.priority).toBe('normal');
    }
  });
});

describe('queue operations', () => {
  beforeEach(() => {
    mockStorageMap.clear();
    clearQueue();
  });

  it('enqueue adds entry to queue', () => {
    const result = enqueue(makeInput());
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeDefined();
    expect(getQueueLength()).toBe(1);
  });

  it('enqueue assigns defaults', () => {
    const result = enqueue(makeInput());
    expect(result.retryCount).toBe(0);
    expect(result.maxRetries).toBe(3);
    expect(result.priority).toBe('normal');
  });

  it('enqueue deduplicates by idempotencyKey', () => {
    const key = 'same-key';
    enqueue(makeInput({ idempotencyKey: key }));
    enqueue(makeInput({ idempotencyKey: key }));
    expect(getQueueLength()).toBe(1);
  });

  it('enqueue inserts high priority before low priority', () => {
    enqueue(makeInput({ priority: 'low' as const, idempotencyKey: 'low-1' }));
    enqueue(makeInput({ priority: 'critical' as const, idempotencyKey: 'crit-1' }));
    enqueue(makeInput({ priority: 'high' as const, idempotencyKey: 'high-1' }));
    const queue = getQueue();
    expect(queue[0]!.priority).toBe('critical');
    expect(queue[1]!.priority).toBe('high');
    expect(queue[2]!.priority).toBe('low');
  });

  it('dequeue removes and returns entry', () => {
    const added = enqueue(makeInput({ idempotencyKey: 'dq-1' }));
    const removed = dequeue(added.id);
    expect(removed).toBeDefined();
    expect(removed!.id).toBe(added.id);
    expect(getQueueLength()).toBe(0);
  });

  it('dequeue returns undefined for missing id', () => {
    expect(dequeue('nonexistent')).toBeUndefined();
  });

  it('getQueue returns frozen copy', () => {
    enqueue(makeInput({ idempotencyKey: 'gq-1' }));
    const queue = getQueue();
    expect(Object.isFrozen(queue)).toBe(true);
  });

  it('clearQueue empties the queue', () => {
    enqueue(makeInput({ idempotencyKey: 'cq-1' }));
    enqueue(makeInput({ idempotencyKey: 'cq-2' }));
    clearQueue();
    expect(getQueueLength()).toBe(0);
  });

  it('updateEntry modifies existing entry', () => {
    const added = enqueue(makeInput({ idempotencyKey: 'ue-1' }));
    updateEntry(added.id, { retryCount: 5 });
    const queue = getQueue();
    expect(queue[0]!.retryCount).toBe(5);
  });

  it('markProcessing marks entry as processing', () => {
    const added = enqueue(makeInput({ idempotencyKey: 'mp-1' }));
    expect(markProcessing(added.id)).toBe(true);
    expect(isProcessing(added.id)).toBe(true);
  });

  it('markProcessing returns false if already processing', () => {
    const added = enqueue(makeInput({ idempotencyKey: 'mp-2' }));
    markProcessing(added.id);
    expect(markProcessing(added.id)).toBe(false);
  });

  it('subscribe receives queue updates', () => {
    const cb = jest.fn();
    const unsub = subscribe(cb);
    enqueue(makeInput({ idempotencyKey: 'sub-1' }));
    expect(cb).toHaveBeenCalled();
    unsub();
  });
});

describe('processEntry', () => {
  beforeEach(() => {
    mockStorageMap.clear();
    clearQueue();
  });

  it('processes entry with registered processor', async () => {
    const processor = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    registerProcessor('sessions', 'CREATE', processor);
    const added = enqueue(makeInput({
      feature: 'sessions' as const,
      operation: 'CREATE' as const,
      idempotencyKey: 'pe-1',
    }));
    await processEntry(added);
    expect(processor).toHaveBeenCalled();
    expect(getQueueLength()).toBe(0);
  });

  it('throws if no processor registered', async () => {
    const added = enqueue(makeInput({
      feature: 'sessions' as const,
      operation: 'DELETE' as const,
      idempotencyKey: 'pe-2',
    }));
    await expect(processEntry(added)).rejects.toThrow('No processor registered');
  });

  it('increments retryCount on processor failure', async () => {
    const processor = jest.fn<() => Promise<void>>().mockRejectedValue(new Error('fail'));
    registerProcessor('sessions', 'CREATE', processor);
    const added = enqueue(makeInput({
      feature: 'sessions' as const,
      operation: 'CREATE' as const,
      idempotencyKey: 'pe-4',
    }));
    await expect(processEntry(added)).rejects.toThrow('fail');
    const queue = getQueue();
    expect(queue[0]!.retryCount).toBe(1);
    expect(queue[0]!.error).toBe('fail');
  });
});

describe('resolveConflict', () => {
  const serverData = { name: 'server', score: 100, serverOnly: true };
  const clientData = { name: 'client', score: 200, clientOnly: true };

  it('client-wins merges with client data taking precedence', () => {
    const result = resolveConflict(serverData, clientData, 'client-wins');
    expect(result.name).toBe('client');
    expect(result.score).toBe(200);
    expect(result.serverOnly).toBe(true);
    expect(result.clientOnly).toBe(true);
    expect(result._resolvedAt).toBeDefined();
  });

  it('server-wins keeps server data', () => {
    const result = resolveConflict(serverData, clientData, 'server-wins');
    expect(result.name).toBe('server');
    expect(result.score).toBe(100);
    expect(result._resolvedAt).toBeDefined();
  });

  it('merge combines both with client taking precedence', () => {
    const result = resolveConflict(serverData, clientData, 'merge');
    expect(result.name).toBe('client');
    expect(result.score).toBe(200);
    expect(result._resolvedAt).toBeDefined();
  });

  it('manual throws error', () => {
    expect(() => resolveConflict(serverData, clientData, 'manual'))
      .toThrow('Manual conflict resolution required');
  });
});

describe('pruneExpiredEntries', () => {
  beforeEach(() => {
    mockStorageMap.clear();
    clearQueue();
  });

  it('removes entries older than 7 days', () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const entry = enqueue(makeInput({ idempotencyKey: 'old-1' }));
    updateEntry(entry.id, { createdAt: eightDaysAgo });
    pruneExpiredEntries();
    expect(getQueueLength()).toBe(0);
  });

  it('keeps entries newer than 7 days', () => {
    const oneDayAgo = Date.now() - 1 * 24 * 60 * 60 * 1000;
    const entry = enqueue(makeInput({ idempotencyKey: 'new-1' }));
    updateEntry(entry.id, { createdAt: oneDayAgo });
    pruneExpiredEntries();
    expect(getQueueLength()).toBe(1);
  });
});

function makeInput(overrides: Partial<OfflineQueueEntryInput> = {}): OfflineQueueEntryInput {
  return {
    operation: 'CREATE',
    feature: 'sessions',
    payload: { data: 'test' },
    idempotencyKey: `key-${Math.random().toString(36).slice(2)}`,
    ...overrides,
  };
}
