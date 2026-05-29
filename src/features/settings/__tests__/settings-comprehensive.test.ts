import { describe, expect, it, beforeEach } from "@jest/globals";

// ── Mock all external dependencies ─────────────────────────────────────
jest.mock("../../../shared/hardening", () => ({
  withRetry: (fn: () => unknown) => fn(),
  TTLCache: class {
    _store = new Map();
    get(key: string) {
      return this._store.get(key);
    }
    set(key: string, value: unknown) {
      this._store.set(key, value);
    }
    delete(key: string) {
      this._store.delete(key);
    }
    clear() {
      this._store.clear();
    }
  },
  CircuitBreaker: class {
    async execute(fn: () => unknown) {
      return fn();
    }
  },
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

jest.mock("../../../shared/analytics/analytics-service", () => ({
  capture: jest.fn(),
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

jest.mock("../repository-sync", () => ({
  fetchSyncState: jest.fn(),
  updateSyncState: jest.fn(),
  trackPendingChange: jest.fn(),
  clearPendingChange: jest.fn(),
  fetchPendingChanges: jest.fn(),
  pushChanges: jest.fn(),
  fetchRemoteChanges: jest.fn(),
  applyRemoteChanges: jest.fn(),
  resolveConflict: jest.fn(),
}));

jest.mock("../../../persistence/MMKVStorageAdapter", () => ({
  getMMKVStorageAdapter: jest.fn(),
}));

jest.mock("@theme/tokens/launch-colors", () => ({
  launchColors: { hex_6366f1: "#6366f1" },
}));

jest.mock("../../../utils/silent-failure", () => ({
  captureSilentFailure: jest.fn(),
}));

// ── Imports ────────────────────────────────────────────────────────────
import {
  getSetting,
  getAllSettings,
  updateSetting,
  batchUpdateSettings,
  deleteSetting,
  resetSettings,
  getUserPreferences,
  exportSettings,
  importSettings,
} from "../service";
import {
  validateSettingValue,
  resolveConflict,
  SettingsValidationError,
} from "../settings-validation";
import {
  validateSettingValue as validateSettingValueNew,
  validateSettingsExport,
  batchValidateSettings,
  formatValidationErrors,
} from "../validation";
import {
  validateNotificationSetting,
  validateAppearanceSetting,
} from "../validation-notification";
import {
  validateCoachSetting,
  validatePrivacySetting,
  validateGeneralSetting,
  validateDataSetting,
} from "../validation-preference";
import {
  buildNotificationSettings,
  buildCoachSettings,
  buildAppearanceSettings,
  buildPrivacySettings,
} from "../settings-builders";
import {
  createDefaultSettings,
  createDefaultNotificationSettings,
  createDefaultCoachSettings,
  createDefaultAppearanceSettings,
  createDefaultPrivacySettings,
  createDefaultDataControlSettings,
} from "../defaults";
import {
  initializeSettingsEventHandlers,
  emitSettingChange,
  emitSettingsReset,
  trackSettingsAnalytics,
} from "../events";
import { applySettingSideEffects } from "../settings-side-effects";
import {
  SettingCategorySchema,
  NotificationChannelSchema,
  NotificationPrioritySchema,
  CoachPersonalitySchema,
  CoachFrequencySchema,
  ThemeModeSchema,
  DataRetentionPolicySchema,
  ExportFormatSchema,
  SyncStatusSchema,
} from "../enums";
import {
  SettingRowSchema,
  SettingSchema,
  AppearanceSettingsSchema,
  PrivacySettingsSchema,
  DataControlSettingsSchema,
  SyncStateSchema,
} from "../core-schemas";

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

// ── service.ts ─────────────────────────────────────────────────────────
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

// ── settings-validation.ts (older) ────────────────────────────────────
describe("settings-validation (older)", () => {
  describe("validateSettingValue", () => {
    it("rejects undefined values", () => {
      const result = validateSettingValue("test.key", undefined, "general");
      expect(result.valid).toBe(false);
    });

    it("validates notification frequency", () => {
      const result = validateSettingValue("email.frequency", "daily", "notifications");
      expect(result.valid).toBe(true);
    });

    it("rejects invalid notification frequency", () => {
      const result = validateSettingValue("email.frequency", "invalid", "notifications");
      expect(result.valid).toBe(false);
    });

    it("validates quiet hours in range", () => {
      const result = validateSettingValue("push.quietHours", 22, "notifications");
      expect(result.valid).toBe(true);
    });

    it("rejects quiet hours out of range", () => {
      const result = validateSettingValue("push.quietHours", 25, "notifications");
      expect(result.valid).toBe(false);
    });

    it("validates appearance font scale", () => {
      const result = validateSettingValue("fontScale", 1.2, "appearance");
      expect(result.valid).toBe(true);
    });

    it("rejects out-of-range font scale", () => {
      const result = validateSettingValue("fontScale", 3.0, "appearance");
      expect(result.valid).toBe(false);
    });

    it("validates theme values", () => {
      const result = validateSettingValue("theme", "dark", "appearance");
      expect(result.valid).toBe(true);
    });

    it("rejects invalid theme", () => {
      const result = validateSettingValue("theme", "invalid", "appearance");
      expect(result.valid).toBe(false);
    });

    it("validates coach frequency", () => {
      const result = validateSettingValue("coach.frequency", "low", "coach");
      expect(result.valid).toBe(true);
    });

    it("rejects invalid coach frequency", () => {
      const result = validateSettingValue("coach.frequency", "invalid", "coach");
      expect(result.valid).toBe(false);
    });

    it("returns sanitized value on success", () => {
      const result = validateSettingValue("key", "valid", "general");
      expect(result.sanitized).toBe("valid");
    });
  });

  describe("resolveConflict", () => {
    it("returns local when local is newer", () => {
      expect(resolveConflict({ localTimestamp: 200, remoteTimestamp: 100 })).toBe("local");
    });

    it("returns remote when remote is newer", () => {
      expect(resolveConflict({ localTimestamp: 100, remoteTimestamp: 200 })).toBe("remote");
    });
  });

  describe("SettingsValidationError", () => {
    it("has correct name, key, and validationErrors", () => {
      const err = new SettingsValidationError("test message", "test.key", ["err1"]);
      expect(err.name).toBe("SettingsValidationError");
      expect(err.key).toBe("test.key");
      expect(err.validationErrors).toEqual(["err1"]);
      expect(err.message).toBe("test message");
    });
  });
});

// ── validation.ts (newer) ──────────────────────────────────────────────
describe("validation.ts (newer)", () => {
  describe("validateSettingValue", () => {
    it("rejects undefined values", () => {
      const result = validateSettingValueNew("test.key", undefined, "general");
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("UNDEFINED_VALUE");
    });

    it("warns about dot-notation key format", () => {
      const result = validateSettingValueNew("noDotKey", "value", "general");
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === "INVALID_KEY_FORMAT")).toBe(true);
    });

    it("validates valid notification frequency", () => {
      const result = validateSettingValueNew("notifications.email.digestFrequency", "daily", "notifications");
      expect(result.valid).toBe(true);
    });

    it("rejects invalid notification frequency", () => {
      const result = validateSettingValueNew("notifications.email.digestFrequency", "invalid", "notifications");
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("INVALID_FREQUENCY");
    });

    it("validates valid theme", () => {
      const result = validateSettingValueNew("appearance.theme", "dark", "appearance");
      expect(result.valid).toBe(true);
    });

    it("rejects invalid theme", () => {
      const result = validateSettingValueNew("appearance.theme", "invalid", "appearance");
      expect(result.valid).toBe(false);
    });

    it("validates coach personality", () => {
      const result = validateSettingValueNew("coach.personality", "supportive", "coach");
      expect(result.valid).toBe(true);
    });

    it("rejects invalid coach personality", () => {
      const result = validateSettingValueNew("coach.personality", "angry", "coach");
      expect(result.valid).toBe(false);
    });

    it("validates privacy visibility", () => {
      const result = validateSettingValueNew("privacy.profileVisibility", "friends", "privacy");
      expect(result.valid).toBe(true);
    });

    it("rejects invalid privacy visibility", () => {
      const result = validateSettingValueNew("privacy.profileVisibility", "everyone", "privacy");
      expect(result.valid).toBe(false);
    });

    it("warns on analytics opt-out", () => {
      const result = validateSettingValueNew("privacy.analyticsOptOut", true, "privacy");
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === "ANALYTICS_DISABLED")).toBe(true);
    });

    it("validates data retention policy", () => {
      const result = validateSettingValueNew("data.retentionPolicy", "standard", "data");
      expect(result.valid).toBe(true);
    });

    it("rejects invalid data retention policy", () => {
      const result = validateSettingValueNew("data.retentionPolicy", "invalid", "data");
      expect(result.valid).toBe(false);
    });

    it("validates general language", () => {
      const result = validateSettingValueNew("general.language", "en", "general");
      expect(result.valid).toBe(true);
    });

    it("warns about unsupported language", () => {
      const result = validateSettingValueNew("general.language", "xx", "general");
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === "UNSUPPORTED_LANGUAGE")).toBe(true);
    });
  });

  describe("validateSettingsExport", () => {
    it("validates a correct export shape", () => {
      const result = validateSettingsExport({
        version: 1,
        userId: "user-1",
        exportedAt: Date.now(),
        preferences: {},
      });
      expect(result.valid).toBe(true);
    });

    it("rejects missing version", () => {
      const result = validateSettingsExport({ userId: "user-1" });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("MISSING_VERSION");
    });

    it("rejects invalid version", () => {
      const result = validateSettingsExport({ version: -1, userId: "user-1" });
      expect(result.valid).toBe(false);
    });

    it("rejects missing userId", () => {
      const result = validateSettingsExport({ version: 1 });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("MISSING_USER_ID");
    });

    it("warns about missing exportedAt", () => {
      const result = validateSettingsExport({ version: 1, userId: "user-1" });
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === "MISSING_TIMESTAMP")).toBe(true);
    });
  });

  describe("batchValidateSettings", () => {
    it("validates multiple settings and returns summary", async () => {
      const result = await batchValidateSettings([
        { key: "notifications.email.digestFrequency", value: "daily", category: "notifications" },
        { key: "appearance.theme", value: "dark", category: "appearance" },
      ]);
      expect(result.summary.total).toBe(2);
      expect(result.summary.valid).toBe(2);
    });

    it("counts errors in summary", async () => {
      const result = await batchValidateSettings([
        { key: "notifications.email.digestFrequency", value: "invalid", category: "notifications" },
        { key: "appearance.theme", value: "dark", category: "appearance" },
      ]);
      expect(result.summary.valid).toBe(1);
      expect(result.summary.invalid).toBe(1);
    });
  });

  describe("formatValidationErrors", () => {
    it("formats errors into readable string", () => {
      const formatted = formatValidationErrors([
        { field: "test.key", code: "ERR", message: "Test error", severity: "error", recoveryHint: "Fix it" },
      ]);
      expect(formatted).toContain("[ERROR]");
      expect(formatted).toContain("Test error");
      expect(formatted).toContain("Fix it");
    });
  });
});

// ── settings-builders.ts ──────────────────────────────────────────────
describe("settings-builders", () => {
  const mockSetting = (key: string, value: unknown) => makeSetting({ key, value });

  describe("buildNotificationSettings", () => {
    it("returns defaults when no settings present", () => {
      const result = buildNotificationSettings("user-1", []);
      expect(result.userId).toBe("user-1");
      expect(result.channels.push.enabled).toBe(true);
      expect(result.channels.email.digestFrequency).toBe("daily");
    });

    it("overrides defaults with settings", () => {
      const settings = [
        mockSetting("notifications.push.enabled", false),
        mockSetting("notifications.email.digestFrequency", "weekly"),
      ];
      const result = buildNotificationSettings("user-1", settings);
      expect(result.channels.push.enabled).toBe(false);
      expect(result.channels.email.digestFrequency).toBe("weekly");
    });
  });

  describe("buildCoachSettings", () => {
    it("returns defaults when no settings present", () => {
      const result = buildCoachSettings("user-1", []);
      expect(result.enabled).toBe(true);
      expect(result.personality).toBe("supportive");
      expect(result.frequency).toBe("moderate");
    });

    it("overrides defaults with settings", () => {
      const settings = [
        mockSetting("coach.enabled", false),
        mockSetting("coach.personality", "tough"),
      ];
      const result = buildCoachSettings("user-1", settings);
      expect(result.enabled).toBe(false);
      expect(result.personality).toBe("tough");
    });
  });

  describe("buildAppearanceSettings", () => {
    it("returns defaults when no settings present", () => {
      const result = buildAppearanceSettings("user-1", []);
      expect(result.theme).toBe("system");
      expect(result.fontScale).toBe(1);
      expect(result.reduceMotion).toBe(false);
    });

    it("overrides defaults with settings", () => {
      const settings = [
        mockSetting("appearance.theme", "dark"),
        mockSetting("appearance.fontScale", 1.3),
      ];
      const result = buildAppearanceSettings("user-1", settings);
      expect(result.theme).toBe("dark");
      expect(result.fontScale).toBe(1.3);
    });
  });

  describe("buildPrivacySettings", () => {
    it("returns defaults when no settings present", () => {
      const result = buildPrivacySettings("user-1", []);
      expect(result.profileVisibility).toBe("friends");
      expect(result.showOnlineStatus).toBe(true);
      expect(result.analyticsOptOut).toBe(false);
    });

    it("overrides defaults with settings", () => {
      const settings = [
        mockSetting("privacy.profileVisibility", "private"),
        mockSetting("privacy.analyticsOptOut", true),
      ];
      const result = buildPrivacySettings("user-1", settings);
      expect(result.profileVisibility).toBe("private");
      expect(result.analyticsOptOut).toBe(true);
    });
  });
});

// ── defaults.ts ────────────────────────────────────────────────────────
describe("defaults", () => {
  it("createDefaultSettings returns valid UserPreferences", () => {
    const prefs = createDefaultSettings("550e8400-e29b-41d4-a716-446655440020");
    expect(prefs.userId).toBe("550e8400-e29b-41d4-a716-446655440020");
    expect(prefs.version).toBe(1);
    expect(prefs.settings["general.language"]).toBeDefined();
    expect(prefs.settings["general.timezone"]).toBeDefined();
  });

  it("createDefaultNotificationSettings throws due to empty email default (source bug)", () => {
    // NOTE: The source code defaults email to "" which fails Zod's .email() validator.
    // This test documents the known issue rather than masking it.
    expect(() =>
      createDefaultNotificationSettings("550e8400-e29b-41d4-a716-446655440020"),
    ).toThrow();
  });

  it("createDefaultCoachSettings returns valid shape", () => {
    const cs = createDefaultCoachSettings("550e8400-e29b-41d4-a716-446655440020");
    expect(cs.enabled).toBe(true);
    expect(cs.personality).toBe("supportive");
    expect(cs.quietHours.enabled).toBe(true);
    expect(cs.quietHours.start).toBe("22:00");
  });

  it("createDefaultAppearanceSettings returns valid shape", () => {
    const as = createDefaultAppearanceSettings("550e8400-e29b-41d4-a716-446655440020");
    expect(as.theme).toBe("system");
    expect(as.fontScale).toBe(1);
    expect(as.reduceMotion).toBe(false);
    expect(as.highContrast).toBe(false);
  });

  it("createDefaultPrivacySettings returns valid shape", () => {
    const ps = createDefaultPrivacySettings("550e8400-e29b-41d4-a716-446655440020");
    expect(ps.profileVisibility).toBe("friends");
    expect(ps.thirdPartySharing).toBe(false);
    expect(ps.analyticsOptOut).toBe(false);
  });

  it("createDefaultDataControlSettings returns valid shape", () => {
    const dc = createDefaultDataControlSettings("550e8400-e29b-41d4-a716-446655440020");
    expect(dc.retentionPolicy).toBe("standard");
    expect(dc.autoExport.enabled).toBe(false);
    expect(dc.autoExport.frequency).toBe("never");
    expect(dc.backupEnabled).toBe(true);
  });
});

// ── settings-side-effects.ts ───────────────────────────────────────────
describe("applySettingSideEffects", () => {
  it("does not throw for appearance keys", () => {
    expect(() => applySettingSideEffects("appearance.theme", "dark")).not.toThrow();
    expect(() => applySettingSideEffects("appearance.fontScale", 1.2)).not.toThrow();
    expect(() => applySettingSideEffects("appearance.reduceMotion", true)).not.toThrow();
  });

  it("does not throw for notification keys", () => {
    expect(() => applySettingSideEffects("notifications.push.enabled", true)).not.toThrow();
    expect(() => applySettingSideEffects("notifications.push.enabled", false)).not.toThrow();
    expect(() => applySettingSideEffects("notifications.push.quietHoursStart", 22)).not.toThrow();
  });

  it("does not throw for coach keys", () => {
    expect(() => applySettingSideEffects("coach.enabled", true)).not.toThrow();
    expect(() => applySettingSideEffects("coach.enabled", false)).not.toThrow();
    expect(() => applySettingSideEffects("coach.personality", "tough")).not.toThrow();
  });

  it("does not throw for privacy keys", () => {
    expect(() => applySettingSideEffects("privacy.analyticsOptOut", true)).not.toThrow();
    expect(() => applySettingSideEffects("privacy.analyticsOptOut", false)).not.toThrow();
    expect(() => applySettingSideEffects("privacy.allowDataAnalysis", true)).not.toThrow();
    expect(() => applySettingSideEffects("privacy.profileVisibility", "private")).not.toThrow();
  });

  it("handles unknown keys without error", () => {
    expect(() => applySettingSideEffects("unknown.key", "value")).not.toThrow();
  });
});

// ── events.ts ──────────────────────────────────────────────────────────
describe("settings events", () => {
  it("initializeSettingsEventHandlers returns cleanup function", () => {
    const cleanup = initializeSettingsEventHandlers();
    expect(typeof cleanup).toBe("function");
    cleanup();
  });

  it("emitSettingChange does not throw", () => {
    expect(() => emitSettingChange("test.key", "new", "old")).not.toThrow();
  });

  it("emitSettingsReset does not throw", () => {
    expect(() => emitSettingsReset()).not.toThrow();
    expect(() => emitSettingsReset("notifications")).not.toThrow();
  });

  it("trackSettingsAnalytics does not throw", () => {
    expect(() => trackSettingsAnalytics("change")).not.toThrow();
    expect(() => trackSettingsAnalytics("reset", { category: "all" })).not.toThrow();
    expect(() => trackSettingsAnalytics("export")).not.toThrow();
    expect(() => trackSettingsAnalytics("import")).not.toThrow();
    expect(() => trackSettingsAnalytics("sync")).not.toThrow();
  });
});

// ── enums.ts ───────────────────────────────────────────────────────────
describe("settings enums", () => {
  it("SettingCategorySchema accepts valid categories", () => {
    for (const cat of ["general", "notifications", "coach", "appearance", "privacy", "data", "advanced"]) {
      expect(SettingCategorySchema.safeParse(cat).success).toBe(true);
    }
    expect(SettingCategorySchema.safeParse("invalid").success).toBe(false);
  });

  it("NotificationChannelSchema accepts valid channels", () => {
    for (const ch of ["push", "email", "in_app", "sms"]) {
      expect(NotificationChannelSchema.safeParse(ch).success).toBe(true);
    }
  });

  it("NotificationPrioritySchema accepts valid priorities", () => {
    for (const p of ["critical", "high", "normal", "low"]) {
      expect(NotificationPrioritySchema.safeParse(p).success).toBe(true);
    }
  });

  it("CoachPersonalitySchema accepts valid personalities", () => {
    for (const p of ["supportive", "tough", "neutral", "funny"]) {
      expect(CoachPersonalitySchema.safeParse(p).success).toBe(true);
    }
  });

  it("CoachFrequencySchema accepts valid frequencies", () => {
    for (const f of ["minimal", "moderate", "frequent", "constant"]) {
      expect(CoachFrequencySchema.safeParse(f).success).toBe(true);
    }
  });

  it("ThemeModeSchema accepts valid themes", () => {
    for (const t of ["light", "dark", "system"]) {
      expect(ThemeModeSchema.safeParse(t).success).toBe(true);
    }
    expect(ThemeModeSchema.safeParse("high-contrast").success).toBe(false);
  });

  it("DataRetentionPolicySchema accepts valid policies", () => {
    for (const p of ["minimal", "standard", "comprehensive", "forever"]) {
      expect(DataRetentionPolicySchema.safeParse(p).success).toBe(true);
    }
  });

  it("ExportFormatSchema accepts valid formats", () => {
    for (const f of ["json", "csv", "pdf"]) {
      expect(ExportFormatSchema.safeParse(f).success).toBe(true);
    }
  });

  it("SyncStatusSchema accepts valid statuses", () => {
    for (const s of ["idle", "syncing", "error", "conflict"]) {
      expect(SyncStatusSchema.safeParse(s).success).toBe(true);
    }
  });
});

// ── core-schemas.ts ────────────────────────────────────────────────────
describe("core-schemas", () => {
  it("SettingRowSchema validates correct DB row shape", () => {
    const result = SettingRowSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440010",
      user_id: "user-1",
      key: "general.language",
      value: "en",
      category: "general",
      is_default: true,
      last_modified: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  it("AppearanceSettingsSchema validates correct shape", () => {
    const result = AppearanceSettingsSchema.safeParse({
      userId: "550e8400-e29b-41d4-a716-446655440020",
      theme: "system",
      accentColor: "#6366f1",
      fontScale: 1,
      useSystemFont: true,
      reduceMotion: false,
      highContrast: false,
      compactMode: false,
    });
    expect(result.success).toBe(true);
  });

  it("AppearanceSettingsSchema rejects invalid hex color", () => {
    const result = AppearanceSettingsSchema.safeParse({
      userId: "550e8400-e29b-41d4-a716-446655440020",
      theme: "system",
      accentColor: "red",
      fontScale: 1,
      useSystemFont: true,
      reduceMotion: false,
      highContrast: false,
      compactMode: false,
    });
    expect(result.success).toBe(false);
  });

  it("PrivacySettingsSchema validates correct shape", () => {
    const result = PrivacySettingsSchema.safeParse({
      userId: "550e8400-e29b-41d4-a716-446655440020",
      profileVisibility: "friends",
      showOnlineStatus: true,
      showActivityStatus: true,
      allowDataAnalysis: true,
      allowPersonalization: true,
      thirdPartySharing: false,
      analyticsOptOut: false,
    });
    expect(result.success).toBe(true);
  });

  it("DataControlSettingsSchema validates correct shape", () => {
    const result = DataControlSettingsSchema.safeParse({
      userId: "550e8400-e29b-41d4-a716-446655440020",
      retentionPolicy: "standard",
      autoExport: { enabled: false, frequency: "never", format: "json" },
      backupEnabled: true,
    });
    expect(result.success).toBe(true);
  });

  it("SyncStateSchema validates correct shape", () => {
    const result = SyncStateSchema.safeParse({
      userId: "550e8400-e29b-41d4-a716-446655440020",
      status: "idle",
      lastSyncAttempt: Date.now(),
      pendingChanges: 0,
      conflicts: [],
    });
    expect(result.success).toBe(true);
  });
});

// ── validation-preference.ts ───────────────────────────────────────────
describe("validation-preference validators", () => {
  it("validateCoachSetting accepts valid personality", () => {
    const errors: Array<{ code: string }> = [];
    validateCoachSetting("coach.personality", "supportive", errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it("validateCoachSetting rejects invalid personality", () => {
    const errors: Array<{ code: string }> = [];
    validateCoachSetting("coach.personality", "angry", errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("INVALID_PERSONALITY");
  });

  it("validateCoachSetting validates frequency", () => {
    const errors: Array<{ code: string }> = [];
    validateCoachSetting("coach.frequency", "moderate", errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it("validateCoachSetting rejects invalid frequency", () => {
    const errors: Array<{ code: string }> = [];
    validateCoachSetting("coach.frequency", "sometimes", errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
  });

  it("validateCoachSetting validates quiet hours time format", () => {
    const errors: Array<{ code: string }> = [];
    validateCoachSetting("coach.quietHours.start", "22:00", errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it("validateCoachSetting rejects invalid time format", () => {
    const errors: Array<{ code: string }> = [];
    validateCoachSetting("coach.quietHours.start", "25:00", errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("INVALID_TIME_FORMAT");
  });

  it("validatePrivacySetting accepts valid visibility", () => {
    const errors: Array<{ code: string }> = [];
    validatePrivacySetting("privacy.profileVisibility", "friends", errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it("validatePrivacySetting rejects invalid visibility", () => {
    const errors: Array<{ code: string }> = [];
    validatePrivacySetting("privacy.profileVisibility", "everyone", errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("INVALID_VISIBILITY");
  });

  it("validatePrivacySetting warns on analytics opt-out", () => {
    const warnings: Array<{ code: string }> = [];
    validatePrivacySetting("privacy.analyticsOptOut", true, [] as never[], warnings as never[]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("ANALYTICS_DISABLED");
  });

  it("validateGeneralSetting warns on unsupported language", () => {
    const warnings: Array<{ code: string }> = [];
    validateGeneralSetting("general.language", "xx", [] as never[], warnings as never[]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("UNSUPPORTED_LANGUAGE");
  });

  it("validateDataSetting validates retention policy", () => {
    const errors: Array<{ code: string }> = [];
    validateDataSetting("data.retentionPolicy", "standard", errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it("validateDataSetting rejects invalid retention policy", () => {
    const errors: Array<{ code: string }> = [];
    validateDataSetting("data.retentionPolicy", "invalid", errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("INVALID_RETENTION_POLICY");
  });

  it("validateDataSetting validates export frequency", () => {
    const errors: Array<{ code: string }> = [];
    validateDataSetting("data.autoExport.frequency", "weekly", errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it("validateDataSetting rejects invalid export frequency", () => {
    const errors: Array<{ code: string }> = [];
    validateDataSetting("data.autoExport.frequency", "daily", errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("INVALID_EXPORT_FREQUENCY");
  });
});

// ── validation-notification.ts ─────────────────────────────────────────
describe("validation-notification validators", () => {
  it("validateNotificationSetting accepts valid frequency", () => {
    const errors: Array<{ code: string }> = [];
    validateNotificationSetting("email.digestFrequency", "daily", errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it("validateNotificationSetting rejects invalid frequency", () => {
    const errors: Array<{ code: string }> = [];
    validateNotificationSetting("email.digestFrequency", "invalid", errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("INVALID_FREQUENCY");
  });

  it("validateNotificationSetting rejects invalid quiet hours", () => {
    const errors: Array<{ code: string }> = [];
    validateNotificationSetting("push.quietHoursStart", 25, errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("INVALID_HOUR");
  });

  it("validateNotificationSetting warns about too many device tokens", () => {
    const warnings: Array<{ code: string }> = [];
    const tokens = Array.from({ length: 11 }, (_, i) => `token-${i}`);
    validateNotificationSetting("push.deviceTokens", tokens, [] as never[], warnings as never[]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("TOO_MANY_DEVICE_TOKENS");
  });

  it("validateAppearanceSetting accepts valid font scale", () => {
    const errors: Array<{ code: string }> = [];
    validateAppearanceSetting("appearance.fontScale", 1.2, errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it("validateAppearanceSetting rejects out-of-range font scale", () => {
    const errors: Array<{ code: string }> = [];
    validateAppearanceSetting("appearance.fontScale", 3.0, errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("INVALID_FONT_SCALE");
  });

  it("validateAppearanceSetting warns about large font scale", () => {
    const warnings: Array<{ code: string }> = [];
    validateAppearanceSetting("appearance.fontScale", 1.6, [] as never[], warnings as never[]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("LARGE_FONT_SCALE");
  });

  it("validateAppearanceSetting accepts valid accent color", () => {
    const errors: Array<{ code: string }> = [];
    validateAppearanceSetting("appearance.accentColor", "#6366f1", errors as never[], [] as never[]);
    expect(errors).toHaveLength(0);
  });

  it("validateAppearanceSetting rejects invalid accent color", () => {
    const errors: Array<{ code: string }> = [];
    validateAppearanceSetting("appearance.accentColor", "red", errors as never[], [] as never[]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("INVALID_COLOR");
  });
});
