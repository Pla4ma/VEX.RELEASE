import { captureSilentFailure } from '../../../../utils/silent-failure';
import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import Animated, { Keyframe, FadeIn } from 'react-native-reanimated';

import { errorStateStyles as styles } from './error-state-styles';

const Shake = new Keyframe({
  0: { transform: [{ translateX: 0 }] },
  10: { transform: [{ translateX: -10 }] },
  20: { transform: [{ translateX: 10 }] },
  30: { transform: [{ translateX: -10 }] },
  40: { transform: [{ translateX: 10 }] },
  50: { transform: [{ translateX: -10 }] },
  60: { transform: [{ translateX: 10 }] },
  70: { transform: [{ translateX: -10 }] },
  80: { transform: [{ translateX: 10 }] },
  90: { transform: [{ translateX: -5 }] },
  100: { transform: [{ translateX: 0 }] },
});

interface ErrorStateProps {
  title?: string;
  message: string;
  errorCode?: string;
  onRetry?: () => Promise<void>;
  onDismiss?: () => void;
  retryAttempts?: number;
  maxRetries?: number;
}

export function ErrorState({
  title = 'Oops! Something went wrong',
  message,
  errorCode,
  onRetry,
  onDismiss,
  retryAttempts = 0,
  maxRetries = 3,
}: ErrorStateProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [localAttempts, setLocalAttempts] = useState(retryAttempts);
  const handleRetry = async () => {
    if (!onRetry || localAttempts >= maxRetries) {
      return;
    }
    setIsRetrying(true);
    try {
      await onRetry();
      setLocalAttempts(0);
    } catch (error) {
      captureSilentFailure(error, {
        feature: 'ai-coach',
        operation: 'ui-fallback',
        type: 'ui',
      });
      setLocalAttempts((prev) => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  };
  const canRetry = localAttempts < maxRetries && !!onRetry;
  const isDegraded = localAttempts > 0;
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.container, isDegraded && styles.degradedContainer]}
    >
      <Animated.View entering={Shake.duration(500)}>
        <Text style={styles.icon}>{isDegraded ? '⚠️' : '😕'}</Text>
      </Animated.View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {errorCode && (
        <View style={styles.errorCodeContainer}>
          <Text style={styles.errorCodeLabel}>Error Code:</Text>
          <Text style={styles.errorCode}>{errorCode}</Text>
        </View>
      )}

      {localAttempts > 0 && (
        <Text style={styles.attemptsText}>
          Attempt {localAttempts} of {maxRetries}
        </Text>
      )}

      <View style={styles.actions}>
        {canRetry && (
          <Pressable
            onPress={handleRetry}
            disabled={isRetrying}
            style={[styles.retryButton, isRetrying && styles.buttonDisabled]}
            accessibilityLabel="Retry loading"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            {isRetrying ? (
              <ActivityIndicator color={'#fff'} />
            ) : (
              <Text style={styles.retryButtonText}>
                {isDegraded ? 'Try Again' : 'Retry'}
              </Text>
            )}
          </Pressable>
        )}

        {!canRetry && onDismiss && (
          <Pressable
            onPress={onDismiss}
            style={styles.dismissButton}
            accessibilityLabel="Dismiss error"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={styles.dismissButtonText}>Dismiss</Text>
          </Pressable>
        )}

        {localAttempts >= maxRetries && (
          <Text style={styles.maxRetriesText}>
            Max retry attempts reached. Please try again later.
          </Text>
        )}
      </View>

      {isDegraded && (
        <View style={styles.degradedBadge}>
          <Text style={styles.degradedBadgeText}>Degraded Mode</Text>
        </View>
      )}
    </Animated.View>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <Animated.View
      entering={Shake.duration(400)}
      style={styles.inlineContainer}
    >
      <Text style={styles.inlineIcon}>⚠️</Text>
      <Text style={styles.inlineText}>{message}</Text>
    </Animated.View>
  );
}

export function ErrorBoundaryFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <ErrorState
      title="Something Went Wrong"
      message={
        error.message || 'An unexpected error occurred in the coach component.'
      }
      errorCode="BOUNDARY_ERROR"
      onRetry={async () => resetError()}
    />
  );
}
