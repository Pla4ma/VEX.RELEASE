/**
 * Extraction Progress Component
 * Shows processing status with animated progress and stage indicators
 */

import React, { useEffect, useRef } from "react";
import { View, Animated, Pressable } from "react-native";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { useTheme } from "../../../theme";
import { Icon } from "../../../icons";
import type { ExtractionProgressProps } from "../types";
import { CONTENT_STATUS_CONFIG } from "../constants";
import { createSheet } from "@/shared/ui/create-sheet";

const STAGES = [
  { key: "uploading", label: "Uploading", icon: "upload-cloud" },
  { key: "processing", label: "Processing", icon: "loader" },
  { key: "extracting", label: "Extracting", icon: "file-text" },
  { key: "analyzing", label: "Analyzing", icon: "search" },
  { key: "complete", label: "Complete", icon: "check-circle" },
  { key: "failed", label: "Failed", icon: "alert-circle" },
] as const;

export const ExtractionProgress: React.FC<ExtractionProgressProps> = ({ stage, progress, contentType, estimatedTimeRemaining, onCancel, error, onRetry }) => {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for active stage
  useEffect(() => {
    if (stage === "failed" || stage === "complete") {
      return;
    }

    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    const loop = Animated.loop(pulse);
    loop.start();

    return () => loop.stop();
  }, [stage, pulseAnim]);

  // Progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const currentStageIndex = STAGES.findIndex((s) => s.key === stage);
  const isFailed = stage === "failed";
  const isComplete = stage === "complete";

  const formatTime = (seconds?: number): string => {
    if (!seconds || seconds < 0) {
      return "";
    }
    if (seconds < 60) {
      return `${seconds}s remaining`;
    }
    const mins = Math.ceil(seconds / 60);
    return `${mins} min remaining`;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isFailed ? theme.colors.error[50] : isComplete ? theme.colors.success[50] : theme.colors.background.secondary,
          borderColor: isFailed ? theme.colors.error[500] : isComplete ? theme.colors.success[500] : theme.colors.border.DEFAULT,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
          >
            <Icon name={STAGES[currentStageIndex]?.icon || "loader"} size="lg" color={isFailed ? theme.colors.error[500] : isComplete ? theme.colors.success[500] : theme.colors.primary[500]} />
          </Animated.View>
        </View>
        <View style={styles.statusText}>
          <Text
            style={[
              styles.stageLabel,
              {
                color: isFailed ? theme.colors.error[500] : theme.colors.text.primary,
              },
            ]}
          >
            {isFailed ? "Extraction Failed" : isComplete ? "Extraction Complete" : STAGES[currentStageIndex]?.label || "Processing"}
          </Text>
          {!isFailed && !isComplete && estimatedTimeRemaining !== undefined && <Text style={[styles.timeLabel, { color: theme.colors.text.muted }]}>{formatTime(estimatedTimeRemaining)}</Text>}
        </View>
      </View>

      {/* Progress Bar */}
      {!isFailed && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.background.primary }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: isComplete ? theme.colors.success[500] : theme.colors.primary[500],
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.text.muted }]}>{Math.round(progress)}%</Text>
        </View>
      )}

      {/* Stage Indicators */}
      <View style={styles.stagesContainer}>
        {STAGES.slice(0, -2).map((s, index) => {
          const isActive = index === currentStageIndex;
          const isPast = index < currentStageIndex;
          const isFuture = index > currentStageIndex;

          return (
            <View key={s.key} style={styles.stageIndicator}>
              <View
                style={[
                  styles.stageDot,
                  {
                    backgroundColor: isPast ? theme.colors.success[500] : isActive ? theme.colors.primary[500] : theme.colors.border.DEFAULT,
                  },
                ]}
              >
                {isPast && <Icon name="check" size="xs" color={theme.colors.background.primary} />}
              </View>
              <Text
                style={[
                  styles.stageName,
                  {
                    color: isActive ? theme.colors.primary[500] : isPast ? theme.colors.text.primary : theme.colors.text.muted,
                  },
                ]}
              >
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: theme.colors.error[500] }]}>{error.message}</Text>
          {error.details && <Text style={[styles.errorDetails, { color: theme.colors.text.muted }]}>{JSON.stringify(error.details)}</Text>}
          {onRetry && (
            <Button variant="primary" size="sm" onPress={onRetry} style={styles.retryButton} accessibilityLabel="Retry Extraction button" accessibilityRole="button" accessibilityHint="Activates this control">
              Retry Extraction
            </Button>
          )}
        </View>
      )}

      {/* Cancel Button */}
      {!isFailed && !isComplete && onCancel && (
        <Pressable onPress={onCancel} style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.8 }]} accessibilityLabel="Cancel button" accessibilityRole="button" accessibilityHint="Activates this control">
          <Text style={[styles.cancelText, { color: theme.colors.text.muted }]}>Cancel</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = createSheet({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    flex: 1,
    gap: 2,
  },
  stageLabel: {
    fontSize: 17,
    fontWeight: "600",
  },
  timeLabel: {
    fontSize: 13,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "500",
    minWidth: 40,
    textAlign: "right",
  },
  stagesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  stageIndicator: {
    alignItems: "center",
    gap: 6,
  },
  stageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  stageName: {
    fontSize: 11,
  },
  errorContainer: {
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorDetails: {
    fontSize: 12,
  },
  retryButton: {
    alignSelf: "flex-start",
  },
  cancelButton: {
    alignSelf: "center",
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 14,
  },
});
