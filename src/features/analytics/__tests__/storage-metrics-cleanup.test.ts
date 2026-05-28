import {
  getStorageMetrics,
  cleanupOldExports,
  AnalyticsStorageError,
} from "../storage";
import { getSupabaseClient } from "../../../config/supabase";

jest.mock("../../../config/supabase", () => ({
  getSupabaseClient: jest.fn(),
  handleSupabaseError: jest.fn((error: { message: string }) => {
    throw new Error(error.message);
  }),
}));

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

describe("AnalyticsStorage - metrics, cleanup & errors", () => {
  let mockSupabase: { storage: { from: jest.Mock } };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      storage: {
        from: jest
          .fn()
          .mockReturnValue({
            upload: jest.fn(),
            download: jest.fn(),
            remove: jest.fn(),
            createSignedUrl: jest.fn(),
            list: jest.fn(),
          }),
      },
    };
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe("getStorageMetrics", () => {
    it("should return metrics successfully", async () => {
      mockSupabase.storage.from().list.mockResolvedValue({
        data: [
          {
            name: "file1.json",
            metadata: { size: 1000 },
            created_at: "2024-01-01",
          },
          {
            name: "file2.json",
            metadata: { size: 2000 },
            created_at: "2024-01-02",
          },
        ],
        error: null,
      });
      const result = await getStorageMetrics("user-123");
      expect(result.totalExports).toBe(2);
      expect(result.totalSize).toBe(3000);
      expect(result.oldestExport).toBe(new Date("2024-01-01").getTime());
    });

    it("should handle empty storage", async () => {
      mockSupabase.storage
        .from()
        .list.mockResolvedValue({ data: [], error: null });
      const result = await getStorageMetrics("user-123");
      expect(result.totalExports).toBe(0);
      expect(result.totalSize).toBe(0);
      expect(result.oldestExport).toBeNull();
    });

    it("should handle list error gracefully", async () => {
      mockSupabase.storage
        .from()
        .list.mockResolvedValue({
          data: null,
          error: { message: "List failed" },
        });
      const result = await getStorageMetrics("user-123");
      expect(result.totalExports).toBe(0);
      expect(result.totalSize).toBe(0);
    });

    it("should handle missing metadata", async () => {
      mockSupabase.storage
        .from()
        .list.mockResolvedValue({
          data: [{ name: "file1.json" }, { name: "file2.json", metadata: {} }],
          error: null,
        });
      const result = await getStorageMetrics("user-123");
      expect(result.totalExports).toBe(2);
      expect(result.totalSize).toBe(0);
    });
  });

  describe("cleanupOldExports", () => {
    it("should delete old files successfully", async () => {
      const oldDate = new Date("2023-01-01").toISOString();
      const newDate = new Date().toISOString();
      mockSupabase.storage.from().list.mockResolvedValue({
        data: [
          { name: "old1.json", metadata: { size: 1000 }, created_at: oldDate },
          { name: "old2.json", metadata: { size: 2000 }, created_at: oldDate },
          { name: "new.json", metadata: { size: 500 }, created_at: newDate },
        ],
        error: null,
      });
      mockSupabase.storage
        .from()
        .remove.mockResolvedValue({
          data: { message: "Deleted" },
          error: null,
        });
      const result = await cleanupOldExports("user-123", 7);
      expect(result.deleted).toBe(2);
      expect(result.freedSpace).toBe(3000);
    });

    it("should handle no old files", async () => {
      const newDate = new Date().toISOString();
      mockSupabase.storage
        .from()
        .list.mockResolvedValue({
          data: [
            { name: "new.json", metadata: { size: 500 }, created_at: newDate },
          ],
          error: null,
        });
      const result = await cleanupOldExports("user-123", 7);
      expect(result.deleted).toBe(0);
      expect(result.freedSpace).toBe(0);
    });

    it("should throw on delete failure during cleanup", async () => {
      const oldDate = new Date("2023-01-01").toISOString();
      mockSupabase.storage
        .from()
        .list.mockResolvedValue({
          data: [
            { name: "old.json", metadata: { size: 1000 }, created_at: oldDate },
          ],
          error: null,
        });
      mockSupabase.storage
        .from()
        .remove.mockResolvedValue({
          data: null,
          error: { name: "DeleteFailed", message: "Cleanup failed" },
        });
      await expect(cleanupOldExports("user-123", 7)).rejects.toThrow(
        "Cleanup failed",
      );
    });
  });

  describe("AnalyticsStorageError", () => {
    it("should create error with all properties", () => {
      const error = new AnalyticsStorageError(
        "Test error",
        "TEST_CODE",
        "test-bucket",
        "test-path",
        true,
      );
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_CODE");
      expect(error.bucket).toBe("test-bucket");
      expect(error.path).toBe("test-path");
      expect(error.retryable).toBe(true);
      expect(error.name).toBe("AnalyticsStorageError");
    });

    it("should work with optional properties", () => {
      const error = new AnalyticsStorageError("Test error", "TEST_CODE");
      expect(error.bucket).toBeUndefined();
      expect(error.path).toBeUndefined();
      expect(error.retryable).toBe(false);
    });
  });
});
