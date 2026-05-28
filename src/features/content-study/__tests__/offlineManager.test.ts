import {
  OfflineManager,
  getStorageUsage,
  clearAllContentStudyData,
} from "../persistence";
import { mockStorage } from "./persistence.test.helpers";

jest.mock("../../../persistence", () => ({
  getDefaultStorageAdapter: () => mockStorage,
}));

describe("OfflineManager", () => {
  let offlineManager: OfflineManager;
  beforeEach(() => {
    mockStorage.clear();
    OfflineManager.resetForTests();
    offlineManager = OfflineManager.getInstance();
  });
  it("should set offline mode", async () => {
    await offlineManager.setOfflineMode(true);
    const isOffline = await offlineManager.isInOfflineMode();
    expect(isOffline).toBe(true);
  });
  it("should allow actions when offline", async () => {
    await offlineManager.setOfflineMode(true);
    const canSubmit = await offlineManager.canPerformAction("submit");
    const canGenerate = await offlineManager.canPerformAction("generate");
    expect(canSubmit).toBe(true);
    expect(canGenerate).toBe(true);
  });
  it("should return false for sync offline mode by default", async () => {
    const isOffline = await offlineManager.isInOfflineMode();
    expect(isOffline).toBe(false);
  });
});

describe("Utility Functions", () => {
  beforeEach(() => {
    mockStorage.clear();
  });
  it("should calculate storage usage", async () => {
    await mockStorage.setItem(
      "content-study:drafts",
      JSON.stringify([{ id: "1" }]),
    );
    await mockStorage.setItem(
      "content-study:sessions",
      JSON.stringify([{ id: "2" }]),
    );
    const usage = await getStorageUsage();
    expect(usage.drafts).toBeGreaterThan(0);
    expect(usage.sessions).toBeGreaterThan(0);
    expect(usage.total).toBeGreaterThan(0);
  });
  it("should clear all content study data", async () => {
    await mockStorage.setItem("content-study:drafts", "data");
    await mockStorage.setItem("content-study:sessions", "data");
    await mockStorage.setItem("other-key", "should remain");
    await clearAllContentStudyData();
    const drafts = await mockStorage.getItem("content-study:drafts");
    const other = await mockStorage.getItem("other-key");
    expect(drafts).toBeNull();
    expect(other).toBe("should remain");
  });
});
