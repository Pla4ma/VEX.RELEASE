import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';

import { settingsStyles as styles } from './settings-screen-styles';

interface SettingsLoadingStateProps {
  message?: string;
}

export function SettingsLoadingState({
  message = 'Loading settings...',
}: SettingsLoadingStateProps) {
  return (
    <View style={styles.centerContainer}>
      <Skeleton width={40} height={40} variant="circular" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

interface SettingsErrorStateProps {
  error: Error | unknown;
  onRetry: () => void;
}

export function SettingsErrorState({
  error,
  onRetry,
}: SettingsErrorStateProps) {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Failed to load settings</Text>
      <Text style={styles.errorMessage}>
        {error instanceof Error ? error.message : 'Unknown error'}
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.retryButton,
          pressed && { opacity: 0.8 },
        ]}
        onPress={onRetry}
        accessibilityLabel="Retry loading settings"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </Pressable>
    </View>
  );
}
