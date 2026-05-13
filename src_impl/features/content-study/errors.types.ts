export interface ErrorBoundaryState {
    hasError: boolean;
    error: ContentStudyError | null;
    errorInfo: React.ErrorInfo | null;
}

export interface RetryStrategy {
    maxAttempts: number;
    backoffMs: number;
    maxBackoffMs: number;
    retryableCodes: ContentStudyErrorCode[];
    shouldRetry: (error: ContentStudyError, attempt: number) => boolean;
}
