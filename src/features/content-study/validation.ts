import { YouTubeUrlSchema } from './validation-schemas';
import { ContentSourceType, ContentStudyErrorCode } from './types';
import type { ValidationError, ContentStudyError, ErrorRecoveryAction } from './types';
import { CONTENT_STUDY_CONSTANTS } from './types';

export { YouTubeUrlSchema, FileUploadSchema, PastedTextSchema, TitleSchema } from './validation-schemas';
export { sanitizeTextForStorage, truncateText, extractYouTubeVideoId, isValidFileType, formatValidationErrors } from './validation-utils';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  metadata?: {
    characterCount?: number; wordCount?: number; estimatedReadTime?: number;
    youtubeVideoId?: string; fileType?: string;
  };
}

export function validateYouTubeUrl(url: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let videoId: string | undefined;
  if (!url.trim()) {
    errors.push({ field: 'youtubeUrl', code: 'REQUIRED', message: 'YouTube URL is required', severity: 'error' });
    return { isValid: false, errors, warnings };
  }
  if (url.length > CONTENT_STUDY_CONSTANTS.MAX_YOUTUBE_URL_LENGTH) {
    errors.push({ field: 'youtubeUrl', code: 'TOO_LONG', message: `URL must be less than ${CONTENT_STUDY_CONSTANTS.MAX_YOUTUBE_URL_LENGTH} characters`, severity: 'error' });
  }
  const result = YouTubeUrlSchema.safeParse(url);
  if (!result.success) {
    errors.push({ field: 'youtubeUrl', code: 'INVALID_FORMAT', message: 'Please enter a valid YouTube URL (youtube.com/watch?v=... or youtu.be/...)', severity: 'error' });
  } else {
    const match = url.match(/(?:v=|\/|shorts\/|embed\/)([\w-]{11})/);
    videoId = match?.[1];
    if (url.includes('list=')) warnings.push({ field: 'youtubeUrl', code: 'PLAYLIST_URL', message: 'Playlists are not supported. Only the first video will be processed.', severity: 'warning' });
    if (url.includes('t=')) warnings.push({ field: 'youtubeUrl', code: 'TIMESTAMP_URL', message: 'Timestamp will be ignored. Full video transcript will be extracted.', severity: 'warning' });
  }
  return { isValid: errors.length === 0, errors, warnings, metadata: videoId ? { youtubeVideoId: videoId } : undefined };
}

export function validatePastedText(text: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (!text.trim()) {
    errors.push({ field: 'pastedText', code: 'REQUIRED', message: 'Content is required', severity: 'error' });
    return { isValid: false, errors, warnings };
  }
  const len = text.trim().length;
  if (len < CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH) errors.push({ field: 'pastedText', code: 'TOO_SHORT', message: `Content must be at least ${CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH} characters (currently ${len})`, severity: 'error' });
  if (len > CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH) errors.push({ field: 'pastedText', code: 'TOO_LONG', message: `Content must be less than ${CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH} characters (currently ${len})`, severity: 'error' });
  if (len < 200) warnings.push({ field: 'pastedText', code: 'SHORT_CONTENT', message: 'Short content may produce less effective study materials', severity: 'warning' });
  if (len > 30000) warnings.push({ field: 'pastedText', code: 'LONG_CONTENT', message: 'Very long content may take longer to process', severity: 'warning' });
  if ((text.match(/\n{5,}/g) || []).length > 5) warnings.push({ field: 'pastedText', code: 'POOR_FORMATTING', message: 'Content has excessive line breaks. Consider cleaning up the text.', severity: 'warning' });
  const wordCount = text.trim().split(/\s+/).length;
  return { isValid: errors.length === 0, errors, warnings, metadata: { characterCount: len, wordCount, estimatedReadTime: Math.ceil(wordCount / 200) } };
}

export function validateFileUpload(file: { uri: string; name: string; size: number; type: string } | null): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (!file) { errors.push({ field: 'file', code: 'REQUIRED', message: 'Please select a file', severity: 'error' }); return { isValid: false, errors, warnings }; }
  if (file.size > CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE) {
    const maxMB = CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE / (1024 * 1024);
    errors.push({ field: 'file', code: 'FILE_TOO_LARGE', message: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed (${maxMB}MB)`, severity: 'error' });
  }
  const supported: readonly string[] = [...CONTENT_STUDY_CONSTANTS.SUPPORTED_PDF_TYPES, ...CONTENT_STUDY_CONSTANTS.SUPPORTED_TEXT_TYPES];
  if (!supported.includes(file.type as string)) errors.push({ field: 'file', code: 'UNSUPPORTED_TYPE', message: `File type "${file.type}" is not supported. Please use PDF, TXT, or MD files.`, severity: 'error' });
  if (!file.name || file.name.trim().length === 0) errors.push({ field: 'file', code: 'INVALID_NAME', message: 'File name is invalid', severity: 'error' });
  if (file.size / (1024 * 1024) > 5 && file.size / (1024 * 1024) <= 10) warnings.push({ field: 'file', code: 'LARGE_FILE', message: 'Large files may take longer to upload and process', severity: 'warning' });
  return { isValid: errors.length === 0, errors, warnings, metadata: { fileType: file.type } };
}

export function validateTitle(title: string | undefined): ValidationResult {
  if (!title || title.trim().length === 0) return { isValid: true, errors: [], warnings: [] };
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (title.length > CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH) errors.push({ field: 'title', code: 'TOO_LONG', message: `Title must be less than ${CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH} characters`, severity: 'error' });
  if (/[<>{}[\]]/.test(title)) warnings.push({ field: 'title', code: 'SPECIAL_CHARS', message: 'Title contains special characters that may cause display issues', severity: 'warning' });
  return { isValid: errors.length === 0, errors, warnings };
}

export function validateContentSubmission(
  type: ContentSourceType,
  data: { text?: string; file?: { uri: string; name: string; size: number; type: string } | null; url?: string; title?: string },
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let metadata: ValidationResult['metadata'] = {};
  if (type === 'PASTE') { const r = validatePastedText(data.text || ''); errors.push(...r.errors); warnings.push(...r.warnings); metadata = { ...metadata, ...r.metadata }; }
  else if (type === 'PDF') { const r = validateFileUpload(data.file || null); errors.push(...r.errors); warnings.push(...r.warnings); metadata = { ...metadata, ...r.metadata }; }
  else if (type === 'YOUTUBE') { const r = validateYouTubeUrl(data.url || ''); errors.push(...r.errors); warnings.push(...r.warnings); metadata = { ...metadata, ...r.metadata }; }
  else if (type === 'URL') {
    if (!data.url || !data.url.trim()) errors.push({ field: 'url', code: 'REQUIRED', message: 'URL is required', severity: 'error' });
    else if (!/^https?:\/\/.+/.test(data.url)) errors.push({ field: 'url', code: 'INVALID_FORMAT', message: 'Please enter a valid URL starting with http:// or https://', severity: 'error' });
  }
  const tr = validateTitle(data.title);
  errors.push(...tr.errors); warnings.push(...tr.warnings);
  return { isValid: errors.length === 0, errors, warnings, metadata };
}

export function buildError(code: ContentStudyErrorCode, message: string, details?: Record<string, unknown>, recoverable = false): ContentStudyError {
  const actions: Record<ContentStudyErrorCode, ErrorRecoveryAction> = {
    [ContentStudyErrorCode.RATE_LIMIT_EXCEEDED]: 'try_again_later', [ContentStudyErrorCode.CONTENT_NOT_FOUND]: 'go_back',
    [ContentStudyErrorCode.EXTRACTION_FAILED]: 'retry', [ContentStudyErrorCode.GENERATION_FAILED]: 'retry',
    [ContentStudyErrorCode.INVALID_INPUT]: 'edit_content', [ContentStudyErrorCode.STORAGE_ERROR]: 'retry',
    [ContentStudyErrorCode.NETWORK_ERROR]: 'retry', [ContentStudyErrorCode.UNKNOWN_ERROR]: 'contact_support',
    [ContentStudyErrorCode.FILE_TOO_LARGE]: 'reupload', [ContentStudyErrorCode.UNSUPPORTED_FILE_TYPE]: 'reupload',
    [ContentStudyErrorCode.PDF_PARSE_ERROR]: 'reupload', [ContentStudyErrorCode.YOUTUBE_TRANSCRIPT_ERROR]: 'retry',
    [ContentStudyErrorCode.INVALID_YOUTUBE_URL]: 'edit_content', [ContentStudyErrorCode.CONTENT_EXPIRED]: 'go_back',
    [ContentStudyErrorCode.SESSION_INTERRUPTED]: 'retry', [ContentStudyErrorCode.OFFLINE_MODE]: 'try_again_later',
    [ContentStudyErrorCode.AI_TIMEOUT]: 'retry', [ContentStudyErrorCode.AI_RATE_LIMIT]: 'try_again_later',
    [ContentStudyErrorCode.VALIDATION_ERROR]: 'edit_content',
  };
  return { code, message, details, timestamp: Date.now(), recoverable, suggestedAction: actions[code] };
}

export function isRecoverableError(error: ContentStudyErrorCode): boolean {
  return [ContentStudyErrorCode.NETWORK_ERROR, ContentStudyErrorCode.EXTRACTION_FAILED, ContentStudyErrorCode.GENERATION_FAILED, ContentStudyErrorCode.STORAGE_ERROR, ContentStudyErrorCode.AI_TIMEOUT, ContentStudyErrorCode.YOUTUBE_TRANSCRIPT_ERROR].includes(error);
}

export function shouldRetry(error: ContentStudyErrorCode, attemptCount: number): boolean {
  if (!isRecoverableError(error)) return false;
  return attemptCount < CONTENT_STUDY_CONSTANTS.MAX_RETRY_ATTEMPTS;
}

export function getRetryDelay(attemptCount: number): number {
  return CONTENT_STUDY_CONSTANTS.RETRY_DELAY_MS * Math.pow(2, attemptCount);
}
