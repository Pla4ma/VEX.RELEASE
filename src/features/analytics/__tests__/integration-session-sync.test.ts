import {
  trackSessionCompleted,
  syncAnalyticsData,
  getRealtimeAnalytics,
  trackBossEncounter,
  trackItemCrafted,
  initializeAnalytics,
} from "../integration";
import * as repository from "../repository";
import { eventBus } from "../../../events";
import * as Sentry from "@sentry/react-native";
import { integrationCache, stateCache } from "../integration-types";
jest.mock("../repository");
jest.mock("../service", () => ({
  generateInsights: jest.fn().mockResolvedValue([]),
}));
jest.mock("../../../events", () => ({ eventBus: { publish: jest.fn() } }));
jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));
jest.mock("../integration-helpers", () => ({
  updateIntegrationState: jest.fn(),
  getTimeOfDay: jest.fn().mockReturnValue("afternoon"),
}));
describe("AnalyticsIntegration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-15T12:00:00Z"));
    integrationCache.clear();
    stateCache.clear();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  describe("trackSessionCompleted", () => {
    it("should track session and emit events", async () => {
      (repository.bulkInsertAnalyticsEvents as jest.Mock).mockResolvedValue(
        undefined,
      );
      await trackSessionCompleted("user-123", {
        sessionId: "session-1",
        duration: 1800,
        xpEarned: 100,
        quality: 85,
        streakDay: 3,
        bossActive: false,
      });
      expect(repository.bulkInsertAnalyticsEvents).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            user_id: "user-123",
            metric_type: "sessions_completed",
            value: 1,
          }),
          expect.objectContaining({
            user_id: "user-123",
            metric_type: "xp_earned",
            value: 100,
          }),
        ]),
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        "analytics:data_refreshed",
        expect.objectContaining({ userId: "user-123" }),
      );
      expect(Sentry.addBreadcrumb).toHaveBeenCalled();
    });
    it("should prevent duplicate processing", async () => {
      (repository.bulkInsertAnalyticsEvents as jest.Mock).mockResolvedValue(
        undefined,
      );
      const sessionData = {
        sessionId: "session-1",
        duration: 1800,
        xpEarned: 100,
        quality: 85,
        streakDay: 3,
        bossActive: false,
      };
      await trackSessionCompleted("user-123", sessionData);
      await trackSessionCompleted("user-123", sessionData);
      expect(repository.bulkInsertAnalyticsEvents).toHaveBeenCalledTimes(1);
    });
    it("should handle errors gracefully", async () => {
      (repository.bulkInsertAnalyticsEvents as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );
      await expect(
        trackSessionCompleted("user-123", {
          sessionId: "session-1",
          duration: 1800,
          xpEarned: 100,
          quality: 85,
          streakDay: 3,
          bossActive: false,
        }),
      ).rejects.toThrow("Database error");
      expect(Sentry.captureException).toHaveBeenCalled();
    });
  });
  describe("syncAnalyticsData", () => {
    it("should sync all data successfully", async () => {
      (repository.fetchAggregatedStats as jest.Mock).mockResolvedValue({
        metrics: { sessions_completed: { value: 5 } },
      });
      (repository.fetchInsights as jest.Mock).mockResolvedValue([]);
      (repository.fetchDetectedPatterns as jest.Mock).mockResolvedValue([]);
      const result = await syncAnalyticsData("user-123");
      expect(result.success).toBe(true);
      expect(result.synced).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(eventBus.publish).toHaveBeenCalledWith(
        "network:sync:complete",
        expect.any(Object),
      );
    });
    it("should handle partial failures", async () => {
      (repository.fetchAggregatedStats as jest.Mock).mockRejectedValue(
        new Error("Stats error"),
      );
      (repository.fetchInsights as jest.Mock).mockResolvedValue([]);
      (repository.fetchDetectedPatterns as jest.Mock).mockRejectedValue(
        new Error("Patterns error"),
      );
      const result = await syncAnalyticsData("user-123");
      expect(result.success).toBe(false);
      expect(result.synced).toBe(0);
      expect(result.failed).toBe(2);
      expect(result.errors).toHaveLength(2);
    });
    it("should handle complete failure", async () => {
      (repository.fetchAggregatedStats as jest.Mock).mockRejectedValue(
        new Error("Connection lost"),
      );
      (repository.fetchInsights as jest.Mock).mockRejectedValue(
        new Error("Connection lost"),
      );
      (repository.fetchDetectedPatterns as jest.Mock).mockRejectedValue(
        new Error("Connection lost"),
      );
      const result = await syncAnalyticsData("user-123");
      expect(result.success).toBe(false);
      expect(result.failed).toBeGreaterThan(0);
    });
  });
  describe("getRealtimeAnalytics", () => {
    it("should return cached data when cache is fresh", async () => {
      (repository.fetchAggregatedStats as jest.Mock).mockResolvedValue({
        metrics: {
          sessions_completed: { value: 5 },
          xp_earned: { value: 500 },
          total_focus_time: { value: 3600 },
          streak_days: { value: 7 },
        },
      });
      (repository.fetchInsights as jest.Mock).mockResolvedValue([
        {
          id: "insight-1",
          type: "milestone",
          title: "7 Day Streak!",
          severity: "celebration",
        },
      ]);
      const result = await getRealtimeAnalytics("user-123");
      expect(result.today.sessions).toBe(5);
      expect(result.today.xp).toBe(500);
      expect(result.today.focusTime).toBe(3600);
      expect(result.streak).toBe(7);
      expect(result.recentInsights).toHaveLength(1);
    });
    it("should return fallback data on error", async () => {
      (repository.fetchAggregatedStats as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );
      (repository.fetchInsights as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );
      const result = await getRealtimeAnalytics("user-123");
      expect(result.today.sessions).toBe(0);
      expect(result.today.xp).toBe(0);
      expect(result.today.focusTime).toBe(0);
      expect(result.streak).toBe(0);
      expect(result.recentInsights).toHaveLength(0);
    });
  });
});
