import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, Modal, ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from "react-native-reanimated";
import { useFadeIn } from "../hooks/useReanimated";
import { Skeleton, SkeletonCard, SkeletonList } from "./Skeleton";
import { createSheet } from "@/shared/ui/create-sheet";


export function LoadingOverlay({
  visible,
  message = 'Loading...',
  progress,
  showProgress = false,
  blur = true,
  style,
}: LoadingOverlayProps) {
  const fadeStyle = useFadeIn(300);
  const pulseStyle = usePulseAnimation();

  if (!visible) {return null;}

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.container,
          blur && styles.blurBackground,
          fadeStyle,
          style,
        ]}
      >
        <View style={styles.content}>
          <Animated.View style={pulseStyle}>
            <ActivityIndicator size="large" color="theme.colors.primary[500]" />
          </Animated.View>

          <Text style={styles.message}>{message}</Text>

          {showProgress && progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, Math.max(0, progress))}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

export function SectionLoading({
  type = 'card',
  count = 3,
  style,
}: SectionLoadingProps) {
  switch (type) {
    case 'text':
      return (
        <View style={[styles.sectionContainer, style]}>
          <Skeleton lines={count} height={16} spacing={8} />
        </View>
      );
    case 'card':
      return (
        <View style={[styles.sectionContainer, style]}>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} style={styles.sectionItem} />
          ))}
        </View>
      );
    case 'chart':
      return (
        <View style={[styles.sectionContainer, style]}>
          <Skeleton variant="rounded" height={200} />
        </View>
      );
    case 'list':
      return (
        <View style={[styles.sectionContainer, style]}>
          <SkeletonList count={count} />
        </View>
      );
    default:
      return null;
  }
}

export function ProgressIndicator({
  progress,
  message = 'Processing...',
  submessage,
  style,
}: ProgressIndicatorProps) {
  const fadeStyle = useFadeIn(300);

  return (
    <Animated.View style={[styles.progressOverlay, style, fadeStyle]}>
      <View style={styles.progressContent}>
        <View style={styles.progressBarLarge}>
          <Animated.View
            style={[
              styles.progressFillLarge,
              { width: `${Math.min(100, Math.max(0, progress))}%` },
            ]}
          />
        </View>

        <Text style={styles.progressMessage}>{message}</Text>
        {submessage && (
          <Text style={styles.progressSubmessage}>{submessage}</Text>
        )}

        <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
      </View>
    </Animated.View>
  );
}

export function ButtonLoading({ loading, children }: ButtonLoadingProps) {
  if (!loading) {return <>{children}</>;}

  return (
    <View style={styles.buttonLoading}>
      <ActivityIndicator size="small" color="theme.colors.primary[500]" />
      <Text style={styles.buttonLoadingText}>Processing...</Text>
    </View>
  );
}