import {
  validateSettingsExport,
  batchValidateSettings,
  formatValidationErrors,
  SettingsValidationError,
} from "../validation";

describe("validateSettingsExport", () => {
  it("should validate correct export", () => {
    const exportData = {
      version: 1,
      exportedAt: Date.now(),
      userId: "user-123",
      preferences: {},
    };
    const result = validateSettingsExport(exportData);
    expect(result.valid).toBe(true);
  });
  it("should reject missing version", () => {
    const exportData = { userId: "user-123" };
    const result = validateSettingsExport(exportData);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("MISSING_VERSION");
  });
  it("should reject invalid version", () => {
    const exportData = { version: -1, userId: "user-123" };
    const result = validateSettingsExport(exportData);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("INVALID_VERSION");
  });
  it("should reject missing userId", () => {
    const exportData = { version: 1 };
    const result = validateSettingsExport(exportData);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("MISSING_USER_ID");
  });
  it("should warn about missing timestamp", () => {
    const exportData = { version: 1, userId: "user-123" };
    const result = validateSettingsExport(exportData);
    expect(result.valid).toBe(true);
    expect(result.warnings[0].code).toBe("MISSING_TIMESTAMP");
  });
});

describe("batchValidateSettings", () => {
  it("should validate multiple settings", async () => {
    const settings = [
      {
        key: "appearance.theme",
        value: "dark",
        category: "appearance" as const,
      },
      {
        key: "appearance.fontScale",
        value: 1.2,
        category: "appearance" as const,
      },
    ];
    const result = await batchValidateSettings(settings);
    expect(result.summary.total).toBe(2);
    expect(result.summary.valid).toBe(2);
    expect(result.summary.invalid).toBe(0);
  });
  it("should track invalid settings", async () => {
    const settings = [
      {
        key: "appearance.theme",
        value: "dark",
        category: "appearance" as const,
      },
      {
        key: "appearance.fontScale",
        value: 3.0,
        category: "appearance" as const,
      },
    ];
    const result = await batchValidateSettings(settings);
    expect(result.summary.valid).toBe(1);
    expect(result.summary.invalid).toBe(1);
  });
  it("should stop early on too many errors", async () => {
    const settings = [
      { key: "a", value: 3.0, category: "appearance" as const },
      { key: "b", value: 3.0, category: "appearance" as const },
      { key: "c", value: "valid", category: "appearance" as const },
    ];
    const result = await batchValidateSettings(settings, {
      continueOnError: false,
      maxErrors: 1,
    });
    expect(result.summary.errors).toBeGreaterThanOrEqual(1);
  });
});

describe("formatValidationErrors", () => {
  it("should format errors correctly", () => {
    const errors = [
      {
        field: "theme",
        code: "INVALID_THEME",
        message: "Invalid theme",
        severity: "error" as const,
        recoveryHint: "Use light, dark, or system",
      },
      {
        field: "fontScale",
        code: "LARGE_FONT_SCALE",
        message: "Large font scale",
        severity: "warning" as const,
      },
    ];
    const formatted = formatValidationErrors(errors);
    expect(formatted).toContain("[ERROR] theme: Invalid theme");
    expect(formatted).toContain("Hint: Use light, dark, or system");
    expect(formatted).toContain("[WARNING] fontScale: Large font scale");
  });
});

describe("SettingsValidationError", () => {
  it("should create error with all properties", () => {
    const error = new SettingsValidationError(
      "Validation failed",
      "theme",
      "INVALID_THEME",
      "Use valid theme",
    );
    expect(error.message).toBe("Validation failed");
    expect(error.field).toBe("theme");
    expect(error.code).toBe("INVALID_THEME");
    expect(error.recoveryHint).toBe("Use valid theme");
    expect(error.name).toBe("SettingsValidationError");
  });
});
