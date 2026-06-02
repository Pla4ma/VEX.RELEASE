import { captureSilentFailure } from '../../utils/silent-failure';
import type { ContentStudyError, ErrorRecoveryAction } from './types';
import { ContentStudyErrorCode } from './types';
import {
  buildError,
  isRecoverableError,
  shouldRetry,
  getRetryDelay,
} from './validation';
import { captureException } from '../../config/sentry';

export class ContentStudyErrorHandler {
  private retryAttempts: Map<string, number> = new Map();
  private errorCallbacks: Map<
    ContentStudyErrorCode,
    Array<(error: ContentStudyError) => void>
  > = new Map();
  private static instance: ContentStudyErrorHandler;

  static getInstance(): ContentStudyErrorHandler {
    if (!ContentStudyErrorHandler.instance) {
      ContentStudyErrorHandler.instance = new ContentStudyErrorHandler();
    }
    return ContentStudyErrorHandler.instance;
  }

  handleError(
    code: ContentStudyErrorCode,
    message: string,
    context?: {
      operation: string;
      contentId?: string;
      generationId?: string;
      attemptCount?: number;
    },
  ): ContentStudyError {
    const error = buildError(code, message, context, isRecoverableError(code));
    if (context?.contentId) {
      const key = `${context.operation}:${context.contentId}`;
      const currentAttempts = this.retryAttempts.get(key) || 0;
      if (shouldRetry(code, currentAttempts)) {
        this.retryAttempts.set(key, currentAttempts + 1);
        error.retryAfter = getRetryDelay(currentAttempts);
      }
    }
    this.triggerCallbacks(error);
    return error;
  }

  registerCallback(
    codes: ContentStudyErrorCode | ContentStudyErrorCode[],
    callback: (error: ContentStudyError) => void,
  ): () => void {
    const codesArray = Array.isArray(codes) ? codes : [codes];
    codesArray.forEach((code) => {
      if (!this.errorCallbacks.has(code)) {
        this.errorCallbacks.set(code, []);
      }
      this.errorCallbacks.get(code)!.push(callback);
    });
    return () => {
      codesArray.forEach((code) => {
        const callbacks = this.errorCallbacks.get(code);
        if (callbacks) {
          const index = callbacks.indexOf(callback);
          if (index > -1) {
            callbacks.splice(index, 1);
          }
        }
      });
    };
  }

  private triggerCallbacks(error: ContentStudyError): void {
    const callbacks = this.errorCallbacks.get(
      error.code as ContentStudyErrorCode,
    );
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(error);
        } catch (error: unknown) {
          captureException(
            error instanceof Error
              ? error
              : new Error('Content study error callback failed'),
            { area: 'content-study.error-callback' },
          );
        }
      });
    }
  }

  getRetryAttempts(operation: string, id: string): number {
    return this.retryAttempts.get(`${operation}:${id}`) || 0;
  }

  resetRetryAttempts(operation: string, id: string): void {
    this.retryAttempts.delete(`${operation}:${id}`);
  }

  clearAllRetryAttempts(): void {
    this.retryAttempts.clear();
  }
}

export async function executeRecoveryAction(
  action: ErrorRecoveryAction,
  context: {
    error: ContentStudyError;
    contentId?: string;
    generationId?: string;
    retryCallback?: () => Promise<void>;
    refreshCallback?: () => Promise<void>;
    editCallback?: () => void;
    goBackCallback?: () => void;
  },
): Promise<boolean> {
  switch (action) {
    case 'retry':
      if (context.retryCallback) {
        try {
          await context.retryCallback();
          return true;
        } catch (error) {
          captureSilentFailure(error, {
            feature: 'content-study',
            operation: 'ui-fallback',
            type: 'ui',
          });
          return false;
        }
      }
      return false;
    case 'refresh':
      if (context.refreshCallback) {
        try {
          await context.refreshCallback();
          return true;
        } catch (error) {
          captureSilentFailure(error, {
            feature: 'content-study',
            operation: 'ui-fallback',
            type: 'ui',
          });
          return false;
        }
      }
      return false;
    case 'reupload':
      if (context.goBackCallback) {
        context.goBackCallback();
        return true;
      }
      return false;
    case 'edit_content':
      if (context.editCallback) {
        context.editCallback();
        return true;
      }
      return false;
    case 'contact_support':
      captureException(new Error(context.error.message), {
        area: 'content-study.contact-support',
        code: context.error.code,
      });
      return true;
    case 'try_again_later':
      return true;
    case 'use_fallback':
      return true;
    case 'go_back':
      if (context.goBackCallback) {
        context.goBackCallback();
        return true;
      }
      return false;
    case 'none':
    default:
      return true;
  }
}

export const errorHandler = ContentStudyErrorHandler.getInstance();
