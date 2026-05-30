/**
 * Content-Study Tests: Validation Utils
 */
import { describe, it, expect } from "@jest/globals";

import {
  sanitizeTextForStorage,
  truncateText,
  extractYouTubeVideoId,
  isValidFileType,
  formatValidationErrors,
} from "../validation-utils";

// ============================================================================
// sanitizeTextForStorage
// ============================================================================
describe("sanitizeTextForStorage", () => {
  it("removes null bytes", () => {
    expect(sanitizeTextForStorage("hello\x00world")).toBe("helloworld");
  });

  it("removes C1 control characters (0x80-0x9F)", () => {
    const input = "test\x80\x9Fvalue";
    expect(sanitizeTextForStorage(input)).toBe("testvalue");
  });

  it("trims whitespace", () => {
    expect(sanitizeTextForStorage("  hello  ")).toBe("hello");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(sanitizeTextForStorage("   ")).toBe("");
  });

  it("handles empty string", () => {
    expect(sanitizeTextForStorage("")).toBe("");
  });
});

// ============================================================================
// truncateText
// ============================================================================
describe("truncateText", () => {
  it("returns text unchanged if shorter than max", () => {
    expect(truncateText("hello", 10)).toBe("hello");
  });

  it("returns text unchanged if equal to max", () => {
    expect(truncateText("hello", 5)).toBe("hello");
  });

  it("truncates and appends default suffix", () => {
    const result = truncateText("hello world", 8);
    expect(result).toBe("hello...");
    expect(result.length).toBe(8);
  });

  it("truncates with custom suffix", () => {
    const result = truncateText("hello world", 8, "~");
    expect(result).toBe("hello w~");
  });

  it("handles empty string", () => {
    expect(truncateText("", 5)).toBe("");
  });
});

// ============================================================================
// extractYouTubeVideoId
// ============================================================================
describe("extractYouTubeVideoId", () => {
  it("extracts from standard watch URL", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts from short youtu.be URL", () => {
    expect(extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts from shorts URL", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts from embed URL", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts bare video ID", () => {
    expect(extractYouTubeVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns null for empty string", () => {
    expect(extractYouTubeVideoId("")).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(extractYouTubeVideoId("not-a-url")).toBeNull();
  });
});

// ============================================================================
// isValidFileType
// ============================================================================
describe("isValidFileType", () => {
  it("accepts application/pdf", () => {
    expect(isValidFileType("application/pdf")).toBe(true);
  });

  it("accepts text/plain", () => {
    expect(isValidFileType("text/plain")).toBe(true);
  });

  it("accepts text/markdown", () => {
    expect(isValidFileType("text/markdown")).toBe(true);
  });

  it("rejects image/jpeg", () => {
    expect(isValidFileType("image/jpeg")).toBe(false);
  });

  it("rejects application/json", () => {
    expect(isValidFileType("application/json")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidFileType("")).toBe(false);
  });
});

// ============================================================================
// formatValidationErrors
// ============================================================================
describe("formatValidationErrors", () => {
  it("formats errors and warnings correctly", () => {
    const errors = [
      { field: "url", code: "INVALID", message: "Invalid URL", severity: "error" as const },
      { field: "title", code: "TOO_LONG", message: "Title too long", severity: "error" as const },
      { field: "file", code: "LARGE", message: "File is large", severity: "warning" as const },
    ];
    const result = formatValidationErrors(errors);
    expect(result).toContain("Invalid URL");
    expect(result).toContain("Title too long");
    expect(result).toContain("Warning: File is large");
  });

  it("handles empty array", () => {
    expect(formatValidationErrors([])).toBe("");
  });

  it("handles only warnings", () => {
    const errors = [
      { field: "x", code: "W", message: "Watch out", severity: "warning" as const },
    ];
    expect(formatValidationErrors(errors)).toBe("Warning: Watch out");
  });
});
