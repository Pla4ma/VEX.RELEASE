var mockStorage: Record<string, string> | undefined;

jest.mock('../../../persistence/MMKVStorageAdapter', () => ({
  MMKVStorageAdapter: jest.fn().mockImplementation(() => ({
    getItemSync: jest.fn((key: string) => (mockStorage ??= {})[key] ?? null),
    setItemSync: jest.fn((key: string, value: string) => {
      (mockStorage ??= {})[key] = value;
    }),
    removeItemSync: jest.fn((key: string) => {
      delete (mockStorage ??= {})[key];
    }),
  })),
}));

jest.mock('../../../utils/silent-failure', () => ({
  captureSilentFailure: jest.fn(),
}));

jest.mock('../../../lib/repository/base', () => ({
  getConnectionState: jest.fn(() => 'offline'),
  subscribeToConnectionChanges: jest.fn(),
}));

import { clearQueue, getQueue, loadQueue } from '../../../lib/offline/queue';

describe('offline queue persistence', () => {
  beforeEach(() => {
    mockStorage = {};
    clearQueue();
  });

  it('loads persisted entries after app restart', () => {
    (mockStorage ??= {}).offline_queue_v1 = JSON.stringify([
      {
        id: '550e8400-e29b-41d4-a716-446655440099',
        operation: 'XP_ADD',
        feature: 'progression',
        payload: {
          userId: '550e8400-e29b-41d4-a716-446655440001',
          amount: 120,
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
        },
        idempotencyKey: 'xp-add:550e8400-e29b-41d4-a716-446655440000',
        createdAt: 1700001800000,
        retryCount: 0,
        maxRetries: 3,
        priority: 'high',
      },
    ]);
    loadQueue();

    expect(getQueue()).toHaveLength(1);
    expect(getQueue()[0]?.operation).toBe('XP_ADD');
  });
});
