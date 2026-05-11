import { captureSilentFailure } from '../../../../utils/silent-failure';
/**
 * Error State Components
 *
 * Premium error states with recovery actions and retry logic
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { Keyframe, FadeIn } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

// Custom shake animation keyframe
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

export function ErrorState({ title = 'Oops! Something went wrong', message, errorCode, onRetry, onDismiss, retryAttempts = 0, maxRetries = 3 }: ErrorStateProps) {
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
      captureSilentFailure(error, { feature: 'ai-coach', operation: 'ui-fallback', type: 'ui' });
      setLocalAttempts((prev) => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  };

  const canRetry = localAttempts < maxRetries && !!onRetry;
  const isDegraded = localAttempts > 0;

  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.container, isDegraded && styles.degradedContainer]}>
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
          <Pressable onPress={handleRetry} disabled={isRetrying} style={[styles.retryButton, isRetrying && styles.buttonDisabled]} accessibilityLabel="Retry loading" accessibilityRole="button" accessibilityHint="Activates this control">
            {isRetrying ? <ActivityIndicator color="#fff" /> : <Text style={styles.retryButtonText}>{isDegraded ? 'Try Again' : 'Retry'}</Text>}
          </Pressable>
        )}

        {!canRetry && onDismiss && (
          <Pressable onPress={onDismiss} style={styles.dismissButton} accessibilityLabel="Dismiss error" accessibilityRole="button" accessibilityHint="Activates this control">
            <Text style={styles.dismissButtonText}>Dismiss</Text>
          </Pressable>
        )}

        {localAttempts >= maxRetries && <Text style={styles.maxRetriesText}>Max retry attempts reached. Please try again later.</Text>}
      </View>

      {isDegraded && (
        <View style={styles.degradedBadge}>
          <Text style={styles.degradedBadgeText}>Degraded Mode</Text>
        </View>
      )}
    </Animated.View>
  );
}

// Specific error states
export function NetworkErrorState({ onRetry }: { onRetry?: () => Promise<void> }) {
  return <ErrorState title="Connection Lost" message="Unable to connect to the server. Please check your internet connection and try again." errorCode="NETWORK_ERROR" onRetry={onRetry} />;
}

export function TimeoutErrorState({ onRetry }: { onRetry?: () => Promise<void> }) {
  return <ErrorState title="Request Timed Out" message="The server is taking too long to respond. This might be due to high traffic or a slow connection." errorCode="TIMEOUT" onRetry={onRetry} />;
}

export function ServerErrorState({ onRetry }: { onRetry?: () => Promise<void> }) {
  return <ErrorState title="Server Error" message="We're experiencing technical difficulties. Our team has been notified and is working on a fix." errorCode="SERVER_ERROR" onRetry={onRetry} />;
}

export function ValidationErrorState({ field, onDismiss }: { field?: string; onDismiss?: () => void }) {
  return <ErrorState title="Invalid Input" message={field ? `Please check the ${field} field and try again.` : "Some of the information provided doesn't look right. Please review and try again."} errorCode="VALIDATION_ERROR" onDismiss={onDismiss} />;
}

export function NotFoundErrorState({ resource = 'item', onDismiss }: { resource?: string; onDismiss?: () => void }) {
  return <ErrorState title="Not Found" message={`The ${resource} you're looking for doesn't exist or has been removed.`} errorCode="NOT_FOUND" onDismiss={onDismiss} />;
}

export function PermissionErrorState({ onDismiss }: { onDismiss?: () => void }) {
  return <ErrorState title="Access Denied" message="You don't have permission to access this feature. Please check your account settings." errorCode="FORBIDDEN" onDismiss={onDismiss} />;
}

export function RateLimitErrorState({ retryAfter }: { retryAfter?: number }) {
  return <ErrorState title="Too Many Requests" message={`You've made too many requests. Please wait ${retryAfter ? `${retryAfter} seconds` : 'a moment'} before trying again.`} errorCode="RATE_LIMIT" />;
}

// Inline error for form fields
export function InlineError({ message }: { message: string }) {
  return (
    <Animated.View entering={Shake.duration(400)} style={styles.inlineContainer}>
      <Text style={styles.inlineIcon}>⚠️</Text>
      <Text style={styles.inlineText}>{message}</Text>
    </Animated.View>
  );
}

// Error boundary fallback
export function ErrorBoundaryFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return <ErrorState title="Something Went Wrong" message={error.message || 'An unexpected error occurred in the coach component.'} errorCode="BOUNDARY_ERROR" onRetry={async () => resetError()} />;
}

const styles = createSheet({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
  },
  degradedContainer: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFD54F',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  errorCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  errorCodeLabel: {
    fontSize: 12,
    color: '#999',
  },
  errorCode: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attemptsText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  actions: {
    gap: 8,
    width: '100%',
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  dismissButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  maxRetriesText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  degradedBadge: {
    backgroundColor: '#FFD54F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  degradedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
    marginTop: 4,
  },
  inlineIcon: {
    fontSize: 14,
  },
  inlineText: {
    fontSize: 12,
    color: '#C62828',
    flex: 1,
  },
});
