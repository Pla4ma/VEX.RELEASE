import {
  downloadExportData,
  deleteExportData,
} from "../repository/storage";
import { getSupabaseClient } from "../../../config/supabase";

jest.mock("../../../config/supabase", () => {
  const mockFrom = jest.fn().mockReturnValue({
    upload: jest.fn(),
    download: jest.fn(),
    remove: jest.fn(),
    createSignedUrl: jest.fn(),
    list: jest.fn(),
  });
  return {
    getSupabaseClient: jest.fn().mockReturnValue({
      storage: { from: mockFrom },
    }),
    handleSupabaseError: jest.fn((error: { message: string }) => {
      throw new Error(error.message);
    }),
  };
});

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

describe("AnalyticsStorage - download & delete", () => {
  let mockSupabase: { storage: { from: jest.Mock } };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = getSupabaseClient() as { storage: { from: jest.Mock } };
    mockSupabase.storage.from.mockReturnValue({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      createSignedUrl: jest.fn(),
      list: jest.fn(),
    });
  });

  describe("downloadExportData", () => {
    it("should download data successfully", async () => {
      const mockBlob = new Blob(["test data"], { type: "application/json" });
      mockSupabase.storage
        .from()
        .download.mockResolvedValue({ data: mockBlob, error: null });
      const result = await downloadExportData(
        "test-job-id",
        "user-123",
        "json",
      );
      expect(result.data).toBe(mockBlob);
      expect(result.contentType).toBe("application/json");
      expect(result.size).toBe(mockBlob.size);
      expect(result.checksum).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should throw on download failure", async () => {
      mockSupabase.storage
        .from()
        .download.mockResolvedValue({
          data: null,
          error: { name: "NotFound", message: "File not found" },
        });
      await expect(
        downloadExportData("test-job-id", "user-123", "json"),
      ).rejects.toThrow("Download failed");
    });

    it("should throw on empty response", async () => {
      mockSupabase.storage
        .from()
        .download.mockResolvedValue({ data: null, error: null });
      await expect(
        downloadExportData("test-job-id", "user-123", "json"),
      ).rejects.toThrow("No data returned from download");
    });
  });

  describe("deleteExportData", () => {
    it("should delete data successfully", async () => {
      mockSupabase.storage
        .from()
        .remove.mockResolvedValue({
          data: { message: "Deleted" },
          error: null,
        });
      await expect(
        deleteExportData("test-job-id", "user-123", "json"),
      ).resolves.not.toThrow();
    });

    it("should throw on delete failure", async () => {
      mockSupabase.storage
        .from()
        .remove.mockResolvedValue({
          data: null,
          error: { name: "DeleteFailed", message: "Cannot delete file" },
        });
      await expect(
        deleteExportData("test-job-id", "user-123", "json"),
      ).rejects.toThrow("Delete failed");
    });
  });
});
