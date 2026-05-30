/**
 * Session Feature — Validation Helpers Tests
 */

import {
  formatValidationErrors,
  hasErrors,
  hasWarnings,
  getFirstError,
  SessionValidation,
} from "../utils/validation";

import { FieldValidators } from "../utils/field-validators";

describe("formatValidationErrors / hasErrors / hasWarnings / getFirstError", () => {
  test("formatValidationErrors joins fields and messages", () => {
    const formatted = formatValidationErrors([
      { field: "duration", message: "Too short", code: "DURATION" },
      { field: "name", message: "Required", code: "NAME" },
    ]);
    expect(formatted).toBe("duration: Too short; name: Required");
  });

  test("hasErrors returns true when result has errors", () => {
    expect(
      hasErrors({ success: false, errors: [{ field: "x", message: "m", code: "c" }], warnings: [] }),
    ).toBe(true);
    expect(hasErrors({ success: true, errors: [], warnings: [] })).toBe(false);
  });

  test("hasWarnings returns true when warnings exist", () => {
    expect(
      hasWarnings({ success: true, errors: [], warnings: [{ field: "x", message: "m", code: "c" }] }),
    ).toBe(true);
  });

  test("getFirstError returns first error or null", () => {
    const err = { field: "a", message: "b", code: "c" };
    expect(getFirstError({ success: false, errors: [err], warnings: [] })).toBe(err);
    expect(getFirstError({ success: true, errors: [], warnings: [] })).toBeNull();
  });
});

describe("FieldValidators", () => {
  test("duration returns null for valid value", () => {
    expect(FieldValidators.duration(1500)).toBeNull();
  });

  test("duration returns error for too-short value", () => {
    const err = FieldValidators.duration(10);
    expect(err).not.toBeNull();
    expect(err?.code).toBe("DURATION_TOO_SHORT");
  });

  test("duration returns error for too-long value", () => {
    const err = FieldValidators.duration(100000);
    expect(err?.code).toBe("DURATION_TOO_LONG");
  });

  test("name returns null for valid string", () => {
    expect(FieldValidators.name("Focus time")).toBeNull();
  });

  test("name returns error for empty string", () => {
    expect(FieldValidators.name("")?.code).toBe("NAME_REQUIRED");
  });

  test("name returns error for too-long string", () => {
    expect(FieldValidators.name("a".repeat(101))?.code).toBe("NAME_TOO_LONG");
  });

  test("intervals validates count and duration ratio", () => {
    expect(FieldValidators.intervals(3, 1500)).toBeNull();
    expect(FieldValidators.intervals(0, 1500)?.code).toBe("INTERVALS_TOO_FEW");
    expect(FieldValidators.intervals(25, 1500)?.code).toBe("INTERVALS_TOO_MANY");
    expect(FieldValidators.intervals(10, 300)?.code).toBe("INTERVALS_TOO_SHORT");
  });
});

describe("SessionValidation namespace", () => {
  test("exposes all validation functions", () => {
    expect(typeof SessionValidation.validateConfig).toBe("function");
    expect(typeof SessionValidation.validateStart).toBe("function");
    expect(typeof SessionValidation.validatePause).toBe("function");
    expect(typeof SessionValidation.validateCompletion).toBe("function");
    expect(typeof SessionValidation.formatErrors).toBe("function");
    expect(typeof SessionValidation.hasErrors).toBe("function");
    expect(typeof SessionValidation.hasWarnings).toBe("function");
    expect(typeof SessionValidation.getFirstError).toBe("function");
  });
});
