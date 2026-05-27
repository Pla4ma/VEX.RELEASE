/**
 * Screen Error Boundary
 *
 * Provides error boundary protection for screen components
 * with graceful fallback UI, retry functionality, Sentry reporting,
 * and offline detection.
 */

import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { ScrollView } from "react-native";

import { useTheme } from "../../../theme";
import { Text } from "../../../components/primitives";
import { Button } from "../../../components";
import { OfflineEmptyState } from "./EmptyState";
import { captureException } from "../../../config/sentry";
import { useNetInfo } from "../../../network";

export interface ScreenErrorBoundaryProps {
  children: ReactNode;
  screenName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  allowOffline?: boolean;
  /** Feature tag for Sentry error grouping */
  featureTag?: string;
}

interface ScreenErrorState {
  hasError: boolean;
  error: Error | null;
  isOffline: boolean;
}

interface ErrorFallbackProps {
  screenName: string;
  error: Error | null;
  onRetry: () => void;
  onGoBack?: () => void;
}

function ErrorFallback({
  screenName,
  error,
  onRetry,
  onGoBack,
}: ErrorFallbackProps): JSX.Element {
  const { theme } = useTheme();
  const { isOffline } = useNetInfo();

  const errorMessage = error?.message?.toLowerCase() ?? "";
  const message = isOffline
    ? "You are offline. Please check your connection and try again."
    : errorMessage.includes("network") ||
        errorMessage.includes("fetch") ||
        errorMessage.includes("timeout")
      ? "Connection lost. Please check your internet and try again."
      : errorMessage.includes("auth") ||
          errorMessage.includes("unauthorized") ||
          errorMessage.includes("token")
        ? "Your session expired. Please sign in again."
        : `We couldn't load ${screenName}. Please try again.`;

  const offlineNotice = isOffline ? " Retry when reconnected." : "";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: theme.spacing[6],
      }}
    >
      <Text
        variant="display"
        style={{ marginBottom: theme.spacing[6], textAlign: "center" }}
      >
        {isOffline ? "📡" : "⚠️"}
      </Text>
      <Text
        variant="h3"
        color="text.primary"
        style={{ marginBottom: theme.spacing[3], textAlign: "center" }}
      >
        {isOffline ? "You are offline" : "Something went wrong"}
      </Text>
      <Text
        variant="body"
        color="text.secondary"
        style={{
          marginBottom: theme.spacing[6],
          maxWidth: 280,
          lineHeight: 22,
          textAlign: "center",
        }}
      >
        {message}
        {offlineNotice}
      </Text>
      <Button
        variant="primary"
        onPress={onRetry}
        style={{ width: "100%", maxWidth: 280 }}
        accessibilityLabel="Try Again button"
        accessibilityRole="button"
        accessibilityHint="Retries the screen operation"
      >
        Try Again
      </Button>
      {onGoBack && (
        <Button
          variant="ghost"
          onPress={onGoBack}
          style={{ width: "100%", maxWidth: 280, marginTop: theme.spacing[3] }}
          accessibilityLabel="Go Back button"
          accessibilityRole="button"
          accessibilityHint="Navigates back to the previous screen"
        >
          Go Back
        </Button>
      )}
    </ScrollView>
  );
}

export class ScreenErrorBoundary extends Component<
  ScreenErrorBoundaryProps,
  ScreenErrorState
> {
  constructor(props: ScreenErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, isOffline: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ScreenErrorState> {
    const msg = error.message.toLowerCase();
    return {
      hasError: true,
      error,
      isOffline:
        msg.includes("network") ||
        msg.includes("offline") ||
        msg.includes("connection"),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { featureTag } = this.props;
    captureException(error, {
      tags: { feature: featureTag ?? "screen-error-boundary" },
      extra: { componentStack: errorInfo.componentStack ?? "" },
    });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, isOffline: false });
  };

  render(): ReactNode {
    const { children, screenName, fallback, allowOffline } = this.props;
    const { hasError, error, isOffline } = this.state;

    if (!hasError) {
      return children;
    }

    if (isOffline && allowOffline) {
      return (
        <OfflineEmptyState
          onAction={this.handleRetry}
          actionLabel="Retry Connection"
        />
      );
    }

    if (fallback) {
      return fallback;
    }

    return (
      <ErrorFallback
        screenName={screenName}
        error={error}
        onRetry={this.handleRetry}
      />
    );
  }
}

export function withScreenErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenName: string,
): (props: P) => JSX.Element {
  return function WithErrorBoundary(props: P): JSX.Element {
    return (
      <ScreenErrorBoundary screenName={screenName}>
        <WrappedComponent
          {...(props as P & React.PropsWithChildren<unknown>)}
        />
      </ScreenErrorBoundary>
    );
  };
}

const screenErrorContext = React.createContext<((error: Error) => void) | null>(
  null,
);

export function useScreenError(): (error: Error) => void {
  const ctx = React.useContext(screenErrorContext);
  return (error: Error) => {
    if (ctx) {
      ctx(error);
    } else {
      throw error;
    }
  };
}

export default ScreenErrorBoundary;
