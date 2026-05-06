/**
 * PDF Uploader Component
 * File picker with validation, progress tracking, and error handling
 */

import React, { useCallback, useState } from "react";
import { View, Pressable, ActivityIndicator, Animated } from "react-native";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { useTheme } from "../../../theme";
import { Icon } from "../../../icons";
import { captureException } from "../../../config/sentry";
import * as DocumentPicker from "expo-document-picker";
import type { PdfUploaderProps } from "../types";
import { validateFileUpload, formatValidationErrors } from "../validation";
import { CONTENT_STUDY_CONSTANTS } from "../types";
import { createSheet } from "@/shared/ui/create-sheet";

export const PdfUploader: React.FC<PdfUploaderProps> = ({ selectedFile, onFileSelect, disabled = false, uploadProgress = 0, uploadError, onRetry, maxSize = CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE }) => {
  const { theme } = useTheme();
  const [isPicking, setIsPicking] = useState(false);
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  // Animate progress
  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: uploadProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [uploadProgress, progressAnim]);

  const pickDocument = useCallback(async () => {
    if (disabled || isPicking) {
      return;
    }

    setIsPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/plain", "text/markdown"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsPicking(false);
        return;
      }

      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.name,
        size: asset.size || 0,
        type: asset.mimeType || "application/octet-stream",
      };

      // Validate before accepting
      const validation = validateFileUpload(file);
      if (!validation.isValid) {
        // Show validation error but still allow selection
        // (parent component will handle blocking submission)
      }

      onFileSelect(file);
    } catch (error) {
      captureException(error instanceof Error ? error : new Error("Document picker failed"), { area: "content-study.pdf-uploader.pick-document" });
    } finally {
      setIsPicking(false);
    }
  }, [disabled, isPicking, onFileSelect]);

  const removeFile = useCallback(() => {
    onFileSelect(null);
  }, [onFileSelect]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return "0 B";
    }
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType === "application/pdf") {
      return "file-text";
    }
    if (mimeType.includes("text")) {
      return "file";
    }
    return "file";
  };

  // Show selected file state
  if (selectedFile) {
    const isOversized = selectedFile.size > maxSize;
    const validation = validateFileUpload(selectedFile);

    return (
      <View
        style={[
          styles.fileCard,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: isOversized ? theme.colors.error[500] : theme.colors.border?.DEFAULT || "#E2E8F0",
          },
        ]}
      >
        <View style={styles.fileInfo}>
          <Icon name={getFileIcon(selectedFile.type)} size="lg" color={isOversized ? theme.colors.error[500] : theme.colors.primary[500]} />
          <View style={styles.fileDetails}>
            <Text style={[styles.fileName, { color: theme.colors.text.primary }]} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            <Text style={[styles.fileMeta, { color: theme.colors.text.muted }]}>
              {formatFileSize(selectedFile.size)}
              {isOversized && <Text style={{ color: theme.colors.error[500] }}> (exceeds {formatFileSize(maxSize)} limit)</Text>}
            </Text>
          </View>
        </View>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.background.primary }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.colors.primary[500],
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.text.muted }]}>{uploadProgress}%</Text>
          </View>
        )}

        {/* Error Display */}
        {uploadError && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.colors.error[500] }]}>{uploadError}</Text>
            {onRetry && (
              <Pressable onPress={onRetry} accessibilityLabel="Retry button" accessibilityRole="button" accessibilityHint="Activates this control">
                <Text style={[styles.retryText, { color: theme.colors.primary[500] }]}>Retry</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Validation Errors */}
        {!uploadError && !validation.isValid && (
          <View style={styles.errorContainer}>
            {validation.errors.map((error, index) => (
              <Text key={index} style={[styles.errorText, { color: theme.colors.error[500] }]}>
                {error.message}
              </Text>
            ))}
          </View>
        )}

        {/* Warnings */}
        {validation.warnings.length > 0 && (
          <View style={styles.warningContainer}>
            {validation.warnings.slice(0, 1).map((warning, index) => (
              <Text key={index} style={[styles.warningText, { color: theme.colors.warning[500] }]}>
                {warning.message}
              </Text>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.fileActions}>
          <Button variant="ghost" size="sm" onPress={removeFile} accessibilityLabel="Remove button" accessibilityRole="button" accessibilityHint="Activates this control">
            Remove
          </Button>
        </View>
      </View>
    );
  }

  // Show empty state
  return (
    <Pressable
      style={({ pressed }) => [
        styles.uploadContainer,
        {
          backgroundColor: theme.colors.background.secondary,
          borderColor: isPicking ? (theme.colors.primary as any)[500] : (theme.colors.border as any)?.DEFAULT || theme.colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={pickDocument}
      disabled={disabled || isPicking}
    >
      {isPicking ? (
        <ActivityIndicator color={(theme.colors.primary as any)[500]} />
      ) : (
        <>
          <Icon name="upload" size="xl" color={(theme.colors.primary as any)[500]} style={styles.uploadIcon} />
          <Text style={[styles.uploadTitle, { color: theme.colors.text.primary }]}>Tap to select a file</Text>
          <Text style={[styles.uploadSubtitle, { color: theme.colors.text.muted }]}>PDF, TXT, or MD up to {formatFileSize(maxSize)}</Text>
        </>
      )}
    </Pressable>
  );
};

const styles = createSheet({
  uploadContainer: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadContainerDisabled: {
    opacity: 0.5,
  },
  uploadIcon: {
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
  },
  fileCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fileDetails: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "500",
  },
  fileMeta: {
    fontSize: 13,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    minWidth: 35,
    textAlign: "right",
  },
  errorContainer: {
    gap: 4,
  },
  errorText: {
    fontSize: 13,
  },
  retryText: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
  },
  warningContainer: {
    gap: 4,
  },
  warningText: {
    fontSize: 13,
  },
  fileActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
