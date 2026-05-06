/**
 * Validation Tests
 * Comprehensive test coverage for content study validation
 */

import { YouTubeUrlSchema, FileUploadSchema, PastedTextSchema, TitleSchema, validateYouTubeUrl, validatePastedText, validateFileUpload, validateTitle, validateContentSubmission, extractYouTubeVideoId, isValidFileType, formatValidationErrors } from "../validation";
import { CONTENT_STUDY_CONSTANTS } from "../types";

describe("Validation Schemas", () => {
  describe("YouTubeUrlSchema", () => {
    it("should validate standard youtube.com/watch URLs", () => {
      const validUrls = ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://youtube.com/watch?v=dQw4w9WgXcQ", "http://www.youtube.com/watch?v=dQw4w9WgXcQ"];

      validUrls.forEach((url) => {
        expect(YouTubeUrlSchema.safeParse(url).success).toBe(true);
      });
    });

    it("should validate youtu.be short URLs", () => {
      const validUrls = ["https://youtu.be/dQw4w9WgXcQ", "https://www.youtu.be/dQw4w9WgXcQ"];

      validUrls.forEach((url) => {
        expect(YouTubeUrlSchema.safeParse(url).success).toBe(true);
      });
    });

    it("should validate YouTube Shorts URLs", () => {
      const validUrls = ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "https://youtube.com/shorts/dQw4w9WgXcQ"];

      validUrls.forEach((url) => {
        expect(YouTubeUrlSchema.safeParse(url).success).toBe(true);
      });
    });

    it("should validate embed URLs", () => {
      const validUrls = ["https://www.youtube.com/embed/dQw4w9WgXcQ"];

      validUrls.forEach((url) => {
        expect(YouTubeUrlSchema.safeParse(url).success).toBe(true);
      });
    });

    it("should reject invalid YouTube URLs", () => {
      const invalidUrls = [
        "https://www.youtube.com/watch", // no video ID
        "https://www.youtube.com/", // no path
        "https://example.com/watch?v=dQw4w9WgXcQ", // wrong domain
        "not-a-url",
        "",
      ];

      invalidUrls.forEach((url) => {
        expect(YouTubeUrlSchema.safeParse(url).success).toBe(false);
      });
    });
  });

  describe("FileUploadSchema", () => {
    it("should validate PDF files", () => {
      const validFile = {
        uri: "file:///path/to/document.pdf",
        name: "document.pdf",
        size: 1024 * 1024, // 1MB
        type: "application/pdf",
      };

      expect(FileUploadSchema.safeParse(validFile).success).toBe(true);
    });

    it("should validate text files", () => {
      const validFiles = [
        { uri: "file:///path/to/file.txt", name: "file.txt", size: 1000, type: "text/plain" },
        { uri: "file:///path/to/file.md", name: "file.md", size: 1000, type: "text/markdown" },
      ];

      validFiles.forEach((file) => {
        expect(FileUploadSchema.safeParse(file).success).toBe(true);
      });
    });

    it("should reject files that are too large", () => {
      const oversizedFile = {
        uri: "file:///path/to/large.pdf",
        name: "large.pdf",
        size: CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE + 1,
        type: "application/pdf",
      };

      expect(FileUploadSchema.safeParse(oversizedFile).success).toBe(false);
    });

    it("should reject unsupported file types", () => {
      const invalidFile = {
        uri: "file:///path/to/image.jpg",
        name: "image.jpg",
        size: 1000,
        type: "image/jpeg",
      };

      expect(FileUploadSchema.safeParse(invalidFile).success).toBe(false);
    });

    it("should reject files with missing required fields", () => {
      const incompleteFiles = [
        { uri: "", name: "file.pdf", size: 1000, type: "application/pdf" },
        { uri: "file:///path/to/file.pdf", name: "", size: 1000, type: "application/pdf" },
      ];

      incompleteFiles.forEach((file) => {
        expect(FileUploadSchema.safeParse(file).success).toBe(false);
      });
    });
  });

  describe("PastedTextSchema", () => {
    it("should validate text within length limits", () => {
      const validText = "a".repeat(CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH + 100);
      expect(PastedTextSchema.safeParse(validText).success).toBe(true);
    });

    it("should reject text that is too short", () => {
      const shortText = "a".repeat(CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH - 1);
      expect(PastedTextSchema.safeParse(shortText).success).toBe(false);
    });

    it("should reject text that exceeds max length", () => {
      const longText = "a".repeat(CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH + 1);
      expect(PastedTextSchema.safeParse(longText).success).toBe(false);
    });

    it("should reject empty text", () => {
      expect(PastedTextSchema.safeParse("").success).toBe(false);
      expect(PastedTextSchema.safeParse("   ").success).toBe(false);
    });
  });

  describe("TitleSchema", () => {
    it("should validate titles within length limit", () => {
      const validTitle = "a".repeat(CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH);
      expect(TitleSchema.safeParse(validTitle).success).toBe(true);
    });

    it("should allow empty/undefined title", () => {
      expect(TitleSchema.safeParse("").success).toBe(true);
      expect(TitleSchema.safeParse(undefined).success).toBe(true);
    });

    it("should reject titles that are too long", () => {
      const longTitle = "a".repeat(CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH + 1);
      expect(TitleSchema.safeParse(longTitle).success).toBe(false);
    });
  });
});

describe("Validation Functions", () => {
  describe("validateYouTubeUrl", () => {
    it("should return valid result for correct URL", () => {
      const result = validateYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata?.youtubeVideoId).toBe("dQw4w9WgXcQ");
    });

    it("should return warning for playlist URLs", () => {
      const result = validateYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLsomeplaylist");
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].code).toBe("PLAYLIST_URL");
    });

    it("should return warning for timestamp URLs", () => {
      const result = validateYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120");
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].code).toBe("TIMESTAMP_URL");
    });

    it("should return error for empty URL", () => {
      const result = validateYouTubeUrl("");
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe("REQUIRED");
    });

    it("should return error for URL that is too long", () => {
      const longUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&" + "x=y&".repeat(500);
      const result = validateYouTubeUrl(longUrl);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe("TOO_LONG");
    });
  });

  describe("validatePastedText", () => {
    it("should return valid result for text within limits", () => {
      const text = "a".repeat(500);
      const result = validatePastedText(text);
      expect(result.isValid).toBe(true);
      expect(result.metadata?.characterCount).toBe(500);
      expect(result.metadata?.wordCount).toBe(1);
    });

    it("should return warning for short content", () => {
      const text = "a".repeat(150);
      const result = validatePastedText(text);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.code === "SHORT_CONTENT")).toBe(true);
    });

    it("should return warning for long content", () => {
      const text = "a".repeat(35000);
      const result = validatePastedText(text);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.code === "LONG_CONTENT")).toBe(true);
    });

    it("should return warning for poor formatting", () => {
      const text = "Line1\n\n\n\n\n\nLine2\n\n\n\n\n\nLine3";
      const result = validatePastedText(text);
      expect(result.warnings.some((w) => w.code === "POOR_FORMATTING")).toBe(true);
    });

    it("should return error for empty text", () => {
      const result = validatePastedText("");
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe("REQUIRED");
    });

    it("should calculate estimated read time", () => {
      const text = "word ".repeat(400); // ~400 words = 2 minutes at 200 WPM
      const result = validatePastedText(text);
      expect(result.metadata?.estimatedReadTime).toBe(2);
    });
  });

  describe("validateFileUpload", () => {
    it("should return valid result for valid file", () => {
      const file = {
        uri: "file:///path/to/file.pdf",
        name: "file.pdf",
        size: 1024 * 1024,
        type: "application/pdf",
      };
      const result = validateFileUpload(file);
      expect(result.isValid).toBe(true);
    });

    it("should return error for oversized file", () => {
      const file = {
        uri: "file:///path/to/large.pdf",
        name: "large.pdf",
        size: CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE + 1,
        type: "application/pdf",
      };
      const result = validateFileUpload(file);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe("FILE_TOO_LARGE");
    });

    it("should return error for unsupported type", () => {
      const file = {
        uri: "file:///path/to/image.jpg",
        name: "image.jpg",
        size: 1000,
        type: "image/jpeg",
      };
      const result = validateFileUpload(file);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe("UNSUPPORTED_TYPE");
    });

    it("should return warning for large but acceptable files", () => {
      const file = {
        uri: "file:///path/to/large.pdf",
        name: "large.pdf",
        size: 6 * 1024 * 1024, // 6MB
        type: "application/pdf",
      };
      const result = validateFileUpload(file);
      expect(result.isValid).toBe(true);
      expect(result.warnings[0].code).toBe("LARGE_FILE");
    });

    it("should return error for null file", () => {
      const result = validateFileUpload(null);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe("REQUIRED");
    });
  });

  describe("validateTitle", () => {
    it("should return valid for acceptable titles", () => {
      const result = validateTitle("My Study Title");
      expect(result.isValid).toBe(true);
    });

    it("should return valid for empty/undefined title", () => {
      expect(validateTitle("").isValid).toBe(true);
      expect(validateTitle(undefined).isValid).toBe(true);
    });

    it("should return warning for title with special characters", () => {
      const result = validateTitle("Title with [brackets] and {braces}");
      expect(result.isValid).toBe(true);
      expect(result.warnings[0].code).toBe("SPECIAL_CHARS");
    });

    it("should return error for title that is too long", () => {
      const longTitle = "a".repeat(CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH + 1);
      const result = validateTitle(longTitle);
      expect(result.isValid).toBe(false);
    });
  });

  describe("validateContentSubmission", () => {
    it("should validate PASTE submission", () => {
      const result = validateContentSubmission("PASTE", {
        text: "a".repeat(500),
        title: "My Notes",
      });
      expect(result.isValid).toBe(true);
      expect(result.metadata?.characterCount).toBe(500);
    });

    it("should validate PDF submission", () => {
      const result = validateContentSubmission("PDF", {
        file: {
          uri: "file:///path/to/file.pdf",
          name: "file.pdf",
          size: 1024 * 1024,
          type: "application/pdf",
        },
      });
      expect(result.isValid).toBe(true);
    });

    it("should validate YOUTUBE submission", () => {
      const result = validateContentSubmission("YOUTUBE", {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      });
      expect(result.isValid).toBe(true);
      expect(result.metadata?.youtubeVideoId).toBe("dQw4w9WgXcQ");
    });

    it("should accumulate errors from multiple validations", () => {
      const result = validateContentSubmission("PASTE", {
        text: "",
        title: "a".repeat(CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH + 1),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});

describe("Utility Functions", () => {
  describe("extractYouTubeVideoId", () => {
    it("should extract ID from standard URLs", () => {
      expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    });

    it("should extract ID from short URLs", () => {
      expect(extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    });

    it("should extract ID from shorts URLs", () => {
      expect(extractYouTubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    });

    it("should return null for invalid URLs", () => {
      expect(extractYouTubeVideoId("invalid-url")).toBeNull();
      expect(extractYouTubeVideoId("")).toBeNull();
    });
  });

  describe("isValidFileType", () => {
    it("should return true for valid MIME types", () => {
      expect(isValidFileType("application/pdf")).toBe(true);
      expect(isValidFileType("text/plain")).toBe(true);
      expect(isValidFileType("text/markdown")).toBe(true);
    });

    it("should return false for invalid MIME types", () => {
      expect(isValidFileType("image/jpeg")).toBe(false);
      expect(isValidFileType("application/json")).toBe(false);
    });
  });

  describe("formatValidationErrors", () => {
    it("should format errors with newlines", () => {
      const errors = [
        { field: "url", code: "INVALID", message: "Invalid URL", severity: "error" as const },
        { field: "title", code: "TOO_LONG", message: "Title too long", severity: "error" as const },
        { field: "file", code: "LARGE", message: "File is large", severity: "warning" as const },
      ];

      const formatted = formatValidationErrors(errors);
      expect(formatted).toContain("Invalid URL");
      expect(formatted).toContain("Title too long");
      expect(formatted).toContain("Warning: File is large");
    });

    it("should handle empty errors array", () => {
      expect(formatValidationErrors([])).toBe("");
    });
  });
});
