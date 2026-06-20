import {
  mockStorage,
  storageKey,
  networkState,
  ledger,
  queueEntry,
} from './offline-sync-service.fixtures';
import {
  SessionCompletionRepositoryError,
  persistCompletionLedger,
  updateCompletionSyncStatus,
} from '../repository';
import {
  SessionCompletionOfflineSyncService,
  sessionCompletionOfflineSync,
} from '../offline-sync-service';
import { enqueue } from '../../../lib/offline/queue';
import {
  getNetInfoAdapter,
  type NetworkChangeCallback,
} from '../../../network/NetInfoAdapter';
import { captureSilentFailure } from '../../../utils/silent-failure';

jest.mock('../repository', () => {
  const actual =
    jest.requireActual<typeof import('../repository')>('../repository');
  return {
    ...actual,
    persistCompletionLedger: jest.fn(),
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
  getMMKVStorageAdapter: jest.fn().mockReturnValue({
    getItemSync: jest.fn((key: string) => mockStorage[key] ?? null),
    setItemSync: jest.fn((key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItemSync: jest.fn((key: string) => {
      delete mockStorage[key];
    }),
    getItem: jest.fn(async (key: string) => mockStorage[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete mockStorage[key];
    }),
  }),
}));

const persistLedgerMock = jest.mocked(persistCompletionLedger);
const updateSyncMock = jest.mocked(updateCompletionSyncStatus);
const enqueueMock = jest.mocked(enqueue);
const getNetInfoAdapterMock = jest.mocked(getNetInfoAdapter);
const captureSilentFailureMock = jest.mocked(captureSilentFailure);

let networkCallback: NetworkChangeCallback | null = null;

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
    expect(enqueueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: 'SESSION_COMPLETE',
        idempotencyKey: payload.idempotencyKey,
        payload,
      }),
    );
    expect(JSON.parse(mockStorage[storageKey]).entries).toHaveLength(1);
    service.cleanup();
  });

  it('replays queued completions when connectivity returns', async () => {
    const payload = ledger();
    enqueueMock.mockReturnValue(queueEntry(payload));
    persistLedgerMock.mockResolvedValue(payload);
    updateSyncMock.mockResolvedValue(undefined);
    const service = new SessionCompletionOfflineSyncService();
    await service.queueSessionCompletion(payload);

    networkState.isConnected = true;
    networkState.isInternetReachable = true;
    networkCallback?.(networkState);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(persistLedgerMock).toHaveBeenCalledWith(payload);
    expect(updateSyncMock).toHaveBeenCalledWith(payload.ledgerId, 'synced');
    expect(JSON.parse(mockStorage[storageKey]).entries).toHaveLength(0);
    service.cleanup();
  });

  it('treats duplicate ledger replay as idempotent success', async () => {
    const payload = ledger();
    persistLedgerMock.mockRejectedValue(
      new SessionCompletionRepositoryError('create', { code: '23505' }),
    );
    networkState.isConnected = true;
    networkState.isInternetReachable = true;
    const service = new SessionCompletionOfflineSyncService();

    const result = await service.queueSessionCompletion(payload, {
      forceSync: true,
    });

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
