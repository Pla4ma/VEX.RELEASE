import { describe, it, expect, jest } from "@jest/globals";
import {
  validateFilter,
  batchValidate,
  formatValidationErrors,
  AnalyticsValidationError,
  validateInsight,
} from "../validation";

describe("Analytics Validation - Filters, Batch & Errors", () => {
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
