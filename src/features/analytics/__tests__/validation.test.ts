import {
  validateTimeRange,
  validateMetrics,
  validateExportConfig,
  validateInsight,
  validateFilter,
  batchValidate,
  formatValidationErrors,
  AnalyticsValidationError,
} from "../validation";
describe("AnalyticsValidation", () => {
  describe("validateTimeRange", () => {
    it("should validate correct time range", () => {
      const now = Date.now();
      const start = now - 7 * 24 * 60 * 60 * 1000;
      const result = validateTimeRange(start, now);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitized).toBeDefined();
      expect((result.sanitized as { rangeDays: number })?.rangeDays).toBe(7);
    });
    it("should reject inverted range", () => {
      const now = Date.now();
      const result = validateTimeRange(now, now - 1000);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("INVERTED_RANGE");
    });
    it("should reject range exceeding maximum", () => {
      const now = Date.now();
      const start = now - 400 * 24 * 60 * 60 * 1000;
      const result = validateTimeRange(start, now, 365);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("RANGE_TOO_LARGE");
    });
    it("should warn about future dates", () => {
      const now = Date.now();
      const future = now + 24 * 60 * 60 * 1000;
      const result = validateTimeRange(now, future);
      expect(result.valid).toBe(true);
      expect(result.warnings[0].code).toBe("FUTURE_DATE");
    });
    it("should reject invalid timestamps", () => {
      const result = validateTimeRange(-1, Date.now());
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("INVALID_TIMESTAMP");
    });
    it("should warn about very old data", () => {
      const now = Date.now();
      const old = now - 400 * 24 * 60 * 60 * 1000;
      const result = validateTimeRange(old, now, 500);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === "VERY_OLD_DATA")).toBe(
        true,
      );
    });
  });
  describe("validateMetrics", () => {
    it("should validate valid metrics", () => {
      const result = validateMetrics(["sessions_completed", "xp_earned"]);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    it("should reject empty metrics", () => {
      const result = validateMetrics([]);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("EMPTY_SELECTION");
    });
    it("should reject invalid metrics", () => {
      const result = validateMetrics(["sessions_completed", "invalid_metric"]);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("INVALID_METRICS");
    });
    it("should warn about too many metrics", () => {
      const result = validateMetrics([
        "sessions_completed",
        "xp_earned",
        "streak_days",
        "boss_damage_dealt",
        "items_crafted",
        "coins_spent",
        "challenges_completed",
        "sessions_abandoned",
        "total_focus_time",
        "average_session_duration",
        "longest_streak",
      ]);
      expect(result.valid).toBe(true);
      expect(result.warnings[0].code).toBe("TOO_MANY_METRICS");
    });
    it("should warn about duplicates", () => {
      const result = validateMetrics([
        "sessions_completed",
        "sessions_completed",
      ]);
      expect(result.valid).toBe(true);
      expect(result.warnings[0].code).toBe("DUPLICATE_METRIC");
    });
  });
  describe("validateExportConfig", () => {
    it("should validate correct config", () => {
      const result = validateExportConfig({
        format: "json",
        dateRange: {
          start: Date.now() - 7 * 24 * 60 * 60 * 1000,
          end: Date.now(),
        },
        userId: "user-123",
      });
      expect(result.valid).toBe(true);
      expect(
        (result.sanitized as { estimatedSize: number })?.estimatedSize,
      ).toBeGreaterThan(0);
    });
    it("should reject invalid format", () => {
      const result = validateExportConfig({
        format: "xml",
        dateRange: {
          start: Date.now() - 7 * 24 * 60 * 60 * 1000,
          end: Date.now(),
        },
        userId: "user-123",
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("INVALID_FORMAT");
    });
    it("should reject missing userId", () => {
      const result = validateExportConfig({
        format: "json",
        dateRange: {
          start: Date.now() - 7 * 24 * 60 * 60 * 1000,
          end: Date.now(),
        },
        userId: "",
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === "MISSING_USER_ID")).toBe(
        true,
      );
    });
    it("should warn about unknown data types", () => {
      const result = validateExportConfig({
        format: "json",
        dataTypes: ["sessions", "unknown_type"],
        dateRange: {
          start: Date.now() - 7 * 24 * 60 * 60 * 1000,
          end: Date.now(),
        },
        userId: "user-123",
      });
      expect(result.valid).toBe(true);
      expect(result.warnings[0].code).toBe("UNKNOWN_DATA_TYPE");
    });
    it("should warn about large exports", () => {
      const now = Date.now();
      const result = validateExportConfig({
        format: "json",
        dataTypes: ["sessions", "xp", "streaks", "boss", "items"],
        dateRange: { start: now - 365 * 24 * 60 * 60 * 1000, end: now },
        userId: "user-123",
      });
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === "LARGE_EXPORT")).toBe(true);
    });
  });
  describe("validateInsight", () => {
    it("should validate correct insight", () => {
      const result = validateInsight({
        title: "Test Insight",
        description: "This is a test description",
        severity: "info",
        metric: "sessions_completed",
      });
      expect(result.valid).toBe(true);
      expect((result.sanitized as { title: string })?.title).toBe(
        "Test Insight",
      );
    });
    it("should reject empty title", () => {
      const result = validateInsight({
        title: "",
        description: "Description",
        severity: "info",
        metric: "sessions_completed",
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("EMPTY_TITLE");
    });
    it("should reject title too long", () => {
      const result = validateInsight({
        title: "a".repeat(201),
        description: "Description",
        severity: "info",
        metric: "sessions_completed",
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("TITLE_TOO_LONG");
    });
    it("should reject invalid severity", () => {
      const result = validateInsight({
        title: "Test",
        description: "Description",
        severity: "invalid",
        metric: "sessions_completed",
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("INVALID_SEVERITY");
    });
    it("should trim whitespace", () => {
      const result = validateInsight({
        title: "  Test Insight  ",
        description: "  Description  ",
        severity: "info",
        metric: "sessions_completed",
      });
      expect(result.valid).toBe(true);
      expect((result.sanitized as { title: string })?.title).toBe(
        "Test Insight",
      );
    });
  });
  describe("validateFilter", () => {
    it("should validate correct filter", () => {
      const result = validateFilter({
        dimension: "day_of_week",
        operator: "eq",
        value: "1",
      });
      expect(result.valid).toBe(true);
    });
    it("should reject invalid dimension", () => {
      const result = validateFilter({
        dimension: "invalid_dimension",
        operator: "eq",
        value: "1",
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("INVALID_DIMENSION");
    });
    it("should reject invalid operator", () => {
      const result = validateFilter({
        dimension: "day_of_week",
        operator: "contains",
        value: "1",
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("INVALID_OPERATOR");
    });
    it("should validate in operator with array", () => {
      const result = validateFilter({
        dimension: "day_of_week",
        operator: "in",
        value: ["1", "2", "3"],
      });
      expect(result.valid).toBe(true);
    });
    it("should reject in operator with non-array", () => {
      const result = validateFilter({
        dimension: "day_of_week",
        operator: "in",
        value: "1",
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("INVALID_VALUE_TYPE");
    });
  });
  describe("batchValidate", () => {
    it("should validate all items", async () => {
      const items = [
        {
          title: "Valid 1",
          description: "Desc",
          severity: "info",
          metric: "xp",
        },
        {
          title: "Valid 2",
          description: "Desc",
          severity: "warning",
          metric: "sessions",
        },
      ];
      const result = await batchValidate(items, validateInsight);
      expect(result.summary.total).toBe(2);
      expect(result.summary.valid).toBe(2);
      expect(result.results).toHaveLength(2);
    });
    it("should track progress", async () => {
      const items = [
        { title: "Test", description: "Desc", severity: "info", metric: "xp" },
      ];
      const onProgress = jest.fn();
      await batchValidate(items, validateInsight, { onProgress });
      expect(onProgress).toHaveBeenCalledWith(1, 1);
    });
    it("should stop early on too many errors", async () => {
      const items = [
        { title: "", description: "Desc", severity: "info", metric: "xp" },
        { title: "", description: "Desc", severity: "info", metric: "xp" },
        { title: "", description: "Desc", severity: "info", metric: "xp" },
        { title: "Valid", description: "Desc", severity: "info", metric: "xp" },
      ];
      const result = await batchValidate(items, validateInsight, {
        continueOnError: false,
        maxErrors: 2,
      });
      expect(result.summary.errors).toBeGreaterThanOrEqual(2);
    });
    it("should handle validation exceptions", async () => {
      const items = ["item1", "item2"];
      const validator = () => {
        throw new Error("Validation failed");
      };
      const result = await batchValidate(items, validator);
      expect(result.summary.errors).toBe(2);
      expect(result.results[0].result.valid).toBe(false);
    });
  });
  describe("formatValidationErrors", () => {
    it("should format errors correctly", () => {
      const errors = [
        {
          field: "title",
          code: "EMPTY_TITLE",
          message: "Title is required",
          severity: "error" as const,
          recoveryHint: "Provide a title",
        },
        {
          field: "metric",
          code: "INVALID_METRIC",
          message: "Invalid metric",
          severity: "warning" as const,
        },
      ];
      const formatted = formatValidationErrors(errors);
      expect(formatted).toContain("[ERROR] title: Title is required");
      expect(formatted).toContain("Hint: Provide a title");
      expect(formatted).toContain("[WARNING] metric: Invalid metric");
    });
  });
  describe("AnalyticsValidationError", () => {
    it("should create error with all properties", () => {
      const error = new AnalyticsValidationError(
        "Test error",
        "title",
        "EMPTY_TITLE",
        "Provide a title",
        "",
      );
      expect(error.message).toBe("Test error");
      expect(error.field).toBe("title");
      expect(error.code).toBe("EMPTY_TITLE");
      expect(error.recoveryHint).toBe("Provide a title");
      expect(error.value).toBe("");
    });
    it("should work without optional properties", () => {
      const error = new AnalyticsValidationError("Test error", "field", "CODE");
      expect(error.recoveryHint).toBeUndefined();
      expect(error.value).toBeUndefined();
    });
  });
});
