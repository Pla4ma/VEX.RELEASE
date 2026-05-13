import { z } from "zod";
import { ContentSourceType, ValidationError, ContentStudyErrorCode, ContentStudyError, type ErrorRecoveryAction } from "./types";
import { CONTENT_STUDY_CONSTANTS } from "./types";


export function buildError(code: ContentStudyErrorCode, message: string, details?: Record<string, unknown>, recoverable: boolean = false): ContentStudyError {
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

export function isRecoverableError(error: ContentStudyErrorCode): boolean {
  const recoverableErrors: ContentStudyErrorCode[] = [ContentStudyErrorCode.NETWORK_ERROR, ContentStudyErrorCode.EXTRACTION_FAILED, ContentStudyErrorCode.GENERATION_FAILED, ContentStudyErrorCode.STORAGE_ERROR, ContentStudyErrorCode.AI_TIMEOUT, ContentStudyErrorCode.YOUTUBE_TRANSCRIPT_ERROR];
  return recoverableErrors.includes(error);
}

export function shouldRetry(error: ContentStudyErrorCode, attemptCount: number): boolean {
  if (!isRecoverableError(error)) {
    return false;
  }
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
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:v=|\/|shorts\/|embed\/)([\w-]{11})/,
    /^([\w-]{11})$/, // Just the ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export function isValidFileType(mimeType: string): boolean {
  const supportedTypes: readonly string[] = [...CONTENT_STUDY_CONSTANTS.SUPPORTED_PDF_TYPES, ...CONTENT_STUDY_CONSTANTS.SUPPORTED_TEXT_TYPES];
  return supportedTypes.includes(mimeType);
}

export function formatValidationErrors(errors: ValidationError[]): string {
  const errorMessages = errors.filter((e) => e.severity === 'error').map((e) => e.message);

  const warningMessages = errors.filter((e) => e.severity === 'warning').map((e) => `Warning: ${e.message}`);

  return [...errorMessages, ...warningMessages].join('\n');
}