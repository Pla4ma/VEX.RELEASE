import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { haptics } from '@/shared/feedback';
import { createSheet } from '@/shared/ui/create-sheet';
import * as Sentry from '@sentry/react-native';
import { launchColors } from '@theme/tokens/launch-colors';

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

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

const ERROR_MESSAGES: Record<string, ErrorState> = {
  session: {
    message: 'Session sync failed',
    wittyMessage: 'The digital realm is experiencing turbulence. Your focus remains intact.',
    icon: '\u26A1',
    severity: 'medium',
  },
  purchase: {
    message: 'Purchase processing delayed',
    wittyMessage: "The treasure chest is stuck. Our gnomes are working on it.",
    icon: '\uD83D\uDC8E',
    severity: 'high',
  },
  sync: {
    message: 'Data sync incomplete',
    wittyMessage: "Your progress is safe on this device. We'll sync when the stars align.",
    icon: '\uD83D\uDCE1',
    severity: 'low',
  },
  network: {
    message: 'Connection interrupted',
    wittyMessage: "The connection elves are on a coffee break. They'll return.",
    icon: '\uD83C\uDF10',
    severity: 'medium',
  },
  general: {
    message: 'Something went wrong',
    wittyMessage: 'Even the ancient algorithms need a moment sometimes.',
    icon: '\uD83D\uDD2E',
    severity: 'medium',
  },
};

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
  const retryConfig = useMemo(() => ({ ...DEFAULT_RETRY_CONFIG, ...customRetryConfig }), [customRetryConfig]);
  const errorState = ERROR_MESSAGES[context] ?? ERROR_MESSAGES.general!;

  const shakeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }, { scale: scaleAnim.value }],
  }));

  const triggerShake = useCallback(() => {
    shakeAnim.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [shakeAnim]);

  const getErrorMessage = (): string => {
    if (typeof error === 'string') return error;
    return error.message || errorState.message;
  };

  const getSeverityColor = (): string => {
    switch (errorState.severity) {
      case 'high': return theme.colors.error.DEFAULT;
      case 'medium': return theme.colors.warning.DEFAULT;
      case 'low': return theme.colors.primary[500];
    }
  };

  const handleRetry = useCallback(async () => {
    if (isRetrying || !onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
      setIsResolved(true);
      scaleAnim.value = withSpring(1.05, {}, () => { scaleAnim.value = withTiming(1); });
    } catch (retryError) {
      const newCount = retryCount + 1;
      setRetryCount(newCount);
      triggerShake();
      if (newCount < retryConfig.maxAttempts) {
        const delay = Math.min(retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, newCount), retryConfig.maxDelay);
        setNextRetryIn(delay);
        setTimeout(() => {
          setNextRetryIn(null);
          if (autoRetry) handleRetry();
        }, delay);
      }
      Sentry.captureException(retryError instanceof Error ? retryError : new Error(String(retryError)), {
        tags: { feature: 'premium-error-recovery', context, retryCount: String(newCount) },
      });
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, onRetry, retryCount, retryConfig, triggerShake, scaleAnim, autoRetry, context]);

  const handleFallback = useCallback(() => {
    onFallback?.();
  }, [onFallback]);

  const handleDismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    if (autoRetry && onRetry && retryCount === 0) {
      handleRetry();
    }
  }, [autoRetry, onRetry, retryCount, handleRetry]);

  if (isResolved) {
    return (
      <Animated.View style={animatedStyle}>
        <View style={[styles.successCard, { backgroundColor: theme.colors.success[50] }]}>
          <Text style={[styles.successIcon, { color: theme.colors.success.DEFAULT }]}>{'\u2713'}</Text>
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
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface.card }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${severityColor}20` }]}>
          <Text style={styles.icon}>{errorState.icon}</Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.wittyMessage, { color: theme.colors.text.primary }]}>
            {errorState.wittyMessage}
          </Text>
          <Text style={[styles.errorDetail, { color: theme.colors.text.secondary }]}>
            {getErrorMessage()}
          </Text>
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

        <View style={styles.actions}>
          {hasMoreRetries && onRetry && (
            <Pressable
              style={({ pressed }) => [styles.retryButton, { backgroundColor: severityColor }, pressed && { opacity: 0.8 }]}
              onPress={handleRetry}
              disabled={isRetrying}
              accessibilityLabel="Try Again"
              accessibilityRole="button"
              accessibilityHint="Retries the failed operation"
            >
              {isRetrying ? (
                <ActivityIndicator size="small" color={launchColors.hex_fff} />
              ) : (
                <Text style={styles.retryButtonText}>{retryCount > 0 ? 'Try Again' : 'Retry Now'}</Text>
              )}
            </Pressable>
          )}

          {canFallback && onFallback && (
            <Pressable
              style={({ pressed }) => [styles.fallbackButton, { borderColor: theme.colors.border.DEFAULT }, pressed && { opacity: 0.8 }]}
              onPress={handleFallback}
              accessibilityLabel="Work Offline"
              accessibilityRole="button"
              accessibilityHint="Continues working in offline mode"
            >
              <Text style={[styles.fallbackText, { color: theme.colors.text.secondary }]}>
                Work Offline
              </Text>
            </Pressable>
          )}

          {onDismiss && (
            <Pressable
              onPress={handleDismiss}
              style={({ pressed }) => [styles.dismissButton, pressed && { opacity: 0.8 }]}
              accessibilityLabel="Dismiss"
              accessibilityRole="button"
              accessibilityHint="Dismisses this error message"
            >
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

const styles = createSheet({
  container: { padding: 16 },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: launchColors.hex_000,
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
  icon: { fontSize: 30 },
  content: { alignItems: 'center', marginBottom: 20 },
  wittyMessage: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 8, lineHeight: 22 },
  errorDetail: { fontSize: 13, textAlign: 'center', marginBottom: 8 },
  retryStatus: { fontSize: 12, marginTop: 4 },
  countdown: { fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  actions: { gap: 10 },
  retryButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  retryButtonText: { color: launchColors.hex_fff, fontSize: 15, fontWeight: '700' },
  fallbackButton: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  fallbackText: { fontSize: 14, fontWeight: '600' },
  dismissButton: { paddingVertical: 8, alignItems: 'center' },
  dismissText: { fontSize: 13 },
  successCard: { borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' },
  successIcon: { fontSize: 20, fontWeight: '700', marginRight: 12 },
  successText: { fontSize: 14, fontWeight: '600', flex: 1 },
});

export default PremiumErrorRecovery;
