import React, { useCallback, useState } from "react";
import { View, Pressable, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { useTheme } from "../../../theme";
import { Icon } from "../../../icons";
import { captureException } from "../../../config/sentry";
import * as DocumentPicker from "expo-document-picker";
import type { PdfUploaderProps } from "../types";
import { validateFileUpload } from "../validation";
import { CONTENT_STUDY_CONSTANTS } from "../types";
import { styles } from "./PdfUploader.styles";

export const PdfUploader: React.FC<PdfUploaderProps> = ({
  selectedFile,
  onFileSelect,
  disabled = false,
  uploadProgress = 0,
  uploadError,
  onRetry,
  maxSize = CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE,
}) => {
  const { theme } = useTheme();
  const [isPicking, setIsPicking] = useState(false);
  const progressAnim = useSharedValue(0);

  React.useEffect(() => {
    progressAnim.value = withTiming(uploadProgress, { duration: 300 });
  }, [uploadProgress, progressAnim]);

  const progressWidthStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }));

  const pickDocument = useCallback(async () => {
    if (disabled || isPicking) return;
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
      if (!asset) {
        setIsPicking(false);
        return;
      }
      const file = {
        uri: asset.uri,
        name: asset.name,
        size: asset.size || 0,
        type: asset.mimeType || "application/octet-stream",
      };
      validateFileUpload(file);
      onFileSelect(file);
    } catch (error) {
      captureException(
        error instanceof Error ? error : new Error("Document picker failed"),
        { area: "content-study.pdf-uploader.pick-document" },
      );
    } finally {
      setIsPicking(false);
    }
  }, [disabled, isPicking, onFileSelect]);

  const removeFile = useCallback(() => {
    onFileSelect(null);
  }, [onFileSelect]);
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };
  const getFileIcon = (mimeType: string): string => {
    if (mimeType.includes("pdf")) return "file-pdf";
    if (mimeType.includes("text")) return "file-text";
    return "file";
  };
  const isOversized = selectedFile ? selectedFile.size > maxSize : false;
  const validation = selectedFile
    ? validateFileUpload(selectedFile)
    : { isValid: true, errors: [], warnings: [] };

  if (selectedFile) {
    return (
      <View style={styles.fileCard}>
        <View style={styles.fileInfo}>
          <Icon
            name={getFileIcon(selectedFile.type)}
            size="lg"
            color={
              isOversized ? theme.colors.error[500] : theme.colors.primary[500]
            }
          />
          <View style={styles.fileDetails}>
            <Text
              style={[styles.fileName, { color: theme.colors.text.primary }]}
              numberOfLines={1}
            >
              {selectedFile.name}
            </Text>
            <Text style={[styles.fileMeta, { color: theme.colors.text.muted }]}>
              {formatFileSize(selectedFile.size)}
              {isOversized && (
                <Text style={{ color: theme.colors.error[500] }}>
                  {" "}
                  (exceeds {formatFileSize(maxSize)} limit)
                </Text>
              )}
            </Text>
          </View>
        </View>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: theme.colors.background.primary },
              ]}
            >
              <Animated.View
                style={[
                  styles.progressFill,
                  { backgroundColor: theme.colors.primary[500] },
                  progressWidthStyle,
                ]}
              />
            </View>
            <Text
              style={[styles.progressText, { color: theme.colors.text.muted }]}
            >
              {uploadProgress}%
            </Text>
          </View>
        )}
        {uploadError && (
          <View style={styles.errorContainer}>
            <Text
              style={[styles.errorText, { color: theme.colors.error[500] }]}
            >
              {uploadError}
            </Text>
            {onRetry && (
              <Pressable
                onPress={onRetry}
                accessibilityLabel="Retry button"
                accessibilityRole="button"
                accessibilityHint="Activates this control"
              >
                <Text
                  style={[
                    styles.retryText,
                    { color: theme.colors.primary[500] },
                  ]}
                >
                  Retry
                </Text>
              </Pressable>
            )}
          </View>
        )}
        {!uploadError && !validation.isValid && (
          <View style={styles.errorContainer}>
            {validation.errors.map((error, index) => (
              <Text
                key={index}
                style={[styles.errorText, { color: theme.colors.error[500] }]}
              >
                {error.message}
              </Text>
            ))}
          </View>
        )}
        {validation.warnings.length > 0 && (
          <View style={styles.warningContainer}>
            {validation.warnings.slice(0, 1).map((warning, index) => (
              <Text
                key={index}
                style={[
                  styles.warningText,
                  { color: theme.colors.warning[500] },
                ]}
              >
                {warning.message}
              </Text>
            ))}
          </View>
        )}
        <View style={styles.fileActions}>
          <Button
            variant="ghost"
            size="sm"
            onPress={removeFile}
            accessibilityLabel="Remove button"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            Remove
          </Button>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.uploadContainer,
        {
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.DEFAULT ?? theme.colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={pickDocument}
      disabled={disabled || isPicking}
    >
      {isPicking ? (
        <ActivityIndicator color={theme.colors.primary[500]} />
      ) : (
        <>
          <Icon
            name="upload"
            size="xl"
            color={theme.colors.primary[500]}
            style={styles.uploadIcon}
          />
          <Text
            style={[styles.uploadTitle, { color: theme.colors.text.primary }]}
          >
            Tap to select a file
          </Text>
          <Text
            style={[styles.uploadSubtitle, { color: theme.colors.text.muted }]}
          >
            PDF, TXT, or MD up to {formatFileSize(maxSize)}
          </Text>
        </>
      )}
    </Pressable>
  );
};
