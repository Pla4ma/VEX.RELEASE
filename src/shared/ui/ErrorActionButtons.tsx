import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { lightColors } from '@/theme/tokens/colors';

import { styles } from './PremiumErrorRecovery.styles';

interface ErrorActionButtonsProps {
  hasMoreRetries: boolean;
  onRetry?: () => Promise<void>;
  isRetrying: boolean;
  retryCount: number;
  handleRetry: () => Promise<void>;
  severityColor: string;
  canFallback: boolean;
  onFallback?: () => void;
  handleFallback: () => void;
  onDismiss?: () => void;
  handleDismiss: () => void;
  borderColor: string;
  mutedColor: string;
  secondaryColor: string;
}

export const ErrorActionButtons: React.ComponentType<ErrorActionButtonsProps> = ({
  hasMoreRetries,
  onRetry,
  isRetrying,
  retryCount,
  handleRetry,
  severityColor,
  canFallback,
  onFallback,
  handleFallback,
  onDismiss,
  handleDismiss,
  borderColor,
  mutedColor,
  secondaryColor,
}) => (
  <View style={styles.actions}>
    {hasMoreRetries && onRetry && (
      <Pressable
        style={({ pressed }) => [
          styles.retryButton,
          { backgroundColor: severityColor },
          pressed && { opacity: 0.8 },
        ]}
        onPress={handleRetry}
        disabled={isRetrying}
        accessibilityLabel="Try Again"
        accessibilityRole="button"
        accessibilityHint="Retries the failed operation"
      >
        {isRetrying ? (
          <ActivityIndicator size="small" color={lightColors.text.inverse} />
        ) : (
          <Text style={styles.retryButtonText}>
            {retryCount > 0 ? 'Try Again' : 'Retry Now'}
          </Text>
        )}
      </Pressable>
    )}

    {canFallback && onFallback && (
      <Pressable
        style={({ pressed }) => [
          styles.fallbackButton,
          { borderColor },
          pressed && { opacity: 0.8 },
        ]}
        onPress={handleFallback}
        accessibilityLabel="Work Offline"
        accessibilityRole="button"
        accessibilityHint="Continues working in offline mode"
      >
        <Text style={[styles.fallbackText, { color: secondaryColor }]}>
          Work Offline
        </Text>
      </Pressable>
    )}

    {onDismiss && (
      <Pressable
        onPress={handleDismiss}
        style={({ pressed }) => [
          styles.dismissButton,
          pressed && { opacity: 0.8 },
        ]}
        accessibilityLabel="Dismiss"
        accessibilityRole="button"
        accessibilityHint="Dismisses this error message"
      >
        <Text style={[styles.dismissText, { color: mutedColor }]}>
          Dismiss
        </Text>
      </Pressable>
    )}
  </View>
);
