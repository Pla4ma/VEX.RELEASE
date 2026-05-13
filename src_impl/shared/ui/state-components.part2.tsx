import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, Pressable, View, type ViewStyle } from "react-native";
import { createSheet } from "@/shared/ui/create-sheet";


export function SuccessState({
  icon = 'OK',
  title,
  subtitle,
  autoDismiss = false,
  dismissDelay = 3000,
  onDismiss,
  actionLabel,
  onAction,
  style,
  testID,
}: SuccessStateProps) {
  const fadeAnim = useFadeAnimation(true, 200);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();

    if (autoDismiss && onDismiss) {
      const timer = setTimeout(onDismiss, dismissDelay);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [autoDismiss, dismissDelay, onDismiss, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.successContainer,
        style,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
      testID={testID}
    >
      <Text style={styles.successIcon}>{icon}</Text>
      <Text style={styles.successTitle}>{title}</Text>
      {subtitle ? <Text style={styles.successSubtitle}>{subtitle}</Text> : null}

      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => [styles.successButton, pressed && { opacity: 0.8 }]}
          accessibilityLabel="Interactive control"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
          <Text style={styles.successButtonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

export function DisabledState({
  reason,
  overlay = true,
  children,
  style,
  testID,
}: DisabledStateProps) {
  return (
    <View style={[styles.disabledContainer, style]} testID={testID}>
      {children}
      {overlay ? (
        <View style={styles.disabledOverlay}>
          {reason ? (
            <View style={styles.disabledReasonContainer}>
              <Text style={styles.disabledReasonIcon}>X</Text>
              <Text style={styles.disabledReasonText}>{reason}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function StateWrapper({
  isLoading,
  isError,
  error,
  isEmpty,
  isSuccess,
  loadingProps,
  emptyProps,
  errorProps,
  successProps,
  children,
  testID,
}: StateWrapperProps) {
  if (isLoading) {
    return <LoadingState {...loadingProps} testID={`${testID}-loading`} />;
  }

  if (isError && error) {
    return <ErrorState error={error} {...errorProps} testID={`${testID}-error`} />;
  }

  if (isEmpty) {
    if (emptyProps?.title) {
      return <EmptyState {...emptyProps} testID={`${testID}-empty`} />;
    }

    return <>{children}</>;
  }

  if (isSuccess && successProps) {
    return <SuccessState {...successProps} testID={`${testID}-success`} />;
  }

  return <>{children}</>;
}