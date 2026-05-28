import type { SettingsExport } from "../types";
import {
  exportSettings,
  importSettings,
  resetSettings,
  SettingsValidationError,
} from "../service";
import * as repository from "../repository";
import { eventBus } from "../../../events";

jest.mock("../repository");
jest.mock("../../../events", () => ({ eventBus: { publish: jest.fn() } }));
jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

const mockUserId = "user-123";

function createMinimalExport(
  overrides: Partial<SettingsExport> = {},
): SettingsExport {
  return {
    version: 1,
    exportedAt: Date.now(),
    userId: mockUserId,
    preferences: {
      userId: mockUserId,
      version: 1,
      settings: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    notificationSettings: {
      userId: mockUserId,
      channels: {
        push: { enabled: true, deviceTokens: [], timezone: "UTC" },
        email: { enabled: false, email: "", digestFrequency: "daily" },
        inApp: { enabled: true, soundEnabled: true, vibrationEnabled: true },
      },
      preferences: {
        critical: { enabled: true, channels: ["push", "email", "in_app"] },
        high: { enabled: true, channels: ["push", "in_app"] },
        normal: { enabled: true, channels: ["in_app"] },
        low: { enabled: false, channels: [] },
      },
      customRules: [],
    },
    coachSettings: {
      userId: mockUserId,
      enabled: true,
      personality: "supportive",
      frequency: "moderate",
      messageTypes: {
        streakReminders: true,
        sessionTips: true,
        milestoneCelebrations: true,
        encouragement: true,
        challenges: false,
      },
      quietHours: {
        enabled: true,
        start: "22:00",
        end: "08:00",
        timezone: "UTC",
      },
      customTriggers: [],
    },
    appearanceSettings: {
      userId: mockUserId,
      theme: "system",
      accentColor: "#6366f1",
      fontScale: 1,
      useSystemFont: true,
      reduceMotion: false,
      highContrast: false,
      compactMode: false,
    },
    privacySettings: {
      userId: mockUserId,
      profileVisibility: "friends",
      showOnlineStatus: true,
      showActivityStatus: true,
      allowDataAnalysis: true,
      allowPersonalization: true,
      thirdPartySharing: false,
      analyticsOptOut: false,
    },
    dataControlSettings: {
      userId: mockUserId,
      retentionPolicy: "standard",
      autoExport: { enabled: false, frequency: "never", format: "json" },
      backupEnabled: false,
    },
    ...overrides,
  };
}

describe("SettingsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("export/import", () => {
    it("should export settings", async () => {
      const mockSettings = [
        {
          id: "1",
          userId: mockUserId,
          key: "general.language",
          value: "en",
          category: "general" as const,
          isDefault: true,
          lastModified: Date.now(),
        },
      ];
      (repository.fetchAllSettings as jest.Mock).mockResolvedValue(
        mockSettings,
      );
      const result = await exportSettings(mockUserId);
      expect(result.userId).toBe(mockUserId);
      expect(result.version).toBe(1);
      expect(result.preferences).toBeDefined();
    });

    it("should import settings", async () => {
      (repository.batchUpsertSettings as jest.Mock).mockResolvedValue([]);
      const exportData = createMinimalExport({
        preferences: {
          userId: mockUserId,
          version: 1,
          settings: {
            "general.language": {
              id: "1",
              userId: mockUserId,
              key: "general.language",
              value: "es",
              category: "general" as const,
              isDefault: false,
              lastModified: Date.now(),
            },
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });
      const result = await importSettings(mockUserId, exportData);
      expect(result.imported).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid export version", async () => {
      const exportData = createMinimalExport({ version: 999 });
      await expect(importSettings(mockUserId, exportData)).rejects.toThrow(
        SettingsValidationError,
      );
    });
  });

  describe("resetSettings", () => {
    it("should reset settings by category", async () => {
      (repository.resetSettings as jest.Mock).mockResolvedValue(undefined);
      await resetSettings(mockUserId, "appearance");
      expect(repository.resetSettings).toHaveBeenCalledWith(
        mockUserId,
        "appearance",
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        "settings:reset",
        expect.any(Object),
      );
    });

    it("should reset all settings", async () => {
      (repository.resetSettings as jest.Mock).mockResolvedValue(undefined);
      await resetSettings(mockUserId);
      expect(repository.resetSettings).toHaveBeenCalledWith(
        mockUserId,
        undefined,
      );
    });
  });
});
