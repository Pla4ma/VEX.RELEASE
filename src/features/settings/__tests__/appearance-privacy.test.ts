import {
  getAppearanceSettings,
  updateAppearanceSettings,
  getPrivacySettings,
  updatePrivacySettings,
} from "../service";
import * as repository from "../repository";

jest.mock("../repository");
jest.mock("../../../events", () => ({ eventBus: { publish: jest.fn() } }));
jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

describe("SettingsService", () => {
  const mockUserId = "user-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("appearance settings", () => {
    it("should get appearance settings", async () => {
      const mockSettings = [
        {
          id: "1",
          userId: mockUserId,
          key: "appearance.theme",
          value: "dark",
          category: "appearance" as const,
          isDefault: false,
          lastModified: Date.now(),
        },
        {
          id: "2",
          userId: mockUserId,
          key: "appearance.fontScale",
          value: 1.2,
          category: "appearance" as const,
          isDefault: false,
          lastModified: Date.now(),
        },
      ];
      (repository.fetchAllSettings as jest.Mock).mockResolvedValue(
        mockSettings,
      );
      const result = await getAppearanceSettings(mockUserId);
      expect(result.theme).toBe("dark");
      expect(result.fontScale).toBe(1.2);
    });

    it("should update appearance settings", async () => {
      (repository.fetchAllSettings as jest.Mock).mockResolvedValue([]);
      (repository.batchUpsertSettings as jest.Mock).mockResolvedValue([]);
      await updateAppearanceSettings(mockUserId, {
        theme: "light",
        accentColor: "#ff0000",
      });
      expect(repository.batchUpsertSettings).toHaveBeenCalled();
    });
  });

  describe("privacy settings", () => {
    it("should get privacy settings", async () => {
      const mockSettings = [
        {
          id: "1",
          userId: mockUserId,
          key: "privacy.profileVisibility",
          value: "private",
          category: "privacy" as const,
          isDefault: false,
          lastModified: Date.now(),
        },
        {
          id: "2",
          userId: mockUserId,
          key: "privacy.analyticsOptOut",
          value: true,
          category: "privacy" as const,
          isDefault: false,
          lastModified: Date.now(),
        },
      ];
      (repository.fetchAllSettings as jest.Mock).mockResolvedValue(
        mockSettings,
      );
      const result = await getPrivacySettings(mockUserId);
      expect(result.profileVisibility).toBe("private");
      expect(result.analyticsOptOut).toBe(true);
    });

    it("should update privacy settings", async () => {
      (repository.fetchAllSettings as jest.Mock).mockResolvedValue([]);
      (repository.batchUpsertSettings as jest.Mock).mockResolvedValue([]);
      await updatePrivacySettings(mockUserId, {
        profileVisibility: "friends",
        showOnlineStatus: false,
      });
      expect(repository.batchUpsertSettings).toHaveBeenCalled();
    });
  });
});
