import { captureSilentFailure } from "../../../utils/silent-failure";
import { uploadExportData } from "../repository/storage";
import { getSupabaseClient } from "../../../config/supabase";
jest.mock("../../../config/supabase", () => {
  const mockFrom = jest.fn().mockReturnValue({
    upload: jest.fn(),
    download: jest.fn(),
    remove: jest.fn(),
    createSignedUrl: jest.fn(),
    list: jest.fn(),
    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "https://example.com/file" } }),
  });
  const mockClient = { storage: { from: mockFrom } };
  return {
    supabase: mockClient,
    getSupabaseClient: jest.fn().mockReturnValue(mockClient),
    handleSupabaseError: jest.fn((error: { message: string }) => {
      throw new Error(error.message);
    }),
  };
});

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

describe("AnalyticsStorage - uploadExportData retry & resilience", () => {
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
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "https://example.com/file" } }),
    });
  });

  it("should retry on network error and succeed", async () => {
    const mockData = { sessions: [] };
    mockSupabase.storage
      .from()
      .upload.mockRejectedValueOnce(new Error("network_error"))
      .mockResolvedValueOnce({
        data: { path: "test-job-id.json" },
        error: null,
      });
    mockSupabase.storage
      .from()
      .createSignedUrl.mockResolvedValue({
        data: { signedUrl: "https://example.com/signed-url" },
        error: null,
      });
    const result = await uploadExportData(
      "test-job-id",
      mockData,
      "json",
      "user-123",
    );
    expect(result.url).toBe("https://example.com/signed-url");
    expect(mockSupabase.storage.from().upload).toHaveBeenCalledTimes(2);
  });

  it("should throw after max retry attempts", async () => {
    const mockData = { sessions: [] };
    mockSupabase.storage
      .from()
      .upload.mockRejectedValue(new Error("network_error"));
    await expect(
      uploadExportData("test-job-id", mockData, "json", "user-123"),
    ).rejects.toThrow();
    expect(mockSupabase.storage.from().upload).toHaveBeenCalledTimes(3);
  });

  it("should handle large file upload with extended timeout", async () => {
    const largeData = {
      sessions: Array.from({ length: 100000 }, (_, i) => ({
        timestamp: i,
        value: Math.random() * 1000,
        metadata: { extra: "data".repeat(100) },
      })),
    };
    mockSupabase.storage
      .from()
      .upload.mockResolvedValue({
        data: { path: "test-job-id.json" },
        error: null,
      });
    mockSupabase.storage
      .from()
      .createSignedUrl.mockResolvedValue({
        data: { signedUrl: "https://example.com/signed-url" },
        error: null,
      });
    const result = await uploadExportData(
      "test-job-id",
      largeData,
      "json",
      "user-123",
    );
    expect(result.size).toBeGreaterThan(5 * 1024 * 1024);
  });

  it("should handle circuit breaker open state", async () => {
    const mockData = { sessions: [] };
    mockSupabase.storage
      .from()
      .upload.mockRejectedValue(new Error("service_unavailable"));
    try {
      await uploadExportData("test-1", mockData, "json", "user-123");
    } catch (error) {
      captureSilentFailure(error, {
        feature: "analytics",
        operation: "safe-fallback",
        type: "data",
      });
    }
    try {
      await uploadExportData("test-2", mockData, "json", "user-123");
    } catch (error) {
      captureSilentFailure(error, {
        feature: "analytics",
        operation: "safe-fallback",
        type: "data",
      });
    }
    try {
      await uploadExportData("test-3", mockData, "json", "user-123");
    } catch (error) {
      captureSilentFailure(error, {
        feature: "analytics",
        operation: "safe-fallback",
        type: "data",
      });
    }
    await expect(
      uploadExportData("test-4", mockData, "json", "user-123"),
    ).rejects.toThrow("Circuit breaker is OPEN");
  });
});
