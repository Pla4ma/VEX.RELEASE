/**
 * Content-Study Tests: Validators File
 */
import { describe, it, expect } from "@jest/globals";

import { sanitizeFilename, validateFileUpload, validateTitle } from "../validators-file";
import { CONTENT_STUDY_CONSTANTS } from "../types";

// ============================================================================
// sanitizeFilename
// ============================================================================
describe("sanitizeFilename", () => {
  it("replaces special characters with underscores", () => {
    expect(sanitizeFilename("my file (1).pdf")).toBe("my_file_1_.pdf");
  });

  it("collapses consecutive underscores", () => {
    expect(sanitizeFilename("a   b")).toBe("a_b");
  });

  it("truncates to 100 characters", () => {
    const long = "a".repeat(150) + ".pdf";
    expect(sanitizeFilename(long).length).toBeLessThanOrEqual(100);
  });

  it("preserves allowed characters", () => {
    expect(sanitizeFilename("file-name_v2.pdf")).toBe("file-name_v2.pdf");
  });

  it("handles empty string", () => {
    expect(sanitizeFilename("")).toBe("");
  });
});

// ============================================================================
// validateFileUpload
// ============================================================================
describe("validateFileUpload", () => {
  const validFile = {
    uri: "file:///test.pdf",
    name: "test.pdf",
    size: 1024,
    type: "application/pdf",
  };

  it("returns error for null file", () => {
    const result = validateFileUpload(null);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]!.code).toBe("REQUIRED");
  });

  it("returns valid for a proper file", () => {
    const result = validateFileUpload(validFile);
    expect(result.isValid).toBe(true);
    expect(result.metadata?.fileType).toBe("application/pdf");
  });

  it("returns error for file exceeding max size", () => {
    const result = validateFileUpload({
      ...validFile,
      size: CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE + 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === "FILE_TOO_LARGE")).toBe(true);
  });

  it("returns error for unsupported type", () => {
    const result = validateFileUpload({ ...validFile, type: "image/jpeg" });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === "UNSUPPORTED_TYPE")).toBe(true);
  });

  it("returns error for empty name", () => {
    const result = validateFileUpload({ ...validFile, name: "" });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === "INVALID_NAME")).toBe(true);
  });

  it("warns about large files (5-10MB)", () => {
    const result = validateFileUpload({
      ...validFile,
      size: 6 * 1024 * 1024,
    });
    expect(result.warnings.some((w) => w.code === "LARGE_FILE")).toBe(true);
  });

  it("accepts text/plain", () => {
    const result = validateFileUpload({ ...validFile, type: "text/plain" });
    expect(result.isValid).toBe(true);
  });

  it("accepts text/markdown", () => {
    const result = validateFileUpload({ ...validFile, type: "text/markdown" });
    expect(result.isValid).toBe(true);
  });
});

// ============================================================================
// validateTitle
// ============================================================================
describe("validateTitle", () => {
  it("returns valid for undefined title", () => {
    const result = validateTitle(undefined);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns valid for empty title", () => {
    const result = validateTitle("");
    expect(result.isValid).toBe(true);
  });

  it("returns valid for a normal title", () => {
    const result = validateTitle("My Notes");
    expect(result.isValid).toBe(true);
  });

  it("returns error for too-long title", () => {
    const result = validateTitle("a".repeat(CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH + 1));
    expect(result.isValid).toBe(false);
    expect(result.errors[0]!.code).toBe("TOO_LONG");
  });

  it("warns about special characters", () => {
    const result = validateTitle("Notes <script>");
    expect(result.warnings.some((w) => w.code === "SPECIAL_CHARS")).toBe(true);
  });
});
