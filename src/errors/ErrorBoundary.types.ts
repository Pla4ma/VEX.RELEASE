import type { ReactNode, ErrorInfo } from "react";

export type ErrorCategory =
  | "network"
  | "auth"
  | "validation"
  | "server"
  | "client"
  | "unknown";

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  category: ErrorCategory;
  retryCount: number;
  isRetrying: boolean;
  lastRetryAt: number | null;
  degraded: boolean;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  degradedFallback?: ReactNode;
  onError?: (
    error: Error,
    errorInfo: ErrorInfo,
    category: ErrorCategory,
  ) => void;
  onReset?: () => void | Promise<void>;
  onDegraded?: () => ReactNode;
  maxRetries?: number;
  retryDelay?: number;
  allowDegraded?: boolean;
}

export interface ErrorFallbackProps {
  error: Error | null;
  category: ErrorCategory;
  retryCount: number;
  maxRetries: number;
  isRetrying: boolean;
  canRetry: boolean;
  isRecoverable: boolean;
  onRetry: () => void;
  onDegraded?: () => void;
}
