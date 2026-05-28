import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { launchColors } from "@theme/tokens/launch-colors";
import {
  type ExportProgressProps,
  STATUS_CONFIG,
  formatDate,
  formatFileSize,
} from "./export-progress-helpers";
import { styles } from "./ExportProgress.styles";

export function ExportProgress({
  job,
  onDownload,
  onCancel,
  onRetry,
}: ExportProgressProps) {
  const status = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.pending;
  const isActive = job.status === "pending" || job.status === "processing";
  const isComplete = job.status === "completed";
  const isFailed = job.status === "failed";
  return (
    <View style={[styles.container, { borderColor: status.color }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{status.icon}</Text>
        <View style={styles.info}>
          <Text style={styles.title}>Export {status.label}</Text>
          <Text style={styles.subtitle}>
            {job.format.toUpperCase()} • {formatDate(job.createdAt)}
          </Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}
        >
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      {(isActive || isComplete) && (
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${job.progress}%`,
                  backgroundColor: isComplete
                    ? launchColors.hex_10b981
                    : launchColors.hex_3b82f6,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(job.progress)}%</Text>
        </View>
      )}

      {isComplete && job.fileUrl && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileSize}>
            {job.fileSize ? formatFileSize(job.fileSize) : "Unknown size"}
          </Text>
          <Text style={styles.fileUrl} numberOfLines={1}>
            {job.fileUrl}
          </Text>
        </View>
      )}

      {isFailed && job.errorMessage && (
        <View style={styles.errorSection}>
          <Text style={styles.errorText}>{job.errorMessage}</Text>
        </View>
      )}

      <View style={styles.actions}>
        {isActive && onCancel && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel button"
            accessibilityHint="Activates this control"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        )}

        {isActive && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color={launchColors.hex_3b82f6} />
            <Text style={styles.loadingText}>Working...</Text>
          </View>
        )}

        {isComplete && onDownload && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.downloadButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onDownload}
            accessibilityRole="button"
            accessibilityLabel="Download button"
            accessibilityHint="Activates this control"
          >
            <Text style={styles.downloadButtonText}>Download</Text>
          </Pressable>
        )}

        {isFailed && onRetry && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.retryButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry button"
            accessibilityHint="Activates this control"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
