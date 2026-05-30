/**
 * Content-Study Tests: Integration & Types
 */
import { describe, it, expect, jest } from "@jest/globals";

import {
  prepareContentStudySession,
  verifyContentStudyIntegration,
} from "../integration";
import { CONTENT_STUDY_CONSTANTS, ContentStudyErrorCode } from "../types";

// ─── Mocks (required by integration) ──────────────────────────────────────
jest.mock("../repository", () => ({
  invokeContentStudy: jest.fn(),
  uploadStudyFileRecord: jest.fn(),
  deleteStudyFileRecord: jest.fn(),
  fetchContentHistoryRecords: jest.fn(),
  fetchContentRecord: jest.fn(),
  fetchGenerationRecord: jest.fn(),
  updateContentTextRecord: jest.fn(),
  deleteContentRecord: jest.fn(),
}));

jest.mock("../../../utils/supabase-resilience", () => ({
  withResilience: (promise: Promise<unknown>) => promise,
}));

jest.mock("../../../config/supabase", () => ({
  getSupabaseClient: jest.fn(),
}));

jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }),
}));

// ============================================================================
// prepareContentStudySession
// ============================================================================
describe("prepareContentStudySession", () => {
  it("returns correct session data from study plan", () => {
    const plan = {
      tasks: [
        { id: "t1", content: "Task 1", priority: "HIGH" },
        { id: "t2", content: "Task 2", priority: "MEDIUM" },
      ],
      recommendedDurationMinutes: 30,
      recommendedDifficulty: "NORMAL",
      focusAreas: ["algebra", "geometry"],
    };
    const result = prepareContentStudySession("gen-1", plan);
    expect(result.duration).toBe(30);
    expect(result.difficulty).toBe("NORMAL");
    expect(result.focusAreas).toEqual(["algebra", "geometry"]);
    expect(result.category).toBe("study");
    expect(result.tags).toEqual(["content-study", "gen-1"]);
    expect(result.goal).toContain("2 items");
  });
});

// ============================================================================
// verifyContentStudyIntegration
// ============================================================================
describe("verifyContentStudyIntegration", () => {
  it("returns integration status", () => {
    const result = verifyContentStudyIntegration();
    expect(result).toHaveProperty("isComplete");
    expect(result).toHaveProperty("missing");
    expect(Array.isArray(result.missing)).toBe(true);
  });
});

// ============================================================================
// ContentStudyErrorCode enum
// ============================================================================
describe("ContentStudyErrorCode", () => {
  it("exports all expected error codes", () => {
    expect(ContentStudyErrorCode.RATE_LIMIT_EXCEEDED).toBeDefined();
    expect(ContentStudyErrorCode.CONTENT_NOT_FOUND).toBeDefined();
    expect(ContentStudyErrorCode.EXTRACTION_FAILED).toBeDefined();
    expect(ContentStudyErrorCode.GENERATION_FAILED).toBeDefined();
    expect(ContentStudyErrorCode.INVALID_INPUT).toBeDefined();
    expect(ContentStudyErrorCode.STORAGE_ERROR).toBeDefined();
    expect(ContentStudyErrorCode.NETWORK_ERROR).toBeDefined();
    expect(ContentStudyErrorCode.UNKNOWN_ERROR).toBeDefined();
    expect(ContentStudyErrorCode.FILE_TOO_LARGE).toBeDefined();
    expect(ContentStudyErrorCode.UNSUPPORTED_FILE_TYPE).toBeDefined();
    expect(ContentStudyErrorCode.PDF_PARSE_ERROR).toBeDefined();
    expect(ContentStudyErrorCode.YOUTUBE_TRANSCRIPT_ERROR).toBeDefined();
    expect(ContentStudyErrorCode.INVALID_YOUTUBE_URL).toBeDefined();
    expect(ContentStudyErrorCode.CONTENT_EXPIRED).toBeDefined();
    expect(ContentStudyErrorCode.SESSION_INTERRUPTED).toBeDefined();
    expect(ContentStudyErrorCode.OFFLINE_MODE).toBeDefined();
    expect(ContentStudyErrorCode.AI_TIMEOUT).toBeDefined();
    expect(ContentStudyErrorCode.AI_RATE_LIMIT).toBeDefined();
    expect(ContentStudyErrorCode.VALIDATION_ERROR).toBeDefined();
  });
});

// ============================================================================
// CONTENT_STUDY_CONSTANTS
// ============================================================================
describe("CONTENT_STUDY_CONSTANTS", () => {
  it("has correct paste length bounds", () => {
    expect(CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH).toBe(100);
    expect(CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH).toBe(50000);
  });

  it("has correct PDF size limit", () => {
    expect(CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE).toBe(10 * 1024 * 1024);
  });

  it("has daily generation limit", () => {
    expect(CONTENT_STUDY_CONSTANTS.DAILY_GENERATION_LIMIT).toBe(10);
  });

  it("has max retry attempts", () => {
    expect(CONTENT_STUDY_CONSTANTS.MAX_RETRY_ATTEMPTS).toBe(3);
  });

  it("has max title length", () => {
    expect(CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH).toBe(200);
  });

  it("has max YouTube URL length", () => {
    expect(CONTENT_STUDY_CONSTANTS.MAX_YOUTUBE_URL_LENGTH).toBe(500);
  });

  it("has poll configuration", () => {
    expect(CONTENT_STUDY_CONSTANTS.MAX_STATUS_POLL_ATTEMPTS).toBe(60);
    expect(CONTENT_STUDY_CONSTANTS.STATUS_POLL_INTERVAL_MS).toBe(5000);
  });
});
