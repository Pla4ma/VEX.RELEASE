import type { ReactNode } from "react";
import { ActivityIndicator } from "react-native";
import { Box, Text } from "../components/primitives";
import { Button } from "../components";
import { useTheme } from "../theme";
import { launchColors } from "@theme/tokens/launch-colors";
import type { ErrorFallbackProps, ErrorCategory } from "./ErrorBoundary.types";

function getErrorMessage(category: ErrorCategory, error: Error | null): string {
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
}

function getErrorIcon(category: ErrorCategory): string {
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
}

export function ErrorFallback({
  error,
  category,
  retryCount,
  maxRetries,
  isRetrying,
  canRetry,
  isRecoverable,
  onRetry,
  onDegraded,
}: ErrorFallbackProps): ReactNode {
  useTheme();
  return (
    <Box flex={1} justifyContent="center" alignItems="center" p="xl">
      <Text variant="hero" style={{ fontSize: 64, marginBottom: 16 }}>
        {getErrorIcon(category)}
      </Text>

      <Text variant="h3" mb="md" textAlign="center">
        Oops! Something went wrong
      </Text>

      <Text
        variant="body"
        style={{ color: launchColors.hex_6b7280, textAlign: "center" }}
        mb="lg"
      >
        {getErrorMessage(category, error)}
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
