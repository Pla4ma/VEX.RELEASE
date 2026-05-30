/**
 * Content-Study Tests: Validation (orchestrator)
 */
import { describe, it, expect } from "@jest/globals";

import {
  validateContentSubmission,
  buildError,
  isRecoverableError,
  shouldRetry,
  getRetryDelay,
} from "../validation";
import { CONTENT_STUDY_CONSTANTS, ContentStudyErrorCode } from "../types";

// ============================================================================
// validateContentSubmission
// ============================================================================
describe("validateContentSubmission", () => {
  it("validates PASTE type with valid text", () => {
    const text = "a".repeat(200);
    const result = validateContentSubmission("PASTE", { text });
    expect(result.isValid).toBe(true);
  });

  it("validates PASTE type with empty text", () => {
    const result = validateContentSubmission("PASTE", { text: "" });
    expect(result.isValid).toBe(false);
  });

  it("validates PDF type with valid file", () => {
    const file = { uri: "f.pdf", name: "f.pdf", size: 1024, type: "application/pdf" };
    const result = validateContentSubmission("PDF", { file });
    expect(result.isValid).toBe(true);
  });

  it("validates PDF type with null file", () => {
    const result = validateContentSubmission("PDF", { file: null });
    expect(result.isValid).toBe(false);
  });

  it("validates YOUTUBE type with valid URL", () => {
    const result = validateContentSubmission("YOUTUBE", { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
    expect(result.isValid).toBe(true);
  });

  it("validates YOUTUBE type with invalid URL", () => {
    const result = validateContentSubmission("YOUTUBE", { url: "not-a-url" });
    expect(result.isValid).toBe(false);
  });

  it("validates URL type with valid URL", () => {
    const result = validateContentSubmission("URL", { url: "https://example.com" });
    expect(result.isValid).toBe(true);
  });

  it("validates URL type with empty URL", () => {
    const result = validateContentSubmission("URL", { url: "" });
    expect(result.isValid).toBe(false);
  });

  it("validates URL type with non-http URL", () => {
    const result = validateContentSubmission("URL", { url: "ftp://example.com" });
    expect(result.isValid).toBe(false);
  });

  it("validates title across all types", () => {
    const text = "a".repeat(200);
    const result = validateContentSubmission("PASTE", { text, title: "a".repeat(CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH + 1) });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === "title")).toBe(true);
  });
});

// ============================================================================
// buildError
// ============================================================================
describe("buildError", () => {
  it("builds error with all fields", () => {
    const error = buildError(ContentStudyErrorCode.INVALID_INPUT, "Bad input", { field: "text" }, true);
    expect(error.code).toBe(ContentStudyErrorCode.INVALID_INPUT);
    expect(error.message).toBe("Bad input");
    expect(error.details).toEqual({ field: "text" });
    expect(error.recoverable).toBe(true);
    expect(error.suggestedAction).toBe("edit_content");
    expect(error.timestamp).toBeGreaterThan(0);
  });

  it("maps all error codes to correct suggested actions", () => {
    expect(buildError(ContentStudyErrorCode.RATE_LIMIT_EXCEEDED, "msg").suggestedAction).toBe("try_again_later");
    expect(buildError(ContentStudyErrorCode.CONTENT_NOT_FOUND, "msg").suggestedAction).toBe("go_back");
    expect(buildError(ContentStudyErrorCode.EXTRACTION_FAILED, "msg").suggestedAction).toBe("retry");
    expect(buildError(ContentStudyErrorCode.GENERATION_FAILED, "msg").suggestedAction).toBe("retry");
    expect(buildError(ContentStudyErrorCode.UNKNOWN_ERROR, "msg").suggestedAction).toBe("contact_support");
    expect(buildError(ContentStudyErrorCode.FILE_TOO_LARGE, "msg").suggestedAction).toBe("reupload");
    expect(buildError(ContentStudyErrorCode.AI_TIMEOUT, "msg").suggestedAction).toBe("retry");
    expect(buildError(ContentStudyErrorCode.AI_RATE_LIMIT, "msg").suggestedAction).toBe("try_again_later");
    expect(buildError(ContentStudyErrorCode.VALIDATION_ERROR, "msg").suggestedAction).toBe("edit_content");
    expect(buildError(ContentStudyErrorCode.OFFLINE_MODE, "msg").suggestedAction).toBe("try_again_later");
  });

  it("defaults recoverable to false", () => {
    expect(buildError(ContentStudyErrorCode.INVALID_INPUT, "msg").recoverable).toBe(false);
  });
});

// ============================================================================
// isRecoverableError
// ============================================================================
describe("isRecoverableError", () => {
  it("returns true for recoverable errors", () => {
    expect(isRecoverableError(ContentStudyErrorCode.NETWORK_ERROR)).toBe(true);
    expect(isRecoverableError(ContentStudyErrorCode.EXTRACTION_FAILED)).toBe(true);
    expect(isRecoverableError(ContentStudyErrorCode.GENERATION_FAILED)).toBe(true);
    expect(isRecoverableError(ContentStudyErrorCode.STORAGE_ERROR)).toBe(true);
    expect(isRecoverableError(ContentStudyErrorCode.AI_TIMEOUT)).toBe(true);
    expect(isRecoverableError(ContentStudyErrorCode.YOUTUBE_TRANSCRIPT_ERROR)).toBe(true);
  });

  it("returns false for non-recoverable errors", () => {
    expect(isRecoverableError(ContentStudyErrorCode.INVALID_INPUT)).toBe(false);
    expect(isRecoverableError(ContentStudyErrorCode.CONTENT_NOT_FOUND)).toBe(false);
    expect(isRecoverableError(ContentStudyErrorCode.RATE_LIMIT_EXCEEDED)).toBe(false);
    expect(isRecoverableError(ContentStudyErrorCode.UNKNOWN_ERROR)).toBe(false);
    expect(isRecoverableError(ContentStudyErrorCode.FILE_TOO_LARGE)).toBe(false);
  });
});

// ============================================================================
// shouldRetry
// ============================================================================
describe("shouldRetry", () => {
  it("returns true for recoverable error under max attempts", () => {
    expect(shouldRetry(ContentStudyErrorCode.NETWORK_ERROR, 0)).toBe(true);
    expect(shouldRetry(ContentStudyErrorCode.AI_TIMEOUT, 1)).toBe(true);
  });

  it("returns false at max attempts", () => {
    expect(shouldRetry(ContentStudyErrorCode.NETWORK_ERROR, CONTENT_STUDY_CONSTANTS.MAX_RETRY_ATTEMPTS)).toBe(false);
  });

  it("returns false for non-recoverable error", () => {
    expect(shouldRetry(ContentStudyErrorCode.INVALID_INPUT, 0)).toBe(false);
  });
});

// ============================================================================
// getRetryDelay
// ============================================================================
describe("getRetryDelay", () => {
  it("returns base delay for attempt 0", () => {
    expect(getRetryDelay(0)).toBe(CONTENT_STUDY_CONSTANTS.RETRY_DELAY_MS);
  });

  it("exponentially increases delay", () => {
    expect(getRetryDelay(1)).toBe(CONTENT_STUDY_CONSTANTS.RETRY_DELAY_MS * 2);
    expect(getRetryDelay(2)).toBe(CONTENT_STUDY_CONSTANTS.RETRY_DELAY_MS * 4);
  });
});
