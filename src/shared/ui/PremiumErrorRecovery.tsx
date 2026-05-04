/**
 * Premium Error Recovery Component
 *
 * Beautiful error states with smart retry logic and user-friendly messaging.
 * Transforms error moments into trust-building opportunities.
 *
 * Features:
 * - Animated error illustrations
 * - Smart retry with exponential backoff
 * - Context-aware error messages (VEX Voice)
 * - Fallback UI for critical paths
 * - Auto-recovery detection
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/theme';
import { haptics } from '@/shared/feedback';
import { createSheet } from '@/shared/ui/create-sheet';
import * as Sentry from '@sentry/react-native';

// ============================================================================
// Types
// ============================================================================

interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

interface PremiumErrorRecoveryProps {
  error: Error | string;
  context?: 'session' | 'purchase' | 'sync' | 'network' | 'general';
  onRetry?: () => Promise<void>;
  onFallback?: () => void;
  onDismiss?: () => void;
  retryConfig?: Partial<RetryConfig>;
  canFallback?: boolean;
  autoRetry?: boolean;
}

interface ErrorState {
  message: string;
  wittyMessage: string;
  icon: string;
  severity: 'low' | 'medium' | 'high';
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

// VEX Voice error messages by context
const ERROR_MESSAGES: Record<string, ErrorState> = {
  session: {
    message: 'Session sync failed',
    wittyMessage: 'The digital realm is experiencing turbulence. Your focus remains intact.',
    icon: '⚡',
    severity: 'medium',
  },
  purchase: {
    message: 'Purchase processing delayed',
    wittyMessage: 'The treasure chest is stuck. Our gnomes are working on it.',
    icon: '💎',
    severity: 'high',
  },
  sync: {
    message: 'Data sync incomplete',
    wittyMessage: 'Your progress is safe on this device. We\'ll sync when the stars align.',
    icon: '📡',
    severity: 'low',
  },
  network: {
    message: 'Connection interrupted',
    wittyMessage: 'The connection elves are on a coffee break. They\'ll return.',
    icon: '🌐',
    severity: 'medium',
  },
  general: {
    message: 'Something went wrong',
    wittyMessage: 'Even the ancient algorithms need a moment sometimes.',
    icon: '🔮',
    severity: 'medium',
  },
};

// ============================================================================
// Component
// ============================================================================

export const PremiumErrorRecovery: React.FC<PremiumErrorRecoveryProps> = ({
  error,
  context = 'general',
  onRetry,
  onFallback,
  onDismiss,
  retryConfig: customRetryConfig,
  canFallback = true,
  autoRetry = false,
}) => {
  const { theme } = useTheme();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [nextRetryIn, setNextRetryIn] = useState<number | null>(null);
  const [isResolved, setIsResolved] = useState(false);

  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...customRetryConfig };
  const errorState = ERROR_MESSAGES[context] || ERROR_MESSAGES.general;

  // Animation values
  const [shakeAnimation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(1));
  const [scaleAnimation] = useState(new Animated.Value(1));

  // Calculate retry delay
  const getRetryDelay = useCallback(() => {
    const delay = Math.min(
      retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, retryCount),
      retryConfig.maxDelay
    );
    return delay;
  }, [retryCount, retryConfig]);

  // Shake animation for errors
  useEffect(() => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Auto-retry countdown
  useEffect(() => {
    if (autoRetry && retryCount < retryConfig.maxAttempts && !isResolved) {
      const delay = getRetryDelay();
      setNextRetryIn(delay);

      const interval = setInterval(() => {
        setNextRetryIn(prev => {
          if (prev === null || prev <= 1000) {
            clearInterval(interval);
            handleRetry();
            return null;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRetry, retryCount, retryConfig.maxAttempts, isResolved, getRetryDelay]);

  // Handle retry
  const handleRetry = useCallback(async () => {
    if (isRetrying || retryCount >= retryConfig.maxAttempts) {
      return;
    }

    setIsRetrying(true);
    haptics.impact('medium');

    // Pulse animation
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      if (onRetry) {
        await onRetry();
      }

      // Success! Fade out
      setIsResolved(true);
      haptics.success('medium');

      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (onDismiss) {
          onDismiss();
        }
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'error-recovery', operation: 'retry' },
      });
      setRetryCount(prev => prev + 1);
      haptics.error('light');
    } finally {
      setIsRetrying(false);
      setNextRetryIn(null);
    }
  }, [isRetrying, retryCount, retryConfig.maxAttempts, onRetry, onDismiss, scaleAnimation, fadeAnimation]);

  // Handle fallback
  const handleFallback = useCallback(() => {
    haptics.selection();
    if (onFallback) {
      onFallback();
    }
  }, [onFallback]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    haptics.selection();
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);

  // Format error message
  const getErrorMessage = () => {
    if (typeof error === 'string') {
      return error;
    }
    return error.message || errorState.message;
  };

  // Get severity color
  const getSeverityColor = () => {
    switch (errorState.severity) {
      case 'high':
        return theme.colors.error.DEFAULT;
      case 'medium':
        return theme.colors.warning.DEFAULT;
      case 'low':
        return theme.colors.info.DEFAULT;
    }
  };

  if (isResolved) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnimation }]}>
        <View style={[styles.successCard, { backgroundColor: theme.colors.success[50] }]}>
          <Text style={[styles.successIcon, { color: theme.colors.success.DEFAULT }]}>✓</Text>
          <Text style={[styles.successText, { color: theme.colors.success.DEFAULT }]}>
            Problem solved! Back to your journey.
          </Text>
        </View>
      </Animated.View>
    );
  }

  const hasMoreRetries = retryCount < retryConfig.maxAttempts;
  const severityColor = getSeverityColor();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: shakeAnimation },
            { scale: scaleAnimation },
          ],
        },
      ]}
    >
      <View style={[styles.card, { backgroundColor: theme.colors.surface.card }]}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${severityColor}20` }]}>
          <Text style={styles.icon}>{errorState.icon}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.wittyMessage, { color: theme.colors.text.primary }]}>
            {errorState.wittyMessage}
          </Text>

          <Text style={[styles.errorDetail, { color: theme.colors.text.secondary }]}>
            {getErrorMessage()}
          </Text>

          {/* Retry Status */}
          {retryCount > 0 && (
            <Text style={[styles.retryStatus, { color: theme.colors.text.muted }]}>
              Attempt {retryCount} of {retryConfig.maxAttempts}
            </Text>
          )}

          {nextRetryIn && (
            <Text style={[styles.countdown, { color: theme.colors.text.muted }]}>
              Retrying in {Math.ceil(nextRetryIn / 1000)}s...
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {hasMoreRetries && onRetry && (
            <Pressable
              style={({ pressed }) => [styles.retryButton, { backgroundColor: severityColor }, pressed && { opacity: 0.8 }]}
              onPress={handleRetry}
              disabled={isRetrying}
              accessibilityLabel="Try Again button"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
              {isRetrying ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.retryButtonText}>
                  {retryCount > 0 ? 'Try Again' : 'Retry Now'}
                </Text>
              )}
            </Pressable>
          )}

          {canFallback && onFallback && (
            <Pressable
              style={({ pressed }) => [styles.fallbackButton, { borderColor: theme.colors.border.DEFAULT }, pressed && { opacity: 0.8 }]}
              onPress={handleFallback}
              accessibilityLabel="Work Offline button"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
              <Text style={[styles.fallbackText, { color: theme.colors.text.secondary }]}>
                Work Offline
              </Text>
            </Pressable>
          )}

          {onDismiss && (
            <Pressable onPress={handleDismiss} style={({ pressed }) => [styles.dismissButton, pressed && { opacity: 0.8 }]}
              accessibilityLabel="Dismiss button"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
              <Text style={[styles.dismissText, { color: theme.colors.text.muted }]}>
                Dismiss
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = createSheet({
  container: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 30,
  },
  content: {
    alignItems: 'center',
    marginBottom: 20,
  },
  wittyMessage: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  errorDetail: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  countdown: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  actions: {
    gap: 10,
  },
  retryButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  fallbackButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  fallbackText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 13,
  },
  successCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 12,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});

export default PremiumErrorRecovery;
