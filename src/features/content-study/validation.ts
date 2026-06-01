import { ContentSourceType, ContentStudyErrorCode } from './types';
import type {
  ValidationError,
  ContentStudyError,
  ErrorRecoveryAction,
} from './types';
import { CONTENT_STUDY_CONSTANTS } from './types';
import type { ValidationResult } from './validators';
import {
  validateYouTubeUrl,
  validatePastedText,
} from './validators';
import {
  validateFileUpload,
  validateTitle,
} from './validators-file';

export {
  YouTubeUrlSchema,
  FileUploadSchema,
  PastedTextSchema,
  TitleSchema,
} from './validation-schemas';
export {
  sanitizeTextForStorage,
  truncateText,
  extractYouTubeVideoId,
  isValidFileType,
  formatValidationErrors,
} from './validation-utils';
export type { ValidationResult } from './validators';
export { validateYouTubeUrl, validatePastedText } from './validators';
export { validateFileUpload, validateTitle } from './validators-file';

export function validateContentSubmission(
  type: ContentSourceType,
  data: {
    text?: string;
    file?: { uri: string; name: string; size: number; type: string } | null;
    url?: string;
    title?: string;
  },
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let metadata: ValidationResult['metadata'] = {};
  if (type === 'PASTE') {
    const r = validatePastedText(data.text || '');
    errors.push(...r.errors);
    warnings.push(...r.warnings);
    metadata = { ...metadata, ...r.metadata };
  } else if (type === 'PDF') {
    const r = validateFileUpload(data.file || null);
    errors.push(...r.errors);
    warnings.push(...r.warnings);
    metadata = { ...metadata, ...r.metadata };
  } else if (type === 'YOUTUBE') {
    const r = validateYouTubeUrl(data.url || '');
    errors.push(...r.errors);
    warnings.push(...r.warnings);
    metadata = { ...metadata, ...r.metadata };
  } else if (type === 'URL') {
    if (!data.url || !data.url.trim())
      {errors.push({
        field: 'url',
        code: 'REQUIRED',
        message: 'URL is required',
        severity: 'error',
      });}
    else if (!/^https?:\/\/.+/.test(data.url))
      {errors.push({
        field: 'url',
        code: 'INVALID_FORMAT',
        message: 'Please enter a valid URL starting with http:// or https://',
        severity: 'error',
      });}
  }
  const tr = validateTitle(data.title);
  errors.push(...tr.errors);
  warnings.push(...tr.warnings);
  return { isValid: errors.length === 0, errors, warnings, metadata };
}

export function buildError(
  code: ContentStudyErrorCode,
  message: string,
  details?: Record<string, unknown>,
  recoverable = false,
): ContentStudyError {
  const actions: Record<ContentStudyErrorCode, ErrorRecoveryAction> = {
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
    suggestedAction: actions[code],
  };
}

export function isRecoverableError(error: ContentStudyErrorCode): boolean {
  return [
    ContentStudyErrorCode.NETWORK_ERROR,
    ContentStudyErrorCode.EXTRACTION_FAILED,
    ContentStudyErrorCode.GENERATION_FAILED,
    ContentStudyErrorCode.STORAGE_ERROR,
    ContentStudyErrorCode.AI_TIMEOUT,
    ContentStudyErrorCode.YOUTUBE_TRANSCRIPT_ERROR,
  ].includes(error);
}

export function shouldRetry(
  error: ContentStudyErrorCode,
  attemptCount: number,
): boolean {
  if (!isRecoverableError(error)) {return false;}
  return attemptCount < CONTENT_STUDY_CONSTANTS.MAX_RETRY_ATTEMPTS;
}

export function getRetryDelay(attemptCount: number): number {
  return CONTENT_STUDY_CONSTANTS.RETRY_DELAY_MS * Math.pow(2, attemptCount);
}
