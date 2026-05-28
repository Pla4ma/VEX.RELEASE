import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import {
  performSessionCompletionHealthCheck,
  SessionCompletionSyncMonitor,
} from "../offline-sync-integration";
import {
  mockSessionCompletionOfflineSync,
  mockGetCurrentState,
  mockGetNetInfoAdapter,
  onlineState,
  flushPromises,
} from "./offline-sync-test-fixtures";

describe("offline sync health checks and monitoring", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentState.mockReturnValue(onlineState);
  });

  it("uses NetInfoAdapter state for health checks", async () => {
    mockSessionCompletionOfflineSync.getDiagnostics.mockReturnValue({
      fallbackEntriesCount: 0,
      lastSyncAt: Date.now() - 60000,
      isInitialized: true,
    });
    await expect(performSessionCompletionHealthCheck()).resolves.toMatchObject({
      status: "healthy",
      pendingCount: 0,
      isOnline: true,
    });
    mockGetCurrentState.mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
      type: "none",
      details: null,
    });
    const offline = await performSessionCompletionHealthCheck();
    expect(offline.status).toBe("critical");
    expect(
      offline.recommendations.some((item: string) =>
        item.includes("Device is offline"),
      ),
    ).toBe(true);
    expect(mockGetNetInfoAdapter).toHaveBeenCalled();
  });

  it("classifies queued health severity by diagnostics", async () => {
    mockSessionCompletionOfflineSync.getDiagnostics.mockReturnValue({
      fallbackEntriesCount: 15,
      lastSyncAt: Date.now() - 3600000,
      isInitialized: true,
      oldestEntryAge: 7200000,
    });
    const result = await performSessionCompletionHealthCheck();
    expect(result.status).toBe("critical");
    expect(result.pendingCount).toBe(15);
    expect(
      result.recommendations.some((item: string) =>
        item.includes("High number of pending sessions"),
      ),
    ).toBe(true);
  });

  describe("SessionCompletionSyncMonitor", () => {
    let monitor: SessionCompletionSyncMonitor;
    let onHealthStatusChange: jest.Mock;

    beforeEach(() => {
      jest.useFakeTimers();
      onHealthStatusChange = jest.fn();
      monitor = new SessionCompletionSyncMonitor({
        healthCheckIntervalMs: 5000,
        onHealthStatusChange,
      });
      mockSessionCompletionOfflineSync.getDiagnostics.mockReturnValue({
        fallbackEntriesCount: 0,
        lastSyncAt: Date.now(),
        isInitialized: true,
      });
    });

    afterEach(() => {
      monitor.stop();
      jest.useRealTimers();
    });

    it("runs initial and periodic health checks", async () => {
      monitor.start();
      await flushPromises();
      expect(onHealthStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: "healthy" }),
      );
      jest.clearAllMocks();
      mockSessionCompletionOfflineSync.getDiagnostics.mockReturnValue({
        fallbackEntriesCount: 5,
        lastSyncAt: Date.now(),
        isInitialized: true,
      });
      jest.advanceTimersByTime(5000);
      await flushPromises();
      expect(onHealthStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({ pendingCount: 5 }),
      );
    });

    it("stops monitoring and preserves last health status", async () => {
      monitor.start();
      await flushPromises();
      expect(monitor.getLastHealthStatus()?.status).toBe("healthy");
      monitor.stop();
      jest.clearAllMocks();
      jest.advanceTimersByTime(10000);
      await flushPromises();
      expect(
        mockSessionCompletionOfflineSync.getDiagnostics,
      ).not.toHaveBeenCalled();
    });
  });
});
