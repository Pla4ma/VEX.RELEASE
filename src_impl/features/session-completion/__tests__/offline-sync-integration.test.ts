import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { completeSessionWithOfflineSync, useCompleteSessionWithOfflineSync, recoverPendingSessions, hasPendingSessionCompletions, getPendingSessionCompletionsSummary, performSessionCompletionHealthCheck, SessionCompletionSyncMonitor, type CompleteSessionWithOfflineSyncInput } from '../offline-sync-integration';
import { sessionCompletionOfflineSync } from '../offline-sync-service';
import { buildCompletionLedger } from '../ledger-service';
import { CompletionLedgerSchema, type CompletionLedger } from '../schemas';
import { useNetInfo } from '../../../network/useNetInfo';
import { getNetInfoAdapter } from '../../../network/NetInfoAdapter';

const onlineState = { isConnected: true, isInternetReachable: true, type: 'wifi', details: null };
const mockGetCurrentState = jest.fn(() => onlineState);

jest.mock('../offline-sync-service', () => ({
  sessionCompletionOfflineSync: {
    queueSessionCompletion: jest.fn(),
    getSyncStatus: jest.fn(),
    forceRetryAll: jest.fn(),
    getDiagnostics: jest.fn(),
  },
}));
jest.mock('../ledger-service', () => ({ buildCompletionLedger: jest.fn() }));
jest.mock('../../../network/useNetInfo', () => ({ useNetInfo: jest.fn() }));
jest.mock('../../../network/NetInfoAdapter', () => ({ getNetInfoAdapter: jest.fn(() => ({ getCurrentState: mockGetCurrentState, subscribe: jest.fn(() => jest.fn()) })) }));

const mockSessionCompletionOfflineSync = jest.mocked(sessionCompletionOfflineSync);
const mockBuildCompletionLedger = jest.mocked(buildCompletionLedger);
const mockUseNetInfo = jest.mocked(useNetInfo);
const mockGetNetInfoAdapter = jest.mocked(getNetInfoAdapter);

const flushPromises = async (): Promise<void> => { await Promise.resolve(); await Promise.resolve(); };

const makeLedger = (): CompletionLedger =>
  CompletionLedgerSchema.parse({
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    userId: '550e8400-e29b-41d4-a716-446655440001',
    ledgerId: '550e8400-e29b-41d4-a716-446655440002',
    idempotencyKey: 'idempotency-key-123',
    completedAt: Date.now(),
    createdAt: Date.now(),
    offlineSyncStatus: 'pending_sync',
    mode: 'DEEP_WORK',
    targetDurationSeconds: 1800,
    completedDurationSeconds: 1500,
    effectiveFocusedSeconds: 1200,
    pauseCount: 2,
    interruptionCount: 1,
    strictMode: true,
    startedAt: Date.now() - 1800000,
    timezone: 'UTC',
    grade: 'A',
    gradeScore: 95,
    qualityScore: 90,
    focusScoreDelta: 100,
    xpDelta: 150,
    streakResult: { action: 'maintained', newDays: 5, previousDays: 5 },
    companionReactionId: 'reaction-123',
    rewardIds: ['reward-1', 'reward-2'],
    dailyMissionResult: { missionId: 'mission-123', progressDelta: 100, status: 'completed' },
  });

describe('offline sync integration', () => {
  let testInput: CompleteSessionWithOfflineSyncInput;
  let testLedger: CompletionLedger;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentState.mockReturnValue(onlineState);
    mockUseNetInfo.mockReturnValue({
      ...onlineState,
      isOnline: true,
      isOffline: false,
      isMetered: false,
      isWifi: true,
      isCellular: false,
      refresh: async () => {},
    });
    testLedger = makeLedger();
    testInput = {
      sessionId: 'test-session-123',
      userId: 'test-user-456',
      completedAt: Date.now(),
      sessionDuration: 1800,
      focusScore: 85,
      interruptions: 2,
      rewards: { xp: 100, gems: 5, streakBonus: 10 },
    };
    mockBuildCompletionLedger.mockReturnValue(testLedger);
    mockSessionCompletionOfflineSync.queueSessionCompletion.mockResolvedValue({ queued: true, synced: false, entryId: 'queue-entry-123' });
  });

  it('queues session completion for offline sync', async () => {
    const result = await completeSessionWithOfflineSync(testInput);
    expect(result).toMatchObject({ success: true, syncedImmediately: false, queuedForSync: true, ledger: testLedger, syncStatus: 'pending' });
    expect(mockSessionCompletionOfflineSync.queueSessionCompletion).toHaveBeenCalledWith(testLedger, { forceSync: false });
  });

  it('reports immediate sync when forceSync succeeds', async () => {
    mockSessionCompletionOfflineSync.queueSessionCompletion.mockResolvedValue({ queued: false, synced: true });
    const result = await completeSessionWithOfflineSync({ ...testInput, forceSync: true });
    expect(result).toMatchObject({ success: true, syncedImmediately: true, queuedForSync: false, syncStatus: 'synced' });
    expect(mockSessionCompletionOfflineSync.queueSessionCompletion).toHaveBeenCalledWith(testLedger, { forceSync: true });
  });

  it('returns failed status when ledger creation fails', async () => {
    mockBuildCompletionLedger.mockImplementation(() => {
      throw new Error('Invalid input');
    });
    const result = await completeSessionWithOfflineSync(testInput);
    expect(result).toMatchObject({ success: false, syncedImmediately: false, queuedForSync: false, syncStatus: 'failed' });
    expect(result.error?.message).toBe('Invalid input');
  });

  it('exposes hook helpers from the sync service', () => {
    const hook = useCompleteSessionWithOfflineSync();
    expect(hook.isOnline).toBe(true);
    expect(hook.completeSession).toBe(completeSessionWithOfflineSync);
    expect(hook.getSyncStatus).toEqual(expect.any(Function));
    expect(hook.forceRetryAll).toEqual(expect.any(Function));
  });

  it('recovers pending sessions and handles recovery errors', async () => {
    mockSessionCompletionOfflineSync.forceRetryAll.mockResolvedValueOnce({ attempted: 5, successful: 4, failed: 1 });
    await expect(recoverPendingSessions()).resolves.toMatchObject({ recovered: 4, failed: 1 });
    mockSessionCompletionOfflineSync.forceRetryAll.mockRejectedValueOnce(new Error('Recovery failed'));
    await expect(recoverPendingSessions()).resolves.toMatchObject({ recovered: 0, failed: 1, failedSessions: [{ sessionId: 'unknown', error: 'Recovery failed' }] });
  });

  it('summarizes pending completions from diagnostics', async () => {
    const now = Date.now();
    mockSessionCompletionOfflineSync.getDiagnostics.mockReturnValue({ fallbackEntriesCount: 5, lastSyncAt: now - 300000, isInitialized: true, oldestEntryAge: 600000 });
    await expect(hasPendingSessionCompletions()).resolves.toBe(true);
    await expect(getPendingSessionCompletionsSummary()).resolves.toEqual({ count: 5, oldestEntryAge: 600000, lastSyncAt: now - 300000 });
  });

  it('falls back safely when diagnostics fail', async () => {
    mockSessionCompletionOfflineSync.getDiagnostics.mockImplementation(() => {
      throw new Error('Diagnostic error');
    });
    await expect(hasPendingSessionCompletions()).resolves.toBe(false);
    await expect(getPendingSessionCompletionsSummary()).resolves.toEqual({ count: 0, lastSyncAt: 0 });
  });

  it('uses NetInfoAdapter state for health checks', async () => {
    mockSessionCompletionOfflineSync.getDiagnostics.mockReturnValue({ fallbackEntriesCount: 0, lastSyncAt: Date.now() - 60000, isInitialized: true });
    await expect(performSessionCompletionHealthCheck()).resolves.toMatchObject({ status: 'healthy', pendingCount: 0, isOnline: true });
    mockGetCurrentState.mockReturnValue({ isConnected: false, isInternetReachable: false, type: 'none', details: null });
    const offline = await performSessionCompletionHealthCheck();
    expect(offline.status).toBe('critical');
    expect(offline.recommendations.some((item) => item.includes('Device is offline'))).toBe(true);
    expect(mockGetNetInfoAdapter).toHaveBeenCalled();
  });

  it('classifies queued health severity by diagnostics', async () => {
    mockSessionCompletionOfflineSync.getDiagnostics.mockReturnValue({ fallbackEntriesCount: 15, lastSyncAt: Date.now() - 3600000, isInitialized: true, oldestEntryAge: 7200000 });
    const result = await performSessionCompletionHealthCheck();
    expect(result.status).toBe('critical');
    expect(result.pendingCount).toBe(15);
    expect(result.recommendations.some((item) => item.includes('High number of pending sessions'))).toBe(true);
  });

  describe('SessionCompletionSyncMonitor', () => {
    let monitor: SessionCompletionSyncMonitor;
    let onHealthStatusChange: jest.Mock;

    beforeEach(() => {
      jest.useFakeTimers();
      onHealthStatusChange = jest.fn();
      monitor = new SessionCompletionSyncMonitor({ healthCheckIntervalMs: 5000, onHealthStatusChange });
      mockSessionCompletionOfflineSync.getDiagnostics.mockReturnValue({ fallbackEntriesCount: 0, lastSyncAt: Date.now(), isInitialized: true });
    });

    afterEach(() => {
      monitor.stop();
      jest.useRealTimers();
    });

    it('runs initial and periodic health checks', async () => {
      monitor.start();
      await flushPromises();
      expect(onHealthStatusChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'healthy' }));
      jest.clearAllMocks();
      mockSessionCompletionOfflineSync.getDiagnostics.mockReturnValue({ fallbackEntriesCount: 5, lastSyncAt: Date.now(), isInitialized: true });
      jest.advanceTimersByTime(5000);
      await flushPromises();
      expect(onHealthStatusChange).toHaveBeenCalledWith(expect.objectContaining({ pendingCount: 5 }));
    });

    it('stops monitoring and preserves last health status', async () => {
      monitor.start();
      await flushPromises();
      expect(monitor.getLastHealthStatus()?.status).toBe('healthy');
      monitor.stop();
      jest.clearAllMocks();
      jest.advanceTimersByTime(10000);
      await flushPromises();
      expect(mockSessionCompletionOfflineSync.getDiagnostics).not.toHaveBeenCalled();
    });
  });
});
