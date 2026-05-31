import React, { useCallback, useEffect, useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { Icon } from '../../../icons';
import type { YouTubeInputProps } from '../types';
import { validateYouTubeUrl } from '../validation';
import { styles } from './YouTubeInputStyles';
import { buttonTap } from '../../../utils/haptics';
import { YouTubeVideoPreview } from './YouTubeVideoPreview';

export const YouTubeInput: React.FC<YouTubeInputProps> = ({
  value,
  onChange,
  onValidationChange,
  onExtract,
  disabled = false,
  isExtracting = false,
  extractionError,
  videoInfo,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    videoId?: string;
  }>({ isValid: false, errors: [], warnings: [] });
  useEffect(() => {
    if (!value) {
      setValidationState({ isValid: false, errors: [], warnings: [] });
      onValidationChange?.(false);
      return;
    }
    const result = validateYouTubeUrl(value);
    setValidationState({
      isValid: result.isValid,
      errors: result.errors.map((e) => e.message),
      warnings: result.warnings.map((w) => w.message),
      videoId: result.metadata?.youtubeVideoId,
    });
    onValidationChange?.(result.isValid, result.errors[0]?.message);
  }, [value, onValidationChange]);
  const clearInput = useCallback(() => {
    onChange('');
  }, [onChange]);
  const handlePaste = useCallback(async () => {}, []);
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: isFocused
              ? theme.colors.primary[500]
              : extractionError || validationState.errors.length > 0
                ? theme.colors.error[500]
                : validationState.warnings.length > 0
                  ? theme.colors.warning[500]
                  : theme.colors.border.DEFAULT,
          },
        ]}
      >
        <Icon
          name="link"
          size="sm"
          color={theme.colors.text.muted}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: theme.colors.text.primary }]}
          value={value}
          onChangeText={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Paste YouTube URL (youtube.com/watch?v=...)"
          placeholderTextColor={theme.colors.text.muted}
          editable={!disabled && !isExtracting}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          accessibilityLabel="YouTube URL input"
        />
        {value.length > 0 && !disabled && (
          <Pressable
            onPress={() => { buttonTap(); clearInput(); }}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && { opacity: 0.8 },
            ]}
            accessibilityLabel="Clear YouTube URL"
            accessibilityRole="button"
            accessibilityHint="Double tap to clear input"
          >
            <Icon name="x" size="sm" color={theme.colors.text.muted} />
          </Pressable>
        )}
      </View>
      {validationState.errors.length > 0 && (
        <View style={styles.messageContainer}>
          {validationState.errors.map((error, index) => (
            <View key={index} style={styles.messageRow}>
              <Icon
                name="alert-circle"
                size="sm"
                color={theme.colors.error[500]}
              />
              <Text
                style={[styles.messageText, { color: theme.colors.error[500] }]}
              >
                {error}
              </Text>
            </View>
          ))}
        </View>
      )}
      {validationState.errors.length === 0 &&
        validationState.warnings.length > 0 && (
          <View style={styles.messageContainer}>
            {validationState.warnings.map((warning, index) => (
              <View key={index} style={styles.messageRow}>
                <Icon
                  name="alert-triangle"
                  size="sm"
                  color={theme.colors.warning[500]}
                />
                <Text
                  style={[
                    styles.messageText,
                    { color: theme.colors.warning[500] },
                  ]}
                >
                  {warning}
                </Text>
              </View>
            ))}
          </View>
        )}
      {(videoInfo || isExtracting) && validationState.isValid && (
        <YouTubeVideoPreview
          videoInfo={videoInfo}
          isExtracting={isExtracting}
          extractionError={extractionError}
          onExtract={onExtract}
        />
      )}
      {!videoInfo && !isExtracting && validationState.isValid && (
        <Text style={[styles.helpText, { color: theme.colors.text.muted }]}>
          We'll extract the video's transcript and create study materials from
          it.
        </Text>
      )}
    </View>
  );
};
