import { captureSilentFailure } from "../../utils/silent-failure";
import type { ContentStudyError, ErrorRecoveryAction } from "./types";
import { CONTENT_STUDY_CONSTANTS, ContentStudyErrorCode } from "./types";
import { buildError, isRecoverableError, shouldRetry, getRetryDelay } from "./validation";
import { captureException } from "../../config/sentry";


export function getErrorFallbackMessage(error: ContentStudyError): {
  title: string;
  message: string;
  action: string;
} {
  const errorMessages: Record<ContentStudyErrorCode, { title: string; message: string; action: string }> = {
    [ContentStudyErrorCode.RATE_LIMIT_EXCEEDED]: {
      title: 'Daily Limit Reached',
      message: 'You have reached your daily limit of 10 study plans. New plans reset at midnight.',
      action: 'View Your Study Plans',
    },
    [ContentStudyErrorCode.CONTENT_NOT_FOUND]: {
      title: 'Content Not Found',
      message: 'The content you are looking for may have been deleted or expired.',
      action: 'Go Back',
    },
    [ContentStudyErrorCode.EXTRACTION_FAILED]: {
      title: 'Extraction Failed',
      message: 'We could not extract text from your content. The file may be corrupted or password protected.',
      action: 'Try Again',
    },
    [ContentStudyErrorCode.GENERATION_FAILED]: {
      title: 'Generation Failed',
      message: 'The AI could not generate a study plan from your content. Please try with different content.',
      action: 'Try Again',
    },
    [ContentStudyErrorCode.INVALID_INPUT]: {
      title: 'Invalid Input',
      message: 'Please check your input and try again.',
      action: 'Edit Input',
    },
    [ContentStudyErrorCode.STORAGE_ERROR]: {
      title: 'Storage Error',
      message: 'There was a problem saving your file. Please try again.',
      action: 'Retry',
    },
    [ContentStudyErrorCode.NETWORK_ERROR]: {
      title: 'Connection Issue',
      message: 'Please check your internet connection and try again.',
      action: 'Retry',
    },
    [ContentStudyErrorCode.UNKNOWN_ERROR]: {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
      action: 'Contact Support',
    },
    [ContentStudyErrorCode.FILE_TOO_LARGE]: {
      title: 'File Too Large',
      message: `Maximum file size is ${CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE / (1024 * 1024)}MB. Please upload a smaller file.`,
      action: 'Select Different File',
    },
    [ContentStudyErrorCode.UNSUPPORTED_FILE_TYPE]: {
      title: 'Unsupported File Type',
      message: 'Please upload a PDF, TXT, or MD file.',
      action: 'Select Different File',
    },
    [ContentStudyErrorCode.PDF_PARSE_ERROR]: {
      title: 'PDF Error',
      message: 'We could not read this PDF. It may be corrupted, scanned, or password protected.',
      action: 'Try Different PDF',
    },
    [ContentStudyErrorCode.YOUTUBE_TRANSCRIPT_ERROR]: {
      title: 'Transcript Unavailable',
      message: 'This video does not have captions or transcripts available.',
      action: 'Try Different Video',
    },
    [ContentStudyErrorCode.INVALID_YOUTUBE_URL]: {
      title: 'Invalid YouTube URL',
      message: 'Please enter a valid YouTube video URL.',
      action: 'Edit URL',
    },
    [ContentStudyErrorCode.CONTENT_EXPIRED]: {
      title: 'Content Expired',
      message: 'This content has expired after 90 days and is no longer available.',
      action: 'Create New Content',
    },
    [ContentStudyErrorCode.SESSION_INTERRUPTED]: {
      title: 'Session Interrupted',
      message: 'Your study session was interrupted. Your progress has been saved.',
      action: 'Resume',
    },
    [ContentStudyErrorCode.OFFLINE_MODE]: {
      title: 'Offline Mode',
      message: 'You are currently offline. Your request will be processed when you reconnect.',
      action: 'OK',
    },
    [ContentStudyErrorCode.AI_TIMEOUT]: {
      title: 'Processing Timeout',
      message: 'The AI took too long to respond. Please try again with shorter content.',
      action: 'Try Again',
    },
    [ContentStudyErrorCode.AI_RATE_LIMIT]: {
      title: 'AI Rate Limited',
      message: 'Our AI service is currently busy. Please try again in a moment.',
      action: 'Retry',
    },
    [ContentStudyErrorCode.VALIDATION_ERROR]: {
      title: 'Validation Error',
      message: 'Please check your input and try again.',
      action: 'Edit',
    },
  };

  return errorMessages[error.code as ContentStudyErrorCode] || errorMessages[ContentStudyErrorCode.UNKNOWN_ERROR];
}

export const DefaultRetryStrategy: RetryStrategy = {
  maxAttempts: CONTENT_STUDY_CONSTANTS.MAX_RETRY_ATTEMPTS,
  backoffMs: CONTENT_STUDY_CONSTANTS.RETRY_DELAY_MS,
  maxBackoffMs: 30000,
  retryableCodes: [ContentStudyErrorCode.NETWORK_ERROR, ContentStudyErrorCode.AI_TIMEOUT, ContentStudyErrorCode.STORAGE_ERROR, ContentStudyErrorCode.EXTRACTION_FAILED],
  shouldRetry: (error, attempt) => {
    if (attempt >= CONTENT_STUDY_CONSTANTS.MAX_RETRY_ATTEMPTS) {
      return false;
    }
    return isRecoverableError(error.code as ContentStudyErrorCode);
  },
};

export const ExponentialBackoffStrategy: RetryStrategy = {
  maxAttempts: 5,
  backoffMs: 1000,
  maxBackoffMs: 60000,
  retryableCodes: [ContentStudyErrorCode.NETWORK_ERROR, ContentStudyErrorCode.AI_RATE_LIMIT],
  shouldRetry: (error, attempt) => {
    if (attempt >= 5) {
      return false;
    }
    return error.code === ContentStudyErrorCode.NETWORK_ERROR || error.code === ContentStudyErrorCode.AI_RATE_LIMIT;
  },
};

export async function executeWithRetry<T>(operation: () => Promise<T>, strategy: RetryStrategy = DefaultRetryStrategy, onRetry?: (attempt: number, delay: number, error: ContentStudyError) => void): Promise<T> {
  let lastError: ContentStudyError | undefined;

  for (let attempt = 0; attempt < strategy.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as ContentStudyError;

      if (!strategy.shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      const delay = Math.min(strategy.backoffMs * Math.pow(2, attempt), strategy.maxBackoffMs);

      if (onRetry) {
        onRetry(attempt + 1, delay, lastError);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Operation failed after max retries');
}