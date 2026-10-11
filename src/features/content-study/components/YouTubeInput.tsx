import { vexFire } from "@/theme/tokens/vex-fire";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { Icon } from '../../../icons/components/Icon';
import type { YouTubeInputProps } from '../types';
import { validateYouTubeUrl } from '../validation';
import { styles } from './YouTubeInputStyles';
import { buttonTap } from '../../../utils/haptics';
import { YouTubeVideoPreview } from './YouTubeVideoPreview';

export const YouTubeInput: React.ComponentType<YouTubeInputProps> = ({
  value,
  onChange,
  onValidationChange,
  onExtract,
  disabled = false,
  isExtracting = false,
  extractionError,
  videoInfo,
}) => {
  const { theme: _theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const validationState = useMemo(() => {
    if (!value) {
      return { isValid: false, errors: [], warnings: [] };
    }
    const result = validateYouTubeUrl(value);
    return {
      isValid: result.isValid,
      errors: result.errors.map((e) => e.message),
      warnings: result.warnings.map((w) => w.message),
      videoId: result.metadata?.youtubeVideoId,
    };
  }, [value]);

  useEffect(() => {
    if (!value) {
      onValidationChange?.(false);
      return;
    }
    onValidationChange?.(validationState.isValid, validationState.errors[0]);
  }, [validationState, value, onValidationChange]);
  const clearInput = useCallback(() => {
    onChange('');
  }, [onChange]);
  const _handlePaste = useCallback(async () => {}, []);
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: isFocused
              ? vexFire.ember
              : extractionError || validationState.errors.length > 0
                ? vexFire.danger
                : validationState.warnings.length > 0
                  ? vexFire.amber
                  : vexFire.border,
          },
        ]}
      >
        <Icon
          name="link"
          size="sm"
          color={vexFire.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: vexFire.cream }]}
          value={value}
          onChangeText={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Paste YouTube URL (youtube.com/watch?v=...)"
          placeholderTextColor={vexFire.textMuted}
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
            <Icon name="x" size="sm" color={vexFire.textMuted} />
          </Pressable>
        )}
      </View>
      {validationState.errors.length > 0 && (
        <View style={styles.messageContainer}>
          {validationState.errors.map((error, _index) => (
            <View key={`error-${error}`} style={styles.messageRow}>
              <Icon
                name="alert-circle"
                size="sm"
                color={vexFire.danger}
              />
              <Text
                style={[styles.messageText, { color: vexFire.danger }]}
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
            {validationState.warnings.map((warning, _index) => (
              <View key={`warning-${warning}`} style={styles.messageRow}>
                <Icon
                  name="alert-triangle"
                  size="sm"
                  color={vexFire.amber}
                />
                <Text
                  style={[
                    styles.messageText,
                    { color: vexFire.amber },
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
        <Text style={[styles.helpText, { color: vexFire.textMuted }]}>
          We'll extract the video's transcript and create study materials from
          it.
        </Text>
      )}
    </View>
  );
};
