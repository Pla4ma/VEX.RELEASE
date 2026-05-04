/**
 * Content Study Validation Utilities
 * Comprehensive validation for all content study inputs
 */

import { z } from 'zod';
import {
  ContentSourceType,
  ValidationError,
  ContentStudyErrorCode,
  ContentStudyError,
  type ErrorRecoveryAction,
} from './types';
import { CONTENT_STUDY_CONSTANTS } from './types';

// ============================================================================
// Validation Schemas
// ============================================================================

export const YouTubeUrlSchema = z.string().refine(
  (url) => {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]{11}/,
      /^https?:\/\/(www\.)?youtu\.be\/[\w-]{11}/,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]{11}/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]{11}/,
    ];
    return patterns.some((pattern) => pattern.test(url));
  },
  { message: 'Invalid YouTube URL format' }
);

export const FileUploadSchema = z.object({
  uri: z.string().min(1, 'File URI is required'),
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(
    CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE,
    `File size must be less than ${CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE / (1024 * 1024)}MB`
  ),
  type: z.enum([
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as const),
});

export const PastedTextSchema = z.string()
  .min(
    CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH,
    `Content must be at least ${CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH} characters`
  )
  .max(
    CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH,
    `Content must be less than ${CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH} characters`
  );

export const TitleSchema = z.string()
  .max(CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH, 'Title is too long')
  .optional();

// ============================================================================
// Input Validators
// ============================================================================

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

export function validateFileUpload(
  file: { uri: string; name: string; size: number; type: string } | null
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!file) {
    errors.push({
      field: 'file',
      code: 'REQUIRED',
      message: 'Please select a file',
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  // Size validation
  if (file.size > CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE) {
    const maxSizeMB = CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE / (1024 * 1024);
    const actualSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    errors.push({
      field: 'file',
      code: 'FILE_TOO_LARGE',
      message: `File size (${actualSizeMB}MB) exceeds maximum allowed (${maxSizeMB}MB)`,
      severity: 'error',
    });
  }

  // Type validation
  const supportedTypes: readonly string[] = [
    ...CONTENT_STUDY_CONSTANTS.SUPPORTED_PDF_TYPES,
    ...CONTENT_STUDY_CONSTANTS.SUPPORTED_TEXT_TYPES,
  ];

  if (!supportedTypes.includes(file.type)) {
    errors.push({
      field: 'file',
      code: 'UNSUPPORTED_TYPE',
      message: `File type "${file.type}" is not supported. Please use PDF, TXT, or MD files.`,
      severity: 'error',
    });
  }

  // Filename validation
  if (!file.name || file.name.trim().length === 0) {
    errors.push({
      field: 'file',
      code: 'INVALID_NAME',
      message: 'File name is invalid',
      severity: 'error',
    });
  }

  // Warning for large but acceptable files
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > 5 && sizeMB <= 10) {
    warnings.push({
      field: 'file',
      code: 'LARGE_FILE',
      message: 'Large files may take longer to upload and process',
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      fileType: file.type,
    },
  };
}

export function validateTitle(title: string | undefined): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!title || title.trim().length === 0) {
    return { isValid: true, errors, warnings }; // Title is optional
  }

  if (title.length > CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH) {
    errors.push({
      field: 'title',
      code: 'TOO_LONG',
      message: `Title must be less than ${CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH} characters`,
      severity: 'error',
    });
  }

  // Check for problematic characters
  if (/[<>{}[\]]/.test(title)) {
    warnings.push({
      field: 'title',
      code: 'SPECIAL_CHARS',
      message: 'Title contains special characters that may cause display issues',
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Composite Validators
// ============================================================================

export function validateContentSubmission(
  type: ContentSourceType,
  data: {
    text?: string;
    file?: { uri: string; name: string; size: number; type: string } | null;
    url?: string;
    title?: string;
  }
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let metadata: ValidationResult['metadata'] = {};

  // Validate based on type
  switch (type) {
    case 'PASTE': {
      const textResult = validatePastedText(data.text || '');
      errors.push(...textResult.errors);
      warnings.push(...textResult.warnings);
      metadata = { ...metadata, ...textResult.metadata };
      break;
    }
    case 'PDF': {
      const fileResult = validateFileUpload(data.file || null);
      errors.push(...fileResult.errors);
      warnings.push(...fileResult.warnings);
      metadata = { ...metadata, ...fileResult.metadata };
      break;
    }
    case 'YOUTUBE': {
      const urlResult = validateYouTubeUrl(data.url || '');
      errors.push(...urlResult.errors);
      warnings.push(...urlResult.warnings);
      metadata = { ...metadata, ...urlResult.metadata };
      break;
    }
    case 'URL': {
      // Generic URL validation (for future expansion)
      if (!data.url || !data.url.trim()) {
        errors.push({
          field: 'url',
          code: 'REQUIRED',
          message: 'URL is required',
          severity: 'error',
        });
      } else if (!/^https?:\/\/.+/.test(data.url)) {
        errors.push({
          field: 'url',
          code: 'INVALID_FORMAT',
          message: 'Please enter a valid URL starting with http:// or https://',
          severity: 'error',
        });
      }
      break;
    }
  }

  // Validate title if provided
  const titleResult = validateTitle(data.title);
  errors.push(...titleResult.errors);
  warnings.push(...titleResult.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata,
  };
}

// ============================================================================
// Error Builders
// ============================================================================

export function buildError(
  code: ContentStudyErrorCode,
  message: string,
  details?: Record<string, unknown>,
  recoverable: boolean = false
): ContentStudyError {
  const suggestedActions: Record<ContentStudyErrorCode, ErrorRecoveryAction> = {
    [ContentStudyErrorCode.RATE_LIMIT_EXCEEDED]: 'try_again_later',
    [ContentStudyErrorCode.CONTENT_NOT_FOUND]: 'go_back',
    [ContentStudyErrorCode.EXTRACTION_FAILED]: 'retry',
    [ContentStudyErrorCode.GENERATION_FAILED]: 'retry',
    [ContentStudyErrorCode.INVALID_INPUT]: 'edit_content',
    [ContentStudyErrorCode.STORAGE_ERROR]: 'retry',
    [ContentStudyErrorCode.NETWORK_ERROR]: 'retry',
    [ContentStudyErrorCode.UNKNOWN_ERROR]: 'contact_support',
    [ContentStudyErrorCode.FILE_TOO_LARGE]: 'reupload',
    [ContentStudyErrorCode.UNSUPPORTED_FILE_TYPE]: 'reupload',
    [ContentStudyErrorCode.PDF_PARSE_ERROR]: 'reupload',
    [ContentStudyErrorCode.YOUTUBE_TRANSCRIPT_ERROR]: 'retry',
    [ContentStudyErrorCode.INVALID_YOUTUBE_URL]: 'edit_content',
    [ContentStudyErrorCode.CONTENT_EXPIRED]: 'go_back',
    [ContentStudyErrorCode.SESSION_INTERRUPTED]: 'retry',
    [ContentStudyErrorCode.OFFLINE_MODE]: 'try_again_later',
    [ContentStudyErrorCode.AI_TIMEOUT]: 'retry',
    [ContentStudyErrorCode.AI_RATE_LIMIT]: 'try_again_later',
    [ContentStudyErrorCode.VALIDATION_ERROR]: 'edit_content',
  };

  return {
    code,
    message,
    details,
    timestamp: Date.now(),
    recoverable,
    suggestedAction: suggestedActions[code],
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function isRecoverableError(error: ContentStudyErrorCode): boolean {
  const recoverableErrors: ContentStudyErrorCode[] = [
    ContentStudyErrorCode.NETWORK_ERROR,
    ContentStudyErrorCode.EXTRACTION_FAILED,
    ContentStudyErrorCode.GENERATION_FAILED,
    ContentStudyErrorCode.STORAGE_ERROR,
    ContentStudyErrorCode.AI_TIMEOUT,
    ContentStudyErrorCode.YOUTUBE_TRANSCRIPT_ERROR,
  ];
  return recoverableErrors.includes(error);
}

export function shouldRetry(error: ContentStudyErrorCode, attemptCount: number): boolean {
  if (!isRecoverableError(error)) {return false;}
  return attemptCount < CONTENT_STUDY_CONSTANTS.MAX_RETRY_ATTEMPTS;
}

export function getRetryDelay(attemptCount: number): number {
  // Exponential backoff: 1s, 2s, 4s
  return CONTENT_STUDY_CONSTANTS.RETRY_DELAY_MS * Math.pow(2, attemptCount);
}

export function sanitizeTextForStorage(text: string): string {
  // Remove null bytes and other problematic characters
  return text
    .replace(/\x00/g, '') // Null bytes
    .replace(/[\x80-\x9F]/g, '') // Control characters
    .trim();
}

export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) {return text;}
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:v=|\/|shorts\/|embed\/)([\w-]{11})/,
    /^([\w-]{11})$/, // Just the ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {return match[1];}
  }

  return null;
}

export function isValidFileType(mimeType: string): boolean {
  const supportedTypes: readonly string[] = [
    ...CONTENT_STUDY_CONSTANTS.SUPPORTED_PDF_TYPES,
    ...CONTENT_STUDY_CONSTANTS.SUPPORTED_TEXT_TYPES,
  ];
  return supportedTypes.includes(mimeType);
}

export function formatValidationErrors(errors: ValidationError[]): string {
  const errorMessages = errors
    .filter((e) => e.severity === 'error')
    .map((e) => e.message);

  const warningMessages = errors
    .filter((e) => e.severity === 'warning')
    .map((e) => `Warning: ${e.message}`);

  return [...errorMessages, ...warningMessages].join('\n');
}
