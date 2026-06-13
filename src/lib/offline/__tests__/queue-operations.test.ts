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
  clearQueue,
  enqueue,
  getQueue,
  getQueueLength,
  updateEntry,
  registerProcessor,
  processEntry,
  resolveConflict,
  pruneExpiredEntries,
  type OfflineQueueEntryInput,
} from '../queue';

function makeInput(overrides: Partial<OfflineQueueEntryInput> = {}): OfflineQueueEntryInput {
  return {
    operation: 'CREATE',
    feature: 'sessions',
    payload: { data: 'test' },
    idempotencyKey: `key-${Math.random().toString(36).slice(2)}`,
    ...overrides,
  };
}

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
