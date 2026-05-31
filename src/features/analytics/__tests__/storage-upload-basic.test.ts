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

describe("AnalyticsStorage - uploadExportData", () => {
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

  it("should upload JSON data successfully", async () => {
    const mockData = { sessions: [{ timestamp: 1, value: 100 }] };
    const mockUrl = "https://example.com/signed-url";
    mockSupabase.storage
      .from()
      .upload.mockResolvedValue({
        data: { path: "test-job-id.json" },
        error: null,
      });
    mockSupabase.storage
      .from()
      .createSignedUrl.mockResolvedValue({
        data: { signedUrl: mockUrl },
        error: null,
      });
    const result = await uploadExportData(
      "test-job-id",
      mockData,
      "json",
      "user-123",
    );
    expect(result.url).toBe(mockUrl);
    expect(result.size).toBeGreaterThan(0);
    expect(result.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(result.uploadedAt).toBeGreaterThan(0);
    expect(result.expiresAt).toBeGreaterThan(result.uploadedAt);
  });

  it("should upload CSV data successfully", async () => {
    const mockData = [
      { timestamp: 1, value: 100 },
      { timestamp: 2, value: 200 },
    ];
    mockSupabase.storage
      .from()
      .upload.mockResolvedValue({
        data: { path: "test-job-id.csv" },
        error: null,
      });
    mockSupabase.storage
      .from()
      .createSignedUrl.mockResolvedValue({
        data: { signedUrl: "https://example.com/csv-url" },
        error: null,
      });
    const result = await uploadExportData(
      "test-job-id",
      mockData,
      "csv",
      "user-123",
    );
    expect(result.url).toBe("https://example.com/csv-url");
  });

  it("should throw error for non-array data in CSV format", async () => {
    const mockData = { notAnArray: true };
    await expect(
      uploadExportData("test-job-id", mockData, "csv", "user-123"),
    ).rejects.toThrow("Data must be an array for CSV export");
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
});
