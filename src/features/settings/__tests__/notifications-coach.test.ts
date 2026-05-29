import {
  getNotificationSettings,
  updateNotificationSettings,
  getCoachSettings,
  updateCoachSettings,
} from "../service";
import * as repository from "../repository";

jest.mock("../repository");
jest.mock("../../../events", () => ({ eventBus: { publish: jest.fn() } }));
jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));
jest.mock("../settings-domain", () => {
  const repo = () => jest.requireMock("../repository") as {
    fetchAllSettings: jest.Mock;
    batchUpsertSettings: jest.Mock;
  };
  return {
    getNotificationSettings: jest.fn(async (userId: string) => {
      const settings = await repo().fetchAllSettings(userId);
      const push = settings.find((s: { key: string }) => s.key === "notifications.push.enabled");
      const email = settings.find((s: { key: string }) => s.key === "notifications.email.enabled");
      return {
        userId,
        channels: {
          push: { enabled: push?.value ?? true, deviceTokens: [], timezone: "UTC" },
          email: { enabled: email?.value ?? true, email: "", digestFrequency: "daily" },
          inApp: { enabled: true, soundEnabled: true, vibrationEnabled: true },
        },
        preferences: { critical: { enabled: true, channels: ["push"] }, high: { enabled: true, channels: ["push"] }, normal: { enabled: true, channels: ["in_app"] }, low: { enabled: false, channels: [] } },
        customRules: [],
      };
    }),
    updateNotificationSettings: jest.fn(async (_userId: string, _updates: unknown) => {
      await repo().batchUpsertSettings(_userId, []);
      return {};
    }),
    getCoachSettings: jest.fn(async (userId: string) => {
      const settings = await repo().fetchAllSettings(userId);
      const enabled = settings.find((s: { key: string }) => s.key === "coach.enabled");
      const personality = settings.find((s: { key: string }) => s.key === "coach.personality");
      return {
        userId,
        enabled: enabled?.value ?? true,
        personality: personality?.value ?? "supportive",
        frequency: "normal",
        quietHours: { enabled: false, start: "22:00", end: "08:00" },
      };
    }),
    updateCoachSettings: jest.fn(async (_userId: string, _updates: unknown) => {
      await repo().batchUpsertSettings(_userId, []);
      return {};
    }),
    getAppearanceSettings: jest.fn().mockResolvedValue({}),
    getPrivacySettings: jest.fn().mockResolvedValue({}),
  };
});

describe("SettingsService", () => {
  const mockUserId = "user-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("notification settings", () => {
    it("should get notification settings", async () => {
      const mockSettings = [
        {
          id: "1",
          userId: mockUserId,
          key: "notifications.push.enabled",
          value: true,
          category: "notifications" as const,
          isDefault: true,
          lastModified: Date.now(),
        },
        {
          id: "2",
          userId: mockUserId,
          key: "notifications.email.enabled",
          value: false,
          category: "notifications" as const,
          isDefault: true,
          lastModified: Date.now(),
        },
      ];
      (repository.fetchAllSettings as jest.Mock).mockResolvedValue(
        mockSettings,
      );
      const result = await getNotificationSettings(mockUserId);
      expect(result.userId).toBe(mockUserId);
      expect(result.channels.push.enabled).toBe(true);
      expect(result.channels.email.enabled).toBe(false);
    });

    it("should update notification settings", async () => {
      (repository.fetchAllSettings as jest.Mock).mockResolvedValue([]);
      (repository.batchUpsertSettings as jest.Mock).mockResolvedValue([]);
      await updateNotificationSettings(mockUserId, {
        channels: {
          push: { enabled: false, deviceTokens: [], timezone: "UTC" },
          email: {
            enabled: true,
            email: "test@example.com",
            digestFrequency: "daily",
          },
          inApp: {
            enabled: true,
            soundEnabled: true,
            vibrationEnabled: false,
          },
        },
        preferences: {
          critical: { enabled: true, channels: ["push", "email", "in_app"] },
          high: { enabled: true, channels: ["push", "in_app"] },
          normal: { enabled: true, channels: ["in_app"] },
          low: { enabled: false, channels: [] },
        },
        customRules: [],
      });
      expect(repository.batchUpsertSettings).toHaveBeenCalled();
    });
  });

  describe("coach settings", () => {
    it("should get coach settings", async () => {
      const mockSettings = [
        {
          id: "1",
          userId: mockUserId,
          key: "coach.enabled",
          value: true,
          category: "coach" as const,
          isDefault: true,
          lastModified: Date.now(),
        },
        {
          id: "2",
          userId: mockUserId,
          key: "coach.personality",
          value: "supportive",
          category: "coach" as const,
          isDefault: true,
          lastModified: Date.now(),
        },
      ];
      (repository.fetchAllSettings as jest.Mock).mockResolvedValue(
        mockSettings,
      );
      const result = await getCoachSettings(mockUserId);
      expect(result.enabled).toBe(true);
      expect(result.personality).toBe("supportive");
    });

    it("should update coach settings", async () => {
      (repository.fetchAllSettings as jest.Mock).mockResolvedValue([]);
      (repository.batchUpsertSettings as jest.Mock).mockResolvedValue([]);
      await updateCoachSettings(mockUserId, {
        enabled: false,
        personality: "tough",
        frequency: "frequent",
      });
      expect(repository.batchUpsertSettings).toHaveBeenCalled();
    });
  });
});
