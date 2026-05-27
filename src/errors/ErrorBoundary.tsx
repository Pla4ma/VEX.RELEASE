import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Box } from "../components/primitives";
import { Text } from "../components/primitives";
import { Button } from "../components";
import { useTheme } from "../theme";
import { createDebugger } from "../utils/debug";
import { getAnalyticsService } from "../analytics/AnalyticsService";
import { captureException } from "../config/sentry";
import { launchColors } from "@theme/tokens/launch-colors";
const debug = createDebugger("error");
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
interface ErrorBoundaryProps {
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
function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout")
  ) {
    return "network";
  }
  if (
    message.includes("auth") ||
    message.includes("unauthorized") ||
    message.includes("token")
  ) {
    return "auth";
  }
  if (message.includes("validation") || message.includes("invalid")) {
    return "validation";
  }
  if (
    message.includes("server") ||
    message.includes("500") ||
    message.includes("503")
  ) {
    return "server";
  }
  if (
    name.includes("error") &&
    !name.includes("reference") &&
    !name.includes("type")
  ) {
    return "client";
  }
  return "unknown";
}
function calculateRetryDelay(attempt: number, baseDelay: number): number {
  const exponential = Math.pow(2, attempt) * baseDelay;
  const jitter = Math.random() * 1000;
  return Math.min(exponential + jitter, 30000);
}
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorState> {
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      category: "unknown",
      retryCount: 0,
      isRetrying: false,
      lastRetryAt: null,
      degraded: false,
    };
  }
  static getDerivedStateFromError(error: Error): Partial<ErrorState> {
    const category = categorizeError(error);
    return { hasError: true, error, category, isRetrying: false };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { category } = this.state;
    debug.error("ErrorBoundary caught error: " + error.message, error);
    debug.debug("Component stack: %s", errorInfo.componentStack);
    this.reportError(error, errorInfo, category);
    this.props.onError?.(error, errorInfo, category);
    if (this.shouldAutoRetry(category)) {
      this.scheduleRetry();
    }
  }
  componentWillUnmount(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }
  private shouldAutoRetry(category: ErrorCategory): boolean {
    const { maxRetries = 3 } = this.props;
    return category === "network" && this.state.retryCount < maxRetries;
  }
  private scheduleRetry(): void {
    const { retryDelay = 1000 } = this.props;
    const delay = calculateRetryDelay(this.state.retryCount, retryDelay);
    debug.debug("Scheduling retry in %dms", delay);
    this.retryTimer = setTimeout(() => {
      this.handleRetry();
    }, delay);
  }
  private reportError(
    error: Error,
    errorInfo: ErrorInfo,
    category: ErrorCategory,
  ): void {
    const analytics = getAnalyticsService();
    analytics.track("error", {
      error: error.message,
      category,
      stack: __DEV__ ? (error.stack ?? undefined) : undefined,
      componentStack: errorInfo.componentStack,
      fatal: category === "client",
    });
    if (__DEV__) {
      debug.debug("🔴 Error Report");
      debug.debug("Category: %s", category);
      debug.debug("Error: %s", error.message);
      debug.debug("Stack: %s", error.stack);
      debug.debug("Component Stack: %s", errorInfo.componentStack);
      debug.debug("Retry Count: %d", this.state.retryCount);
    }
  }
  private handleRetry = async (): Promise<void> => {
    const { maxRetries = 3, onReset } = this.props;
    const { retryCount, category } = this.state;
    if (retryCount >= maxRetries) {
      debug.warn("Max retries reached, entering degraded mode");
      this.setState({ degraded: true, isRetrying: false });
      return;
    }
    this.setState({ isRetrying: true, lastRetryAt: Date.now() });
    try {
      if (onReset) {
        await onReset();
      }
      this.setState({
        hasError: false,
        error: null,
        isRetrying: false,
        retryCount: retryCount + 1,
      });
      debug.info("Retry successful after %d attempts", retryCount + 1);
    } catch (retryError) {
      debug.error("Retry failed:", retryError as Error);
      this.setState({
        isRetrying: false,
        retryCount: retryCount + 1,
        error: retryError as Error,
      });
      if (this.shouldAutoRetry(category)) {
        this.scheduleRetry();
      } else if (retryCount + 1 >= maxRetries) {
        this.setState({ degraded: true });
      }
    }
  };
  private handleDegradedContinue = (): void => {
    this.setState({ degraded: true, hasError: false });
  };
  private renderErrorUI(): ReactNode {
    const { fallback, maxRetries = 3, allowDegraded = true } = this.props;
    const { error, category, retryCount, isRetrying, degraded } = this.state;
    if (fallback) {
      return fallback;
    }
    if (degraded && allowDegraded) {
      return this.renderDegradedUI();
    }
    const canRetry = retryCount < maxRetries && category !== "client";
    const isRecoverable = category === "network" || category === "server";
    return (
      <ErrorFallback
        error={error}
        category={category}
        retryCount={retryCount}
        maxRetries={maxRetries}
        isRetrying={isRetrying}
        canRetry={canRetry}
        isRecoverable={isRecoverable}
        onRetry={this.handleRetry}
        onDegraded={allowDegraded ? this.handleDegradedContinue : undefined}
      />
    );
  }
  private renderDegradedUI(): ReactNode {
    if (this.props.degradedFallback) {
      return this.props.degradedFallback;
    }
    return (
      <Box flex={1} p="lg">
        <Box
          p="md"
          style={{
            backgroundColor: launchColors.hex_fef3c7,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: launchColors.hex_f59e0b,
          }}
        >
          <Text variant="body" style={{ color: launchColors.hex_92400e }}>
            Running in limited mode. Some features may be unavailable.
          </Text>
        </Box>
        {this.props.children}
      </Box>
    );
  }
  render(): ReactNode {
    if (this.state.hasError && !this.state.degraded) {
      return this.renderErrorUI();
    }
    return this.props.children;
  }
}
interface ErrorFallbackProps {
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
function ErrorFallback({
  error,
  category,
  retryCount,
  maxRetries,
  isRetrying,
  canRetry,
  isRecoverable,
  onRetry,
  onDegraded,
}: ErrorFallbackProps): JSX.Element {
  const theme = useTheme();
  const getErrorMessage = () => {
    switch (category) {
      case "network":
        return "Connection lost. Check your internet and try again.";
      case "auth":
        return "Session expired. Please sign in again.";
      case "server":
        return "Our servers are having issues. Please try again later.";
      case "validation":
        return "Invalid data. Please check your input.";
      case "client":
        return "An unexpected error occurred. Please restart the app.";
      default:
        return error?.message || "Something went wrong";
    }
  };
  const getErrorIcon = () => {
    switch (category) {
      case "network":
        return "📡";
      case "auth":
        return "🔐";
      case "server":
        return "🔧";
      case "validation":
        return "⚠️";
      default:
        return "❌";
    }
  };
  return (
    <Box flex={1} justifyContent="center" alignItems="center" p="xl">
      <Text variant="hero" style={{ fontSize: 64, marginBottom: 16 }}>
        {getErrorIcon()}
      </Text>

      <Text variant="h3" mb="md" textAlign="center">
        Oops! Something went wrong
      </Text>

      <Text
        variant="body"
        style={{ color: launchColors.hex_6b7280, textAlign: "center" }}
        mb="lg"
      >
        {getErrorMessage()}
      </Text>

      {retryCount > 0 && (
        <Text
          variant="caption"
          style={{ color: launchColors.hex_9ca3af }}
          mb="lg"
        >
          Retry attempt {retryCount} of {maxRetries}
        </Text>
      )}

      {isRetrying ? (
        <Box flexDirection="row" alignItems="center" style={{ gap: 8 }}>
          <ActivityIndicator color={launchColors.hex_3b82f6} />
          <Text variant="body" style={{ color: launchColors.hex_6b7280 }}>
            Retrying...
          </Text>
        </Box>
      ) : (
        <Box flexDirection="row" style={{ gap: 12 }}>
          {canRetry && (
            <Button
              variant="primary"
              onPress={onRetry}
              accessibilityLabel="Try Again button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              Try Again
            </Button>
          )}
          {onDegraded && isRecoverable && (
            <Button
              variant="ghost"
              onPress={onDegraded}
              accessibilityLabel="Continue Anyway button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              Continue Anyway
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
export function setupGlobalErrorHandler(): void {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    debug.error(isFatal ? "Fatal Error" : "Error", error);
    if (!__DEV__) {
      captureException(error, {
        area: "globalErrorHandler",
        isFatal: !!isFatal,
      });
    }
    if (__DEV__) {
      debug.debug("Global Error Handler");
      debug.debug("Error: %s", error.message);
      debug.debug("Stack: %s", error.stack);
      debug.debug("Is Fatal: %s", String(isFatal));
    }
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}
export function setupRejectionHandler(): void {
  try {
    const tracking = require("promise/setimmediate/rejection-tracking");
    tracking.enable({
      allRejections: true,
      onUnhandled: (_id: string, error: Error) => {
        debug.error("Unhandled promise rejection", error);
        captureException(error, { area: "unhandledRejection" });
      },
      onHandled: () => {},
    });
  } catch (error: unknown) {
    globalThis.addEventListener?.(
      "unhandledrejection",
      (event: PromiseRejectionEvent) => {
        const error =
          event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason));
        debug.error("Unhandled promise rejection (fallback)", error);
        captureException(error, { area: "unhandledRejectionFallback" });
      },
    );
  }
}
