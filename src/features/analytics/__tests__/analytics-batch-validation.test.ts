/**
 * Batch Validation & formatValidationErrors Tests
 */

import { batchValidate, formatValidationErrors } from "../validation/batch";

// ── Batch Validation ──────────────────────────────────────────────────────────

describe("batchValidate", () => {
  it("validates all items in batch", async () => {
    const items = [1, 2, 3];
    const validator = (item: number) => ({
      valid: item > 0,
      errors: item > 0 ? [] : [{ field: "x", code: "ERR", message: "err", severity: "error" as const }],
      warnings: [],
    });

    const result = await batchValidate(items, validator);
    expect(result.summary.total).toBe(3);
    expect(result.summary.valid).toBe(3);
    expect(result.summary.invalid).toBe(0);
  });

  it("reports invalid items", async () => {
    const items = [1, -1, 3];
    const validator = (item: number) => ({
      valid: item > 0,
      errors: item > 0 ? [] : [{ field: "x", code: "ERR", message: "err", severity: "error" as const }],
      warnings: [],
    });

    const result = await batchValidate(items, validator);
    expect(result.summary.invalid).toBe(1);
  });

  it("handles validator exceptions", async () => {
    const items = [1, 2];
    const validator = (item: number) => {
      if (item === 2) throw new Error("boom");
      return { valid: true, errors: [], warnings: [] };
    };

    const result = await batchValidate(items, validator);
    expect(result.summary.errors).toBeGreaterThanOrEqual(1);
  });

  it("calls onProgress callback", async () => {
    const items = [1, 2, 3];
    const onProgress = jest.fn();
    const validator = () => ({ valid: true, errors: [], warnings: [] });

    await batchValidate(items, validator, { onProgress });
    expect(onProgress).toHaveBeenCalledTimes(3);
  });

  it("stops early when continueOnError is false", async () => {
    const items = [1, -1, 3, -2];
    const validator = (item: number) => ({
      valid: item > 0,
      errors: item > 0 ? [] : [{ field: "x", code: "ERR", message: "err", severity: "error" as const }],
      warnings: [],
    });

    const result = await batchValidate(items, validator, {
      continueOnError: false,
      maxErrors: 1,
    });
    expect(result.results.length).toBeLessThan(4);
  });
});

// ── formatValidationErrors ────────────────────────────────────────────────────

describe("formatValidationErrors", () => {
  it("formats errors with recovery hints", () => {
    const errors = [
      {
        field: "startDate",
        code: "INVALID",
        message: "Invalid date",
        severity: "error" as const,
        recoveryHint: "Use Date.now()",
      },
    ];
    const formatted = formatValidationErrors(errors);
    expect(formatted).toContain("[ERROR]");
    expect(formatted).toContain("startDate");
    expect(formatted).toContain("Hint");
  });

  it("formats errors without recovery hints", () => {
    const errors = [
      {
        field: "title",
        code: "EMPTY",
        message: "Title is empty",
        severity: "error" as const,
      },
    ];
    const formatted = formatValidationErrors(errors);
    expect(formatted).toContain("Title is empty");
    expect(formatted).not.toContain("Hint");
  });

  it("formats multiple errors", () => {
    const errors = [
      {
        field: "a",
        code: "A",
        message: "err a",
        severity: "error" as const,
      },
      {
        field: "b",
        code: "B",
        message: "err b",
        severity: "warning" as const,
      },
    ];
    const formatted = formatValidationErrors(errors);
    expect(formatted.split("\n").length).toBe(2);
  });
});
