import { YouTubeUrlSchema } from "./validation-schemas";
import type { ValidationError } from "./types";
import { CONTENT_STUDY_CONSTANTS } from "./types";

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  metadata?: {
    characterCount?: number;
    wordCount?: number;
    estimatedReadTime?: number;
    youtubeVideoId?: string;
    fileType?: string;
  };
}

export function validateYouTubeUrl(url: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let videoId: string | undefined;
  if (!url.trim()) {
    errors.push({
      field: "youtubeUrl",
      code: "REQUIRED",
      message: "YouTube URL is required",
      severity: "error",
    });
    return { isValid: false, errors, warnings };
  }
  if (url.length > CONTENT_STUDY_CONSTANTS.MAX_YOUTUBE_URL_LENGTH) {
    errors.push({
      field: "youtubeUrl",
      code: "TOO_LONG",
      message: `URL must be less than ${CONTENT_STUDY_CONSTANTS.MAX_YOUTUBE_URL_LENGTH} characters`,
      severity: "error",
    });
  }
  const result = YouTubeUrlSchema.safeParse(url);
  if (!result.success) {
    errors.push({
      field: "youtubeUrl",
      code: "INVALID_FORMAT",
      message:
        "Please enter a valid YouTube URL (youtube.com/watch?v=... or youtu.be/...)",
      severity: "error",
    });
  } else {
    const match = url.match(/(?:v=|\/|shorts\/|embed\/)([\w-]{11})/);
    videoId = match?.[1];
    if (url.includes("list="))
      warnings.push({
        field: "youtubeUrl",
        code: "PLAYLIST_URL",
        message:
          "Playlists are not supported. Only the first video will be processed.",
        severity: "warning",
      });
    if (url.includes("t="))
      warnings.push({
        field: "youtubeUrl",
        code: "TIMESTAMP_URL",
        message:
          "Timestamp will be ignored. Full video transcript will be extracted.",
        severity: "warning",
      });
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: videoId ? { youtubeVideoId: videoId } : undefined,
  };
}

export function validatePastedText(text: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (!text.trim()) {
    errors.push({
      field: "pastedText",
      code: "REQUIRED",
      message: "Content is required",
      severity: "error",
    });
    return { isValid: false, errors, warnings };
  }
  const len = text.trim().length;
  if (len < CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH)
    errors.push({
      field: "pastedText",
      code: "TOO_SHORT",
      message: `Content must be at least ${CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH} characters (currently ${len})`,
      severity: "error",
    });
  if (len > CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH)
    errors.push({
      field: "pastedText",
      code: "TOO_LONG",
      message: `Content must be less than ${CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH} characters (currently ${len})`,
      severity: "error",
    });
  if (len < 200)
    warnings.push({
      field: "pastedText",
      code: "SHORT_CONTENT",
      message: "Short content may produce less effective study materials",
      severity: "warning",
    });
  if (len > 30000)
    warnings.push({
      field: "pastedText",
      code: "LONG_CONTENT",
      message: "Very long content may take longer to process",
      severity: "warning",
    });
  if ((text.match(/\n{5,}/g) || []).length > 5)
    warnings.push({
      field: "pastedText",
      code: "POOR_FORMATTING",
      message:
        "Content has excessive line breaks. Consider cleaning up the text.",
      severity: "warning",
    });
  const wordCount = text.trim().split(/\s+/).length;
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      characterCount: len,
      wordCount,
      estimatedReadTime: Math.ceil(wordCount / 200),
    },
  };
}
