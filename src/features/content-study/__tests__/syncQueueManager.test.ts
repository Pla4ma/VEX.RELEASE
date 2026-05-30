import { SyncQueueManager } from "../persistence";
import type { SyncQueueItem } from "../types";
import { mockStorage } from "./persistence.test.helpers";

jest.mock("../../../persistence", () => ({
  getDefaultStorageAdapter: () => mockStorage,
}));

describe("SyncQueueManager", () => {
  let syncQueueManager: SyncQueueManager;
  beforeEach(() => {
    mockStorage.clear();
    SyncQueueManager.resetForTests();
    syncQueueManager = SyncQueueManager.getInstance();
  });
  it("should enqueue items", async () => {
    const item = await syncQueueManager.enqueue({
      entity: "content",
      operation: "create",
      payload: { text: "Test" },
      maxRetries: 3,
    });
    expect(item.id).toBeDefined();
    expect(item.retryCount).toBe(0);
    expect(item.createdAt).toBeDefined();
  });
  it("should dequeue items", async () => {
    const item = await syncQueueManager.enqueue({
      entity: "content",
      operation: "create",
      payload: { text: "Test" },
      maxRetries: 3,
    });
    const dequeued = await syncQueueManager.dequeue(item.id);
    const queue = await syncQueueManager.getQueue();
    expect(dequeued).toBe(true);
    expect(queue).toHaveLength(0);
  });
  it("should increment retry count", async () => {
    const item = await syncQueueManager.enqueue({
      entity: "content",
      operation: "create",
      payload: { text: "Test" },
      maxRetries: 3,
    });
    const updated = await syncQueueManager.incrementRetry(
      item.id,
      "Network error",
    );
    expect(updated).not.toBeNull();
    expect(updated?.retryCount).toBe(1);
    expect(updated?.error).toBe("Network error");
    expect(updated?.lastAttempt).toBeDefined();
  });
  it("should get pending items", async () => {
    const pendingItem: SyncQueueItem = {
      id: "pending-1",
      entity: "content",
      operation: "create",
      payload: {},
      maxRetries: 3,
      retryCount: 0,
      createdAt: Date.now(),
    };
    const failedItem: SyncQueueItem = {
      id: "failed-1",
      entity: "content",
      operation: "create",
      payload: {},
      maxRetries: 3,
      retryCount: 5,
      createdAt: Date.now(),
    };
    await syncQueueManager.saveQueue([pendingItem, failedItem]);
    const pending = await syncQueueManager.getPendingItems();
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe("pending-1");
  });
  it("should get failed items", async () => {
    const failedItem: SyncQueueItem = {
      id: "failed-1",
      entity: "content",
      operation: "create",
      payload: {},
      maxRetries: 3,
      retryCount: 5,
      error: "Max retries exceeded",
      createdAt: Date.now(),
    };
    await syncQueueManager.saveQueue([failedItem]);
    const failed = await syncQueueManager.getFailedItems();
    expect(failed).toHaveLength(1);
    expect(failed[0].id).toBe("failed-1");
  });
  it("should limit queue size", async () => {
    for (let i = 0; i < 100; i++) {
      await syncQueueManager.enqueue({
        entity: "feedback",
        operation: "submit",
        payload: {},
        maxRetries: 3,
      });
    }
    const item = await syncQueueManager.enqueue({
      entity: "content",
      operation: "create",
      payload: {},
      maxRetries: 3,
    });
    const queue = await syncQueueManager.getQueue();
    expect(queue.length).toBeLessThanOrEqual(100);
  });
});
