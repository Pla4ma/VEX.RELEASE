import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme/ThemeContext';
import { Icon } from '../../../icons/components/Icon';
import { styles } from './PdfUploader.styles';
import { Text as VexText } from '../../../components/primitives/Text';

interface FileCardProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  isOversized: boolean;
  maxSize: number;
  uploadProgress: number;
  uploadError?: string;
  onRetry?: () => void;
  onRemove: () => void;
  validation: {
    isValid: boolean;
    errors: Array<{ message: string }>;
    warnings: Array<{ message: string }>;
  };
  formatFileSize: (bytes: number) => string;
  getFileIcon: (mimeType: string) => string;
}

export const PdfUploaderFileCard: React.FC<FileCardProps> = ({
  fileName,
  fileSize,
  fileType,
  isOversized,
  maxSize,
  uploadProgress,
  uploadError,
  onRetry,
  onRemove,
  validation,
  formatFileSize,
  getFileIcon,
}) => {
  const { theme } = useTheme();
  const progressAnim = useSharedValue(0);

  React.useEffect(() => {
    progressAnim.value = withTiming(uploadProgress, { duration: 300 });
  }, [uploadProgress, progressAnim]);

  const progressWidthStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }));

  return (
    <View style={styles.fileCard}>
      <View style={styles.fileInfo}>
        <Icon
          name={getFileIcon(fileType)}
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
            {fileName}
          </Text>
          <Text style={[styles.fileMeta, { color: theme.colors.text.muted }]}>
            {formatFileSize(fileSize)}
            {isOversized && (
              <Text style={{ color: theme.colors.error[500] }}>
                {' '}
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
              accessibilityLabel="Retry upload"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
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
              key={`error-${error.message}-${index}`}
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
              key={`warning-${warning.message}-${index}`}
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
        <Button variant="ghost"
          size="sm"
          onPress={onRemove}
          accessibilityLabel="Remove file"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <VexText>Remove</VexText>
        </Button>
      </View>
    </View>
  );
};
