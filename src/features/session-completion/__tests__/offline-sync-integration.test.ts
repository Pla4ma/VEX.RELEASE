import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
} from "@jest/globals";

// These jest.mock() calls must appear before any imports from
// ../offline-sync-integration so that babel-jest hoists them above
// the transitive import chain (offline-sync-core → useNetInfo → React).
// Without them the real useNetInfo module loads and triggers
// NULL_PROPERTY_ACCESS when it calls useState at module scope.
jest.mock("../offline-sync-service", () => ({
  sessionCompletionOfflineSync: {
    queueSessionCompletion: jest.fn(),
    getSyncStatus: jest.fn(),
    forceRetryAll: jest.fn(),
    getDiagnostics: jest.fn(),
  },
}));
jest.mock("../ledger-service", () => ({ buildCompletionLedger: jest.fn() }));
jest.mock("../../../network/useNetInfo", () => ({
  useNetInfo: jest.fn(),
}));
jest.mock("../../../network/NetInfoAdapter", () => ({
  getNetInfoAdapter: jest.fn(() => ({
    getCurrentState: jest.fn(() => ({
      isConnected: true,
      isInternetReachable: true,
      type: "wifi",
      details: null,
    })),
    subscribe: jest.fn(() => jest.fn()),
  })),
}));

import {
  completeSessionWithOfflineSync,
  useCompleteSessionWithOfflineSync,
  recoverPendingSessions,
  hasPendingSessionCompletions,
  getPendingSessionCompletionsSummary,
  type CompleteSessionWithOfflineSyncInput,
} from "../offline-sync-integration";
import {
  mockSessionCompletionOfflineSync,
  mockBuildCompletionLedger,
  mockUseNetInfo,
  mockGetCurrentState,
  onlineState,
  makeLedger,
} from "./offline-sync-test-fixtures";
import type { CompletionLedger } from "../schemas";

describe("offline sync integration", () => {
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
      sessionId: "test-session-123",
      userId: "test-user-456",
      completedAt: Date.now(),
      sessionDuration: 1800,
      focusScore: 85,
      interruptions: 2,
      rewards: { xp: 100, gems: 5, streakBonus: 10 },
    };
    mockBuildCompletionLedger.mockReturnValue(testLedger);
    mockSessionCompletionOfflineSync.queueSessionCompletion.mockResolvedValue({
      queued: true,
      synced: false,
      entryId: "queue-entry-123",
    });
  });

  it("queues session completion for offline sync", async () => {
    const result = await completeSessionWithOfflineSync(testInput);
    expect(result).toMatchObject({
      success: true,
      syncedImmediately: false,
      queuedForSync: true,
      ledger: testLedger,
      syncStatus: "pending",
    });
    expect(
      mockSessionCompletionOfflineSync.queueSessionCompletion,
    ).toHaveBeenCalledWith(testLedger, { forceSync: false });
  });

  it("reports immediate sync when forceSync succeeds", async () => {
    mockSessionCompletionOfflineSync.queueSessionCompletion.mockResolvedValue({
      queued: false,
      synced: true,
    });
    const result = await completeSessionWithOfflineSync({
      ...testInput,
      forceSync: true,
    });
    expect(result).toMatchObject({
      success: true,
      syncedImmediately: true,
      queuedForSync: false,
      syncStatus: "synced",
    });
    expect(
      mockSessionCompletionOfflineSync.queueSessionCompletion,
    ).toHaveBeenCalledWith(testLedger, { forceSync: true });
  });

  it("returns failed status when ledger creation fails", async () => {
    mockBuildCompletionLedger.mockImplementation(() => {
      throw new Error("Invalid input");
    });
    const result = await completeSessionWithOfflineSync(testInput);
    expect(result).toMatchObject({
      success: false,
      syncedImmediately: false,
      queuedForSync: false,
      syncStatus: "failed",
    });
    expect(result.error?.message).toBe("Invalid input");
  });

  it("exposes hook helpers from the sync service", () => {
    const hook = useCompleteSessionWithOfflineSync();
    expect(hook.isOnline).toBe(true);
    expect(hook.completeSession).toBe(completeSessionWithOfflineSync);
    expect(hook.getSyncStatus).toEqual(expect.any(Function));
    expect(hook.forceRetryAll).toEqual(expect.any(Function));
  });

  it("recovers pending sessions and handles recovery errors", async () => {
    mockSessionCompletionOfflineSync.forceRetryAll.mockResolvedValueOnce({
      attempted: 5,
      successful: 4,
      failed: 1,
    });
    await expect(recoverPendingSessions()).resolves.toMatchObject({
      recovered: 4,
      failed: 1,
    });
    mockSessionCompletionOfflineSync.forceRetryAll.mockRejectedValueOnce(
      new Error("Recovery failed"),
    );
    await expect(recoverPendingSessions()).resolves.toMatchObject({
      recovered: 0,
      failed: 1,
      failedSessions: [{ sessionId: "unknown", error: "Recovery failed" }],
    });
  });

  it("summarizes pending completions from diagnostics", async () => {
    const now = Date.now();
    mockSessionCompletionOfflineSync.getDiagnostics.mockReturnValue({
      fallbackEntriesCount: 5,
      lastSyncAt: now - 300000,
      isInitialized: true,
      oldestEntryAge: 600000,
    });
    await expect(hasPendingSessionCompletions()).resolves.toBe(true);
    await expect(getPendingSessionCompletionsSummary()).resolves.toEqual({
      count: 5,
      oldestEntryAge: 600000,
      lastSyncAt: now - 300000,
    });
  });

  it("falls back safely when diagnostics fail", async () => {
    mockSessionCompletionOfflineSync.getDiagnostics.mockImplementation(() => {
      throw new Error("Diagnostic error");
    });
    await expect(hasPendingSessionCompletions()).resolves.toBe(false);
    await expect(getPendingSessionCompletionsSummary()).resolves.toEqual({
      count: 0,
      lastSyncAt: 0,
    });
  });
});
