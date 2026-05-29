import {
  calculateTrend,
  exportAnalyticsData,
} from "../service";
import * as repository from "../repository";
import { eventBus } from "../../../events";

jest.mock("../repository");
jest.mock("../repository/storage", () => ({
  uploadExportData: jest
    .fn()
    .mockResolvedValue({
      url: "https://test.com/export.json",
      size: 1000,
      checksum: "abc123",
      uploadedAt: Date.now(),
      expiresAt: Date.now() + 604800000,
    }),
  deleteExportData: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../../../events", () => ({ eventBus: { publish: jest.fn() } }));
jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

describe("AnalyticsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("calculateTrend", () => {
    it("should calculate upward trend correctly", async () => {
      const mockData = {
        metric: "xp_earned",
        granularity: "day",
        points: [
          { timestamp: 1, value: 100 },
          { timestamp: 2, value: 120 },
          { timestamp: 3, value: 140 },
          { timestamp: 4, value: 160 },
          { timestamp: 5, value: 180 },
        ],
        summary: {
          total: 700,
          average: 140,
          min: 100,
          max: 180,
          change: 80,
          changePercent: 80,
        },
      };
      (repository.fetchTimeSeriesData as jest.Mock).mockResolvedValue(mockData);
      const result = await calculateTrend(
        "user-123",
        "xp_earned",
        "last_7_days",
        3,
      );
      expect(result.direction).toBe("up");
      expect(result.strength).toBeGreaterThan(0);
      expect(result.projectedNext).toBeGreaterThan(180);
    });

    it("should calculate downward trend correctly", async () => {
      const mockData = {
        metric: "sessions_completed",
        granularity: "day",
        points: [
          { timestamp: 1, value: 10 },
          { timestamp: 2, value: 8 },
          { timestamp: 3, value: 6 },
          { timestamp: 4, value: 4 },
          { timestamp: 5, value: 2 },
        ],
        summary: {
          total: 30,
          average: 6,
          min: 2,
          max: 10,
          change: -8,
          changePercent: -80,
        },
      };
      (repository.fetchTimeSeriesData as jest.Mock).mockResolvedValue(mockData);
      const result = await calculateTrend(
        "user-123",
        "sessions_completed",
        "last_7_days",
        3,
      );
      expect(result.direction).toBe("down");
      expect(result.strength).toBeGreaterThan(0);
    });

    it("should detect flat trend", async () => {
      const mockData = {
        metric: "streak_days",
        granularity: "day",
        points: [
          { timestamp: 1, value: 5 },
          { timestamp: 2, value: 5 },
          { timestamp: 3, value: 5 },
        ],
        summary: {
          total: 15,
          average: 5,
          min: 5,
          max: 5,
          change: 0,
          changePercent: 0,
        },
      };
      (repository.fetchTimeSeriesData as jest.Mock).mockResolvedValue(mockData);
      const result = await calculateTrend(
        "user-123",
        "streak_days",
        "last_7_days",
        3,
      );
      expect(result.direction).toBe("flat");
      expect(result.strength).toBeLessThan(0.2);
    });

    it("should detect outliers", async () => {
      const mockData = {
        metric: "xp_earned",
        granularity: "day",
        points: [
          { timestamp: 1, value: 100 },
          { timestamp: 2, value: 110 },
          { timestamp: 3, value: 500 },
          { timestamp: 4, value: 105 },
          { timestamp: 5, value: 115 },
        ],
        summary: {
          total: 930,
          average: 186,
          min: 100,
          max: 500,
          change: 0,
          changePercent: 0,
        },
      };
      (repository.fetchTimeSeriesData as jest.Mock).mockResolvedValue(mockData);
      const result = await calculateTrend(
        "user-123",
        "xp_earned",
        "last_7_days",
      );
      expect(result.outliers.length).toBe(0);
    });
  });

  describe("exportAnalyticsData", () => {
    it("should create export job and emit event", async () => {
      const mockJob = {
        id: "job-123",
        userId: "user-123",
        status: "pending",
        format: "json",
        dataTypes: ["sessions", "xp", "streaks", "boss", "items"],
        dateRange: { start: 1, end: 2 },
        progress: 0,
        createdAt: Date.now(),
      };
      (repository.createExportJob as jest.Mock).mockResolvedValue(mockJob);
      const result = await exportAnalyticsData("user-123", "json", {
        start: 1,
        end: 2,
      });
      expect(result.id).toBe("job-123");
      expect(result.status).toBe("pending");
      expect(repository.createExportJob).toHaveBeenCalled();
      expect(eventBus.publish).toHaveBeenCalledWith(
        "analytics:export_requested",
        expect.objectContaining({
          jobId: "job-123",
          userId: "user-123",
          format: "json",
        }),
      );
    });
  });
});
