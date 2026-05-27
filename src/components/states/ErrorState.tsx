/**
 * ErrorState Component
 *
 * Display for error states with retry functionality.
 */

import React from "react";
import { type ViewStyle } from "react-native";

import { useTheme } from "../../theme";
import { Box } from "../primitives/Box";
import { Button } from "../primitives/Button";
import { Text } from "../primitives/Text";
import { launchColors } from "@theme/tokens/launch-colors";

/**
 * ErrorState props
 */
export interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error description */
  description?: string;
  /** Error code/category */
  errorCode?: string;
  /** Retry button text */
  retryLabel?: string;
  /** Retry button handler */
  onRetry?: () => void;
  /** Degraded mode button text */
  degradedLabel?: string;
  /** Degraded mode handler */
  onDegraded?: () => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

/**
 * ErrorState component
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Boss Interference Detected",
  description = "Something disrupted your focus flow. Try again and show that boss who's in control.",
  errorCode,
  retryLabel = "Try Again",
  onRetry,
  degradedLabel = "Continue Anyway",
  onDegraded,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  return (
    <Box
      flex={1}
      justifyContent="center"
      alignItems="center"
      p="xl"
      testID={testID}
      style={Object.assign(
        {},
        {
          backgroundColor:
            theme?.colors?.semantic?.background || launchColors.hex_f7f9fc,
        },
        style,
      )}
    >
      {/* Error Icon - X in circle per spec */}
      <Box mb="lg">
        <Box
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor:
              theme?.colors?.semantic?.primarySoft ||
              launchColors.rgb_91_77_255_0_12,
            borderColor:
              theme?.colors?.semantic?.danger || launchColors.hex_b91c1c,
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            variant="h1"
            style={{
              fontSize: 32,
              color: theme?.colors?.error?.DEFAULT || launchColors.hex_b91c1c,
            }}
          >
            ✕
          </Text>
        </Box>
      </Box>

      {/* Title */}
      <Text
        variant="h3"
        mb="md"
        textAlign="center"
        style={{
          color: theme?.colors?.text?.primary || launchColors.hex_07111f,
        }}
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        variant="body"
        mb="lg"
        textAlign="center"
        style={{
          color: theme?.colors?.text?.secondary || launchColors.hex_334155,
          maxWidth: 300,
        }}
      >
        {description}
      </Text>

      {/* Error Code */}
      {errorCode && (
        <Box
          mb="lg"
          p="sm"
          style={{
            backgroundColor:
              theme?.colors?.semantic?.surfaceGlass ||
              launchColors.rgb_255_255_255_0_86,
            borderRadius: theme?.borderRadius?.md || 8,
          }}
        >
          <Text
            variant="caption"
            style={{
              color: theme?.colors?.text?.tertiary || launchColors.hex_64748b,
              fontFamily: "monospace",
            }}
          >
            Error: {errorCode}
          </Text>
        </Box>
      )}

      {/* Actions */}
      <Box
        flexDirection="column"
        style={{ gap: theme?.spacing?.[3] || 12, width: "100%", maxWidth: 300 }}
      >
        {onRetry && (
          <Button
            accessibilityHint="Retries loading this content"
            accessibilityLabel={retryLabel}
            accessibilityRole="button"
            onPress={onRetry}
            variant="primary"
          >
            {retryLabel}
          </Button>
        )}
        {onDegraded && (
          <Button
            accessibilityHint="Continues with limited functionality"
            accessibilityLabel={degradedLabel}
            accessibilityRole="button"
            onPress={onDegraded}
            variant="ghost"
          >
            {degradedLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ErrorState;
