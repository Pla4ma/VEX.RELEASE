import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../../theme';
import { useFadeStyle, useShakeStyle } from './animations';
import { sanitizeErrorMessage } from '../../../utils/error-sanitizer';
import { styles } from './styles';
import type { ErrorStateProps } from './types';

export function ErrorState({
  error,
  title = 'Something went wrong',
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
  dismissLabel = 'Dismiss',
  showDetails = false,
  style,
  testID,
}: ErrorStateProps): JSX.Element {
  const { theme } = useTheme();
  const fadeStyle = useFadeStyle(true, 300);
  const shakeStyle = useShakeStyle();
  const errorMessage = sanitizeErrorMessage(error);
  const errorBg = `${theme.colors.error.DEFAULT}20`;
  return (
    <Animated.View
      style={[styles.errorContainer, style, fadeStyle, shakeStyle]}
      testID={testID}
    >
      <View style={[styles.errorIconContainer, { backgroundColor: errorBg }]}>
        <Text style={[styles.errorIcon, { color: theme.colors.error.DEFAULT }]}>
          !
        </Text>
      </View>
      <Text style={[styles.errorTitle, { color: theme.colors.text.primary }]}>
        {title}
      </Text>
      {showDetails ? (
        <Text
          style={[styles.errorDetails, { color: theme.colors.text.disabled }]}
        >
          {errorMessage}
        </Text>
      ) : null}
      <View style={styles.errorActions}>
        {onRetry ? (
          <Pressable
            onPress={onRetry}
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: theme.colors.semantic.danger },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityLabel="Error action"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text
              style={[
                styles.retryButtonText,
                { color: theme.colors.text.inverse },
              ]}
            >
              {retryLabel}
            </Text>
          </Pressable>
        ) : null}
        {onDismiss ? (
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.dismissButton,
              { backgroundColor: theme.colors.background.tertiary },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityLabel="Error action"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text
              style={[
                styles.dismissButtonText,
                { color: theme.colors.text.disabled },
              ]}
            >
              {dismissLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}
