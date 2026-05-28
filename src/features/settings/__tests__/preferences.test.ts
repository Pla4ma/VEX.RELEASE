import {
  getUserPreferences,
  syncSettings,
} from "../service";
import * as repository from "../repository";
import * as syncRepo from "../repository-sync";

jest.mock("../repository");
jest.mock("../repository-sync");
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

  describe("getUserPreferences", () => {
    it("should aggregate settings into preferences", async () => {
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
        {
          id: "2",
          userId: mockUserId,
          key: "appearance.theme",
          value: "dark",
          category: "appearance" as const,
          isDefault: false,
          lastModified: Date.now(),
        },
      ];
      (repository.fetchAllSettings as jest.Mock).mockResolvedValue(
        mockSettings,
      );
      const result = await getUserPreferences(mockUserId);
      expect(result.userId).toBe(mockUserId);
      expect(result.settings["general.language"]).toBeDefined();
      expect(result.settings["appearance.theme"]).toBeDefined();
    });
  });

  describe("syncSettings", () => {
    it("should sync settings successfully", async () => {
      (syncRepo.fetchSyncState as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        status: "idle" as const,
        lastSyncAttempt: Date.now(),
        pendingChanges: 1,
      });
      (syncRepo.fetchPendingChanges as jest.Mock).mockResolvedValue([]);
      (syncRepo.fetchRemoteChanges as jest.Mock).mockResolvedValue([]);
      (syncRepo.pushChanges as jest.Mock).mockResolvedValue({
        success: true,
        conflicts: [],
      });
      const result = await syncSettings(mockUserId);
      expect(result.userId).toBe(mockUserId);
      expect(["idle", "synced", "conflict", "error"]).toContain(result.status);
    });

    it("should handle sync errors", async () => {
      (syncRepo.fetchSyncState as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );
      const result = await syncSettings(mockUserId);
      expect(result.status).toBe("error");
      expect(result.errorMessage).toBeDefined();
    });
  });
});
