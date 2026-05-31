import React from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import * as Sentry from '@sentry/react-native';
import { styles } from './PremiumErrorRecovery.styles';
import {
  type PremiumErrorRecoveryProps,
  DEFAULT_RETRY_CONFIG,
  ERROR_MESSAGES,
} from './PremiumErrorRecovery-helpers';
import { ResolvedSuccessCard } from './ResolvedSuccessCard';
import { ErrorActionButtons } from './ErrorActionButtons';

const SEVERITY_KEYS = ['high', 'medium', 'low'] as const;

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
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const [nextRetryIn, setNextRetryIn] = React.useState<number | null>(null);
  const [isResolved, setIsResolved] = React.useState(false);
  const retryConfig = React.useMemo(
    () => ({ ...DEFAULT_RETRY_CONFIG, ...customRetryConfig }),
    [customRetryConfig],
  );
  const errorState = ERROR_MESSAGES[context] ?? ERROR_MESSAGES.general!;
  const errorMessage =
    typeof error === 'string' ? error : error.message || errorState.message;

  const shakeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }, { scale: scaleAnim.value }],
  }));

  const triggerShake = React.useCallback(() => {
    shakeAnim.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [shakeAnim]);

  const severityColor = React.useMemo(() => {
    const map: Record<string, string> = {
      high: theme.colors.error.DEFAULT,
      medium: theme.colors.warning.DEFAULT,
      low: theme.colors.primary[500],
    };
    return map[errorState.severity] ?? theme.colors.primary[500];
  }, [errorState.severity, theme]);

  const handleRetry = React.useCallback(async () => {
    if (isRetrying || !onRetry) {return;}
    setIsRetrying(true);
    try {
      await onRetry();
      setIsResolved(true);
      scaleAnim.value = withSpring(1.05, {}, () => {
        scaleAnim.value = withTiming(1);
      });
    } catch (retryError) {
      const newCount = retryCount + 1;
      setRetryCount(newCount);
      triggerShake();
      if (newCount < retryConfig.maxAttempts) {
        const delay = Math.min(
          retryConfig.baseDelay *
            Math.pow(retryConfig.backoffMultiplier, newCount),
          retryConfig.maxDelay,
        );
        setNextRetryIn(delay);
        setTimeout(() => {
          setNextRetryIn(null);
          if (autoRetry) {handleRetry();}
        }, delay);
      }
      Sentry.captureException(
        retryError instanceof Error
          ? retryError
          : new Error(String(retryError)),
        {
          tags: {
            feature: 'premium-error-recovery',
            context,
            retryCount: String(newCount),
          },
        },
      );
    } finally {
      setIsRetrying(false);
    }
  }, [
    isRetrying, onRetry, retryCount, retryConfig,
    triggerShake, scaleAnim, autoRetry, context,
  ]);

  React.useEffect(() => {
    if (autoRetry && onRetry && retryCount === 0) {
      handleRetry();
    }
  }, [autoRetry, onRetry, retryCount, handleRetry]);

  if (isResolved) {
    return (
      <ResolvedSuccessCard
        animatedStyle={animatedStyle}
        successBg={theme.colors.success[50]}
        successColor={theme.colors.success.DEFAULT}
      />
    );
  }

  const hasMoreRetries = retryCount < retryConfig.maxAttempts;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View
        style={[styles.card, { backgroundColor: theme.colors.surface.card }]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${severityColor}20` },
          ]}
        >
          <Text style={styles.icon}>{errorState.icon}</Text>
        </View>

        <View style={styles.content}>
          <Text
            style={[styles.wittyMessage, { color: theme.colors.text.primary }]}
          >
            {errorState.wittyMessage}
          </Text>
          <Text
            style={[styles.errorDetail, { color: theme.colors.text.secondary }]}
          >
            {errorMessage}
          </Text>
          {retryCount > 0 && (
            <Text
              style={[styles.retryStatus, { color: theme.colors.text.muted }]}
            >
              Attempt {retryCount} of {retryConfig.maxAttempts}
            </Text>
          )}
          {nextRetryIn && (
            <Text
              style={[styles.countdown, { color: theme.colors.text.muted }]}
            >
              Retrying in {Math.ceil(nextRetryIn / 1000)}s...
            </Text>
          )}
        </View>

        <ErrorActionButtons
          hasMoreRetries={hasMoreRetries}
          onRetry={onRetry}
          isRetrying={isRetrying}
          retryCount={retryCount}
          handleRetry={handleRetry}
          severityColor={severityColor}
          canFallback={canFallback}
          onFallback={onFallback}
          handleFallback={() => onFallback?.()}
          onDismiss={onDismiss}
          handleDismiss={() => onDismiss?.()}
          borderColor={theme.colors.border.DEFAULT}
          mutedColor={theme.colors.text.muted}
          secondaryColor={theme.colors.text.secondary}
        />
      </View>
    </Animated.View>
  );
};

export default PremiumErrorRecovery;
