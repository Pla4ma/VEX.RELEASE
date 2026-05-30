/**
 * Validation Tests: validateFilter, validateExportConfig
 */

import {
  validateExportConfig,
  validateFilter,
} from "../validation";

// ── Validation: validateFilter ────────────────────────────────────────────────

describe("Validation: validateFilter", () => {
  it("accepts valid filter", () => {
    const result = validateFilter({
      dimension: "session_category",
      operator: "eq",
      value: "boss",
    });
    expect(result.valid).toBe(true);
  });

  it("rejects invalid dimension", () => {
    const result = validateFilter({
      dimension: "invalid_dim",
      operator: "eq",
      value: "boss",
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe("INVALID_DIMENSION");
  });

  it("rejects invalid operator", () => {
    const result = validateFilter({
      dimension: "session_category",
      operator: "contains",
      value: "boss",
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe("INVALID_OPERATOR");
  });

  it("rejects non-array value for 'in' operator", () => {
    const result = validateFilter({
      dimension: "session_category",
      operator: "in",
      value: "boss",
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe("INVALID_VALUE_TYPE");
  });
});

// ── Validation: validateExportConfig ──────────────────────────────────────────

describe("Validation: validateExportConfig", () => {
  const validConfig = {
    format: "json",
    dataTypes: ["sessions"],
    dateRange: { start: Date.now() - 86400000, end: Date.now() },
    userId: "user-123",
  };

  it("accepts valid config", () => {
    const result = validateExportConfig(validConfig);
    expect(result.valid).toBe(true);
  });

  it("rejects invalid format", () => {
    const result = validateExportConfig({ ...validConfig, format: "xml" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "INVALID_FORMAT")).toBe(true);
  });

  it("rejects missing userId", () => {
    const result = validateExportConfig({ ...validConfig, userId: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "MISSING_USER_ID")).toBe(true);
  });

  it("warns on unknown data type", () => {
    const result = validateExportConfig({
      ...validConfig,
      dataTypes: ["sessions", "unknown_type"],
    });
    expect(
      result.warnings.some((w) => w.code === "UNKNOWN_DATA_TYPE"),
    ).toBe(true);
  });
});
