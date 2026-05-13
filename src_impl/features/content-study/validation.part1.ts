import { z } from "zod";
import { ContentSourceType, ValidationError, ContentStudyErrorCode, ContentStudyError, type ErrorRecoveryAction } from "./types";
import { CONTENT_STUDY_CONSTANTS } from "./types";


export const YouTubeUrlSchema = z.string().refine(
  (url) => {
    const patterns = [/^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]{11}/, /^https?:\/\/(www\.)?youtu\.be\/[\w-]{11}/, /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]{11}/, /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]{11}/];
    return patterns.some((pattern) => pattern.test(url));
  },
  { message: 'Invalid YouTube URL format' },
);

export const FileUploadSchema = z.object({
  uri: z.string().min(1, 'File URI is required'),
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE, `File size must be less than ${CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE / (1024 * 1024)}MB`),
  type: z.enum(['application/pdf', 'text/plain', 'text/markdown', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const),
});

export const PastedTextSchema = z.string().min(CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH, `Content must be at least ${CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH} characters`).max(CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH, `Content must be less than ${CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH} characters`);

export const TitleSchema = z.string().max(CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH, 'Title is too long').optional();

export function validateYouTubeUrl(url: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let videoId: string | undefined;

  if (!url.trim()) {
    errors.push({
      field: 'youtubeUrl',
      code: 'REQUIRED',
      message: 'YouTube URL is required',
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  if (url.length > CONTENT_STUDY_CONSTANTS.MAX_YOUTUBE_URL_LENGTH) {
    errors.push({
      field: 'youtubeUrl',
      code: 'TOO_LONG',
      message: `URL must be less than ${CONTENT_STUDY_CONSTANTS.MAX_YOUTUBE_URL_LENGTH} characters`,
      severity: 'error',
    });
  }

  const result = YouTubeUrlSchema.safeParse(url);
  if (!result.success) {
    errors.push({
      field: 'youtubeUrl',
      code: 'INVALID_FORMAT',
      message: 'Please enter a valid YouTube URL (youtube.com/watch?v=... or youtu.be/...)',
      severity: 'error',
    });
  } else {
    // Extract video ID for metadata
    const match = url.match(/(?:v=|\/|shorts\/|embed\/)([\w-]{11})/);
    videoId = match?.[1];

    // Check for playlist URLs (warning)
    if (url.includes('list=')) {
      warnings.push({
        field: 'youtubeUrl',
        code: 'PLAYLIST_URL',
        message: 'Playlists are not supported. Only the first video will be processed.',
        severity: 'warning',
      });
    }

    // Check for timestamp (warning)
    if (url.includes('t=')) {
      warnings.push({
        field: 'youtubeUrl',
        code: 'TIMESTAMP_URL',
        message: 'Timestamp will be ignored. Full video transcript will be extracted.',
        severity: 'warning',
      });
    }
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
      field: 'pastedText',
      code: 'REQUIRED',
      message: 'Content is required',
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  const trimmedLength = text.trim().length;

  if (trimmedLength < CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH) {
    errors.push({
      field: 'pastedText',
      code: 'TOO_SHORT',
      message: `Content must be at least ${CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH} characters (currently ${trimmedLength})`,
      severity: 'error',
    });
  }

  if (trimmedLength > CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH) {
    errors.push({
      field: 'pastedText',
      code: 'TOO_LONG',
      message: `Content must be less than ${CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH} characters (currently ${trimmedLength})`,
      severity: 'error',
    });
  }

  // Warnings for suboptimal content
  if (trimmedLength < 200) {
    warnings.push({
      field: 'pastedText',
      code: 'SHORT_CONTENT',
      message: 'Short content may produce less effective study materials',
      severity: 'warning',
    });
  }

  if (trimmedLength > 30000) {
    warnings.push({
      field: 'pastedText',
      code: 'LONG_CONTENT',
      message: 'Very long content may take longer to process',
      severity: 'warning',
    });
  }

  // Check for common copy-paste issues
  const repeatedNewlines = (text.match(/\n{5,}/g) || []).length;
  if (repeatedNewlines > 5) {
    warnings.push({
      field: 'pastedText',
      code: 'POOR_FORMATTING',
      message: 'Content has excessive line breaks. Consider cleaning up the text.',
      severity: 'warning',
    });
  }

  const wordCount = text.trim().split(/\s+/).length;
  const estimatedReadTime = Math.ceil(wordCount / 200); // 200 WPM average

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      characterCount: trimmedLength,
      wordCount,
      estimatedReadTime,
    },
  };
}