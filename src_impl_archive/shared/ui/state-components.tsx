import React, { useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { useTheme } from "../../theme";
import { useFadeStyle, usePulseStyle, useScaleInStyle, useShakeStyle } from "./state-components.animations";
import { styles } from "./state-components.styles";
import type { DisabledStateProps, EmptyStateProps, ErrorStateProps, LoadingStateProps, SkeletonProps, StateWrapperProps, SuccessStateProps } from "./state-components.types";

export function Skeleton({ variant = "text", count = 1, width, height, circle = false, animated = true, style, testID }: SkeletonProps): JSX.Element {
  const { theme } = useTheme();
  const pulseStyle = usePulseStyle(animated);
  const variantStyles: Record<NonNullable<SkeletonProps["variant"]>, ViewStyle> = {
    card: { width: width ?? "100%", height: height ?? 120, borderRadius: 12 },
    list: { width: width ?? "100%", height: height ?? 60, borderRadius: 8 },
    text: { width: width ?? "80%", height: height ?? 16, borderRadius: 4 },
    avatar: {
      width: width ?? 48,
      height: height ?? 48,
      borderRadius: circle ? 24 : 8,
    },
    chip: { width: width ?? 80, height: height ?? 32, borderRadius: 16 },
  };
  return (
    <View style={[styles.skeletonContainer, style]} testID={testID}>
      {Array.from({ length: count }, (_, index) => (
        <Animated.View key={index} style={[styles.skeletonBase, { backgroundColor: theme.colors.background.tertiary }, variantStyles[variant], { marginBottom: index < count - 1 ? 8 : 0 }, pulseStyle]} />
      ))}
    </View>
  );
}

export function LoadingState({ message = "Loading...", submessage, progress, showProgress = false, size = "large", variant = "spinner", skeletonItems = 3, style, testID }: LoadingStateProps): JSX.Element {
  const { theme } = useTheme();
  const fadeStyle = useFadeStyle(true, 200);
  if (variant === "skeleton") {
    return (
      <Animated.View style={[styles.container, style, fadeStyle]} testID={testID}>
        <Skeleton variant="list" count={skeletonItems} />
      </Animated.View>
    );
  }
  return (
    <Animated.View style={[styles.container, style, fadeStyle]} testID={testID}>
      {variant === "progress" && showProgress && progress !== undefined ? (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.background.tertiary }]}>
            <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: theme.colors.semantic.danger }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.text.disabled }]}>{Math.round(progress)}%</Text>
        </View>
      ) : (
        <ActivityIndicator size={size} color={theme.colors.semantic.danger} style={styles.spinner} />
      )}
      <Text style={[styles.loadingMessage, { color: theme.colors.text.primary }]}>{message}</Text>
      {submessage ? <Text style={[styles.loadingSubmessage, { color: theme.colors.text.disabled }]}>{submessage}</Text> : null}
    </Animated.View>
  );
}

export function EmptyState({ icon = "[ ]", title, subtitle, actionLabel, onAction, secondaryActionLabel, onSecondaryAction, style, testID }: EmptyStateProps): JSX.Element {
  const { theme } = useTheme();
  const fadeStyle = useFadeStyle(true, 300);
  const scaleStyle = useScaleInStyle(0.9);
  return (
    <Animated.View style={[styles.emptyContainer, style, fadeStyle, scaleStyle]} testID={testID}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.emptySubtitle, { color: theme.colors.text.disabled }]}>{subtitle}</Text> : null}
      {actionLabel || secondaryActionLabel ? (
        <View style={styles.emptyActions}>
          {actionLabel && onAction ? (
            <Pressable onPress={onAction} style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.colors.semantic.danger }, pressed && { opacity: 0.8 }]} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
              <Text style={[styles.primaryButtonText, { color: theme.colors.text.inverse }]}>{actionLabel}</Text>
            </Pressable>
          ) : null}
          {secondaryActionLabel && onSecondaryAction ? (
            <Pressable onPress={onSecondaryAction} style={({ pressed }) => [styles.secondaryButton, { backgroundColor: theme.colors.background.tertiary }, pressed && { opacity: 0.8 }]} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text.disabled }]}>{secondaryActionLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
}

const errorBgWithOpacity = (hex: string): string => `${hex}20`;

export function ErrorState({ error, title = "Something went wrong", onRetry, onDismiss, retryLabel = "Try Again", dismissLabel = "Dismiss", showDetails = false, style, testID }: ErrorStateProps): JSX.Element {
  const { theme } = useTheme();
  const fadeStyle = useFadeStyle(true, 300);
  const shakeStyle = useShakeStyle();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorBg = `${theme.colors.error.DEFAULT}20`;
  return (
    <Animated.View style={[styles.errorContainer, style, fadeStyle, shakeStyle]} testID={testID}>
      <View style={[styles.errorIconContainer, { backgroundColor: errorBg }]}>
        <Text style={[styles.errorIcon, { color: theme.colors.error.DEFAULT }]}>!</Text>
      </View>
      <Text style={[styles.errorTitle, { color: theme.colors.text.primary }]}>{title}</Text>
      {showDetails ? <Text style={[styles.errorDetails, { color: theme.colors.text.disabled }]}>{errorMessage}</Text> : null}
      <View style={styles.errorActions}>
        {onRetry ? (
          <Pressable onPress={onRetry} style={({ pressed }) => [styles.retryButton, { backgroundColor: theme.colors.semantic.danger }, pressed && { opacity: 0.8 }]} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
            <Text style={[styles.retryButtonText, { color: theme.colors.text.inverse }]}>{retryLabel}</Text>
          </Pressable>
        ) : null}
        {onDismiss ? (
          <Pressable onPress={onDismiss} style={({ pressed }) => [styles.dismissButton, { backgroundColor: theme.colors.background.tertiary }, pressed && { opacity: 0.8 }]} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
            <Text style={[styles.dismissButtonText, { color: theme.colors.text.disabled }]}>{dismissLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

export function SuccessState({ icon = "OK", title, subtitle, autoDismiss = false, dismissDelay = 3000, onDismiss, actionLabel, onAction, style, testID }: SuccessStateProps): JSX.Element {
  const { theme } = useTheme();
  const fadeStyle = useFadeStyle(true, 200);
  const scaleStyle = useScaleInStyle(0.5);
  useEffect(() => {
    if (!autoDismiss || !onDismiss) {
      return undefined;
    }
    const timer = setTimeout(onDismiss, dismissDelay);
    return () => clearTimeout(timer);
  }, [autoDismiss, dismissDelay, onDismiss]);
  return (
    <Animated.View style={[styles.successContainer, style, fadeStyle, scaleStyle]} testID={testID}>
      <Text style={styles.successIcon}>{icon}</Text>
      <Text style={[styles.successTitle, { color: theme.colors.text.primary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.successSubtitle, { color: theme.colors.text.disabled }]}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => [styles.successButton, { backgroundColor: theme.colors.success.DEFAULT }, pressed && { opacity: 0.8 }]} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
          <Text style={[styles.successButtonText, { color: theme.colors.text.inverse }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

export function DisabledState({ reason, overlay = true, children, style, testID }: DisabledStateProps): JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={[styles.disabledContainer, style]} testID={testID}>
      {children}
      {overlay ? (
        <View style={[styles.disabledOverlay, { backgroundColor: theme.colors.background.overlay }]}>
          {reason ? (
            <View style={[styles.disabledReasonContainer, { backgroundColor: theme.colors.background.tertiary }]}>
              <Text style={[styles.disabledReasonIcon, { color: theme.colors.text.disabled }]}>X</Text>
              <Text style={[styles.disabledReasonText, { color: theme.colors.text.disabled }]}>{reason}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function StateWrapper({ isLoading, isError, error, isEmpty, isSuccess, loadingProps, emptyProps, errorProps, successProps, children, testID }: StateWrapperProps): JSX.Element {
  if (isLoading) {
    return <LoadingState {...loadingProps} testID={`${testID}-loading`} />;
  }
  if (isError && error) {
    return <ErrorState error={error} {...errorProps} testID={`${testID}-error`} />;
  }
  if (isEmpty) {
    return emptyProps?.title ? <EmptyState {...emptyProps} testID={`${testID}-empty`} /> : <>{children}</>;
  }
  if (isSuccess && successProps) {
    return <SuccessState {...successProps} testID={`${testID}-success`} />;
  }
  return <>{children}</>;
}

export default {
  Skeleton,
  LoadingState,
  EmptyState,
  ErrorState,
  SuccessState,
  DisabledState,
  StateWrapper,
};
