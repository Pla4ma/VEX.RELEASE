import { describe, expect, it, beforeEach } from "@jest/globals";

jest.mock("../../../shared/hardening", () => ({
  withRetry: (fn: () => unknown) => fn(),
  TTLCache: class {
    _store = new Map();
    get(key: string) { return this._store.get(key); }
    set(key: string, value: unknown) { this._store.set(key, value); }
    delete(key: string) { this._store.delete(key); }
    clear() { this._store.clear(); }
  },
  CircuitBreaker: class { async execute(fn: () => unknown) { return fn(); } },
  classifyError: (err: Error) => ({ type: "unknown", retryable: false }),
}));
jest.mock("../../../events", () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn().mockReturnValue(jest.fn()),
  },
}));
jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));
jest.mock("../settings-sync", () => ({
  syncSettings: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../settings-domain", () => ({
  getNotificationSettings: jest.fn(),
  updateNotificationSettings: jest.fn(),
  getCoachSettings: jest.fn(),
  updateCoachSettings: jest.fn(),
  getAppearanceSettings: jest.fn(),
  updateAppearanceSettings: jest.fn(),
  getPrivacySettings: jest.fn(),
  updatePrivacySettings: jest.fn(),
}));
jest.mock("../repository", () => ({
  fetchSetting: jest.fn(),
  fetchAllSettings: jest.fn(),
  upsertSetting: jest.fn(),
  batchUpsertSettings: jest.fn(),
  deleteSetting: jest.fn(),
  resetSettings: jest.fn(),
  fetchSettingsByCategory: jest.fn(),
  getSettingsVersion: jest.fn(),
  mapFromDb: jest.fn(),
}));

import {
  getSetting,
  getAllSettings,
  updateSetting,
  batchUpdateSettings,
  deleteSetting,
  resetSettings,
  getUserPreferences,
} from "../service";
import { SettingsValidationError } from "../settings-validation";

const repository = jest.requireMock("../repository") as Record<string, jest.Mock>;

const makeSetting = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: "550e8400-e29b-41d4-a716-446655440010",
  userId: "550e8400-e29b-41d4-a716-446655440020",
  key: "general.language",
  value: "en",
  category: "general" as const,
  isDefault: true,
  lastModified: Date.now(),
  ...overrides,
});

describe("settings service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSetting", () => {
    it("returns a setting from the repository", async () => {
      const setting = makeSetting();
      repository.fetchSetting.mockResolvedValue(setting);
      const result = await getSetting("user-1", "general.language");
      expect(result).toEqual(setting);
      expect(repository.fetchSetting).toHaveBeenCalledWith("user-1", "general.language");
    });

    it("returns null when setting not found", async () => {
      repository.fetchSetting.mockResolvedValue(null);
      const result = await getSetting("user-1", "nonexistent.key");
      expect(result).toBeNull();
    });

    it("throws when repository errors", async () => {
      repository.fetchSetting.mockRejectedValue(new Error("db error"));
      await expect(getSetting("user-1", "key")).rejects.toThrow("db error");
    });
  });

  describe("getAllSettings", () => {
    it("returns all settings from repository", async () => {
      const settings = [makeSetting({ key: "a" }), makeSetting({ key: "b" })];
      repository.fetchAllSettings.mockResolvedValue(settings);
      const result = await getAllSettings("user-1");
      expect(result).toHaveLength(2);
    });

    it("throws on error", async () => {
      repository.fetchAllSettings.mockRejectedValue(new Error("db error"));
      await expect(getAllSettings("user-1")).rejects.toThrow("db error");
    });
  });

  describe("updateSetting", () => {
    it("validates and upserts a setting", async () => {
      const setting = makeSetting({ key: "general.language", value: "es", category: "general" });
      repository.fetchSetting.mockResolvedValue(null);
      repository.upsertSetting.mockResolvedValue(setting);
      const result = await updateSetting("user-1", "general.language", "es", "general");
      expect(result.key).toBe("general.language");
      expect(repository.upsertSetting).toHaveBeenCalled();
    });

    it("throws SettingsValidationError for invalid value", async () => {
      repository.fetchSetting.mockResolvedValue(null);
      await expect(
        updateSetting("user-1", "appearance.fontScale", 10, "appearance"),
      ).rejects.toThrow(SettingsValidationError);
    });
  });

  describe("batchUpdateSettings", () => {
    it("validates and upserts multiple settings", async () => {
      const settings = [
        makeSetting({ key: "a", category: "general" }),
        makeSetting({ key: "b", category: "general" }),
      ];
      repository.batchUpsertSettings.mockResolvedValue(settings);
      const result = await batchUpdateSettings("user-1", [
        { key: "a", value: "x", category: "general" },
        { key: "b", value: "y", category: "general" },
      ]);
      expect(result).toHaveLength(2);
    });

    it("throws when batch validation fails", async () => {
      await expect(
        batchUpdateSettings("user-1", [
          { key: "appearance.fontScale", value: 10, category: "appearance" },
        ]),
      ).rejects.toThrow(SettingsValidationError);
    });
  });

  describe("deleteSetting", () => {
    it("deletes a setting and returns true", async () => {
      repository.deleteSetting.mockResolvedValue(undefined);
      const result = await deleteSetting("user-1", "general.language");
      expect(result).toBe(true);
    });

    it("throws on error", async () => {
      repository.deleteSetting.mockRejectedValue(new Error("db error"));
      await expect(deleteSetting("user-1", "key")).rejects.toThrow("db error");
    });
  });

  describe("resetSettings", () => {
    it("resets settings without category", async () => {
      repository.resetSettings.mockResolvedValue(undefined);
      await expect(resetSettings("user-1")).resolves.toBeUndefined();
    });

    it("resets settings for a specific category", async () => {
      repository.resetSettings.mockResolvedValue(undefined);
      repository.fetchAllSettings.mockResolvedValue([]);
      await expect(resetSettings("user-1", "notifications")).resolves.toBeUndefined();
    });
  });

  describe("getUserPreferences", () => {
    it("builds preferences from all settings", async () => {
      const settings = [makeSetting({ key: "general.language" })];
      repository.fetchAllSettings.mockResolvedValue(settings);
      const prefs = await getUserPreferences("user-1");
      expect(prefs.userId).toBe("user-1");
      expect(prefs.version).toBe(1);
      expect(prefs.settings["general.language"]).toBeDefined();
    });
  });
});
