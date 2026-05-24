const mockStorage: Record<string, string> = {};

import { SessionCompletionRepositoryError, createCompletionLedger, updateCompletionSyncStatus } from '../repository';
import { SessionCompletionOfflineSyncService, sessionCompletionOfflineSync } from '../offline-sync-service';
import { enqueue, type OfflineQueueEntry } from '../../../lib/offline/queue';
import { getNetInfoAdapter, type NetworkChangeCallback, type NetworkState } from '../../../network/NetInfoAdapter';
import { captureSilentFailure } from '../../../utils/silent-failure';
import type { CompletionLedger } from '../schemas';

jest.mock('../repository', () => {
  const actual = jest.requireActual<typeof import('../repository')>('../repository');
  return {
    ...actual,
    createCompletionLedger: jest.fn(),
    updateCompletionSyncStatus: jest.fn(),
  };
});
jest.mock('../../../lib/offline/queue');
jest.mock('../../../network/NetInfoAdapter', () => ({
  getNetInfoAdapter: jest.fn(() => ({
    getCurrentState: () => ({
      isConnected: false,
      isInternetReachable: false,
      type: 'wifi',
      details: null,
    }),
    subscribe: jest.fn(() => jest.fn()),
  })),
}));
jest.mock('../../../utils/silent-failure');

jest.mock('../../../persistence/MMKVStorageAdapter', () => ({
  MMKVStorageAdapter: jest.fn().mockImplementation(() => ({
    getItemSync: jest.fn((key: string) => mockStorage[key] ?? null),
    setItemSync: jest.fn((key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItemSync: jest.fn((key: string) => {
      delete mockStorage[key];
    }),
  })),
}));

const createLedgerMock = jest.mocked(createCompletionLedger);
const updateSyncMock = jest.mocked(updateCompletionSyncStatus);
const enqueueMock = jest.mocked(enqueue);
const getNetInfoAdapterMock = jest.mocked(getNetInfoAdapter);
const captureSilentFailureMock = jest.mocked(captureSilentFailure);

const storageKey = 'vex_session_completion_fallback';
const networkState: NetworkState = {
  isConnected: false,
  isInternetReachable: false,
  type: 'wifi',
  details: null,
};

let networkCallback: NetworkChangeCallback | null = null;

function ledger(overrides: Partial<CompletionLedger> = {}): CompletionLedger {
  return {
    ledgerId: '550e8400-e29b-41d4-a716-446655440002',
    idempotencyKey: 'session-complete-1',
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    userId: '550e8400-e29b-41d4-a716-446655440001',
    mode: 'DEEP_WORK',
    targetDurationSeconds: 1800,
    completedDurationSeconds: 1700,
    effectiveFocusedSeconds: 1600,
    pauseCount: 1,
    interruptionCount: 0,
    strictMode: true,
    startedAt: 1700000000000,
    completedAt: 1700001800000,
    timezone: 'UTC',
    grade: 'A',
    gradeScore: 94,
    qualityScore: 92,
    focusScoreDelta: 8,
    xpDelta: 120,
    streakResult: { action: 'extended', newDays: 3, previousDays: 2 },
    companionReactionId: null,
    rewardIds: ['reward-1'],
    dailyMissionResult: { missionId: null, progressDelta: 1, status: 'progressed' },
    offlineSyncStatus: 'pending_sync',
    degradedSystems: [],
    createdAt: 1700001800000,
    ...overrides,
  };
}

function queueEntry(payload: CompletionLedger): OfflineQueueEntry {
  return {
    id: '550e8400-e29b-41d4-a716-446655440099',
    operation: 'SESSION_COMPLETE',
    feature: 'sessions',
    payload,
    idempotencyKey: payload.idempotencyKey,
    createdAt: 1700001800000,
    retryCount: 0,
    maxRetries: 10,
    priority: 'high',
  };
}

describe('SessionCompletionOfflineSyncService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    networkCallback = null;
    networkState.isConnected = false;
    networkState.isInternetReachable = false;
    jest.clearAllMocks();
    getNetInfoAdapterMock.mockReturnValue({
      getCurrentState: () => networkState,
      subscribe: (callback: NetworkChangeCallback) => {
        networkCallback = callback;
        return jest.fn();
      },
    } as ReturnType<typeof getNetInfoAdapter>);
  });

  afterAll(() => {
    sessionCompletionOfflineSync.cleanup();
    jest.useRealTimers();
  });

  it('queues completion locally when offline', async () => {
    const payload = ledger();
    enqueueMock.mockReturnValue(queueEntry(payload));
    const service = new SessionCompletionOfflineSyncService();

    const result = await service.queueSessionCompletion(payload);

    expect(result).toMatchObject({ queued: true, synced: false });
    expect(enqueueMock).toHaveBeenCalledWith(expect.objectContaining({
      operation: 'SESSION_COMPLETE',
      idempotencyKey: payload.idempotencyKey,
      payload,
    }));
    expect(JSON.parse(mockStorage[storageKey]).entries).toHaveLength(1);
    service.cleanup();
  });

  it('replays queued completions when connectivity returns', async () => {
    const payload = ledger();
    enqueueMock.mockReturnValue(queueEntry(payload));
    createLedgerMock.mockResolvedValue(payload);
    updateSyncMock.mockResolvedValue(undefined);
    const service = new SessionCompletionOfflineSyncService();
    await service.queueSessionCompletion(payload);

    networkState.isConnected = true;
    networkState.isInternetReachable = true;
    networkCallback?.(networkState);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(createLedgerMock).toHaveBeenCalledWith(payload);
    expect(updateSyncMock).toHaveBeenCalledWith(payload.ledgerId, 'synced');
    expect(JSON.parse(mockStorage[storageKey]).entries).toHaveLength(0);
    service.cleanup();
  });

  it('treats duplicate ledger replay as idempotent success', async () => {
    const payload = ledger();
    createLedgerMock.mockRejectedValue(
      new SessionCompletionRepositoryError('create', { code: '23505' }),
    );
    networkState.isConnected = true;
    networkState.isInternetReachable = true;
    const service = new SessionCompletionOfflineSyncService();

    const result = await service.queueSessionCompletion(payload, { forceSync: true });

    expect(result).toMatchObject({ queued: false, synced: true });
    service.cleanup();
  });

  it('discards corrupt fallback queue data and captures it', () => {
    mockStorage[storageKey] = JSON.stringify({
      entries: [{ id: 'not-a-uuid', operation: 'SESSION_COMPLETE' }],
      lastSyncAt: 1,
    });

    const service = new SessionCompletionOfflineSyncService();

    expect(service.getDiagnostics().fallbackEntriesCount).toBe(0);
    expect(captureSilentFailureMock).toHaveBeenCalledWith(expect.any(Error), {
      feature: 'session-completion',
      operation: 'offline-fallback-parse',
      type: 'data',
    });
    service.cleanup();
  });
});
