import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, Pressable, View, type ViewStyle } from "react-native";
import { createSheet } from "@/shared/ui/create-sheet";


export function Skeleton({
  variant = 'text',
  count = 1,
  width,
  height,
  circle = false,
  animated = true,
  style,
  testID,
}: SkeletonProps) {
  const pulseAnim = usePulseAnimation(animated);
  const baseStyle: ViewStyle & { opacity: Animated.Value } = {
    backgroundColor: '#1e293b',
    opacity: pulseAnim,
  };

  const variantStyles: Record<NonNullable<SkeletonProps['variant']>, ViewStyle> = {
    card: { width: width ?? '100%', height: height ?? 120, borderRadius: 12 },
    list: { width: width ?? '100%', height: height ?? 60, borderRadius: 8 },
    text: { width: width ?? '80%', height: height ?? 16, borderRadius: 4 },
    avatar: { width: width ?? 48, height: height ?? 48, borderRadius: circle ? 24 : 8 },
    chip: { width: width ?? 80, height: height ?? 32, borderRadius: 16 },
  };

  return (
    <View style={[styles.skeletonContainer, style]} testID={testID}>
      {Array.from({ length: count }, (_, index) => (
        <Animated.View
          key={index}
          style={[
            baseStyle,
            variantStyles[variant],
            { marginBottom: index < count - 1 ? 8 : 0 },
          ]}
        />
      ))}
    </View>
  );
}

export function LoadingState({
  message = 'Loading...',
  submessage,
  progress,
  showProgress = false,
  size = 'large',
  variant = 'spinner',
  skeletonItems = 3,
  style,
  testID,
}: LoadingStateProps) {
  const fadeAnim = useFadeAnimation(true, 200);

  if (variant === 'skeleton') {
    return (
      <Animated.View style={[styles.container, style, { opacity: fadeAnim }]} testID={testID}>
        <Skeleton variant="list" count={skeletonItems} />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeAnim }]} testID={testID}>
      {variant === 'progress' && showProgress && progress !== undefined ? (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, Math.max(0, progress))}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      ) : (
        <ActivityIndicator size={size} color="#e94560" style={styles.spinner} />
      )}

      <Text style={styles.loadingMessage}>{message}</Text>
      {submessage ? <Text style={styles.loadingSubmessage}>{submessage}</Text> : null}
    </Animated.View>
  );
}

export function EmptyState({
  icon = '[ ]',
  title,
  subtitle,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
  testID,
}: EmptyStateProps) {
  const fadeAnim = useFadeAnimation(true, 300);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[styles.emptyContainer, style, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      testID={testID}
    >
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}

      {actionLabel || secondaryActionLabel ? (
        <View style={styles.emptyActions}>
          {actionLabel && onAction ? (
            <Pressable onPress={onAction} style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.8 }]}
              accessibilityLabel="Interactive control"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
              <Text style={styles.primaryButtonText}>{actionLabel}</Text>
            </Pressable>
          ) : null}

          {secondaryActionLabel && onSecondaryAction ? (
            <Pressable onPress={onSecondaryAction} style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.8 }]}
              accessibilityLabel="Interactive control"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
              <Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
}

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
}: ErrorStateProps) {
  const fadeAnim = useFadeAnimation(true, 300);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <Animated.View
      style={[
        styles.errorContainer,
        style,
        { opacity: fadeAnim, transform: [{ translateX: shakeAnim }] },
      ]}
      testID={testID}
    >
      <View style={styles.errorIconContainer}>
        <Text style={styles.errorIcon}>!</Text>
      </View>

      <Text style={styles.errorTitle}>{title}</Text>
      {showDetails ? <Text style={styles.errorDetails}>{errorMessage}</Text> : null}

      <View style={styles.errorActions}>
        {onRetry ? (
          <Pressable onPress={onRetry} style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.8 }]}
            accessibilityLabel="Interactive control"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
            <Text style={styles.retryButtonText}>{retryLabel}</Text>
          </Pressable>
        ) : null}

        {onDismiss ? (
          <Pressable onPress={onDismiss} style={({ pressed }) => [styles.dismissButton, pressed && { opacity: 0.8 }]}
            accessibilityLabel="Interactive control"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
            <Text style={styles.dismissButtonText}>{dismissLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}