import React, { useCallback, useState } from 'react';
import { Pressable } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { Icon } from '../../../icons/components/Icon';
import { captureException } from '../../../config/sentry';
import * as DocumentPicker from 'expo-document-picker';
import type { PdfUploaderProps } from '../types';
import { validateFileUpload } from '../validation';
import { CONTENT_STUDY_CONSTANTS } from '../types';
import { styles } from './PdfUploader.styles';
import { PdfUploaderFileCard } from './PdfUploaderFileCard';

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

  const pickDocument = useCallback(async () => {
    if (disabled || isPicking) {return;}
    setIsPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'text/markdown'],
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
        type: asset.mimeType || 'application/octet-stream',
      };
      validateFileUpload(file);
      onFileSelect(file);
    } catch (error) {
      captureException(
        error instanceof Error ? error : new Error('Document picker failed'),
        { area: 'content-study.pdf-uploader.pick-document' },
      );
    } finally {
      setIsPicking(false);
    }
  }, [disabled, isPicking, onFileSelect]);

  const removeFile = useCallback(() => {
    onFileSelect(null);
  }, [onFileSelect]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {return '0 B';}
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.includes('pdf')) {return 'file-pdf';}
    if (mimeType.includes('text')) {return 'file-text';}
    return 'file';
  };

  const isOversized = selectedFile ? selectedFile.size > maxSize : false;
  const validation = selectedFile
    ? validateFileUpload(selectedFile)
    : { isValid: true, errors: [], warnings: [] };

  if (selectedFile) {
    return (
      <PdfUploaderFileCard
        fileName={selectedFile.name}
        fileSize={selectedFile.size}
        fileType={selectedFile.type}
        isOversized={isOversized}
        maxSize={maxSize}
        uploadProgress={uploadProgress}
        uploadError={uploadError ?? undefined}
        onRetry={onRetry}
        onRemove={removeFile}
        validation={validation}
        formatFileSize={formatFileSize}
        getFileIcon={getFileIcon}
      />
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
      accessibilityRole="button"
      accessibilityLabel="Upload a PDF, text, or markdown file"
      accessibilityHint="Opens the file picker to select a study document"
    >
      {isPicking ? (
        <Skeleton width={40} height={40} variant="circular" />
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
