import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme';
import type { TextPasteInputProps, ValidationError } from '../types';
import { CONTENT_STUDY_CONSTANTS } from '../types';
import { validatePastedText } from '../validation';

export function TextPasteInput({
  value,
  onChange,
  onValidationChange,
  onAutoSave,
  disabled = false,
  autoFocus = false,
  showCharacterCount = true,
  showMinLengthIndicator = true,
}: TextPasteInputProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const inputRef = useRef<TextInput>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [warnings, setWarnings] = useState<ValidationError[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const shakeOffset = useSharedValue(0);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoFocus]);

  useEffect(() => {
    const result = validatePastedText(value);
    setErrors(result.errors);
    setWarnings(result.warnings);
    onValidationChange?.(result.isValid, [...result.errors, ...result.warnings]);
  }, [onValidationChange, value]);

  useEffect(() => {
    if (!onAutoSave || !value.trim()) {
      return undefined;
    }
    const timer = setTimeout(() => onAutoSave(value), CONTENT_STUDY_CONSTANTS.AUTOSAVE_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [onAutoSave, value]);

  const shake = useCallback((): void => {
    if (isReducedMotion) {
      return;
    }
    shakeOffset.value = withSequence(
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [isReducedMotion, shakeOffset]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }],
  }));

  const handleChange = useCallback((text: string): void => {
    if (text.length > CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH) {
      shake();
      return;
    }
    onChange(text);
  }, [onChange, shake]);

  const clearInput = useCallback((): void => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const characterCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const isOverLimit = characterCount > CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH;
  const isUnderMin = characterCount < CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH && characterCount > 0;
  const borderColor = isFocused
    ? theme.colors.semantic.primary
    : errors.length > 0
    ? theme.colors.semantic.danger
    : warnings.length > 0
    ? theme.colors.semantic.warning
    : theme.colors.semantic.inputBorder;

  return (
    <Animated.View style={animatedStyle}>
      <View
        style={{
          borderWidth: 1,
          borderRadius: theme.borderRadius.xl,
          borderColor,
          backgroundColor: theme.colors.semantic.inputBackground,
          position: 'relative',
        }}
      >
        <TextInput
          accessibilityHint="Paste study notes, article text, or source material here"
          accessibilityLabel="Study content text input"
          editable={!disabled}
          maxLength={CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH + 100}
          multiline
          onBlur={() => setIsFocused(false)}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          placeholder="Paste your notes, article, or any study text here..."
          placeholderTextColor={theme.colors.text.placeholder}
          ref={inputRef}
          style={{
            minHeight: theme.spacing[8] * 3,
            maxHeight: theme.spacing[8] * 6,
            padding: theme.spacing[4],
            paddingRight: theme.spacing[8],
            color: theme.colors.text.primary,
            fontSize: theme.typography.body.medium.fontSize,
            lineHeight: theme.typography.body.medium.lineHeight,
            opacity: disabled ? 0.64 : 1,
          }}
          textAlignVertical="top"
          value={value}
        />
        {value.length > 0 && !disabled ? (
          <Pressable
            accessibilityHint="Clears the pasted study text"
            accessibilityLabel="Clear study text"
            accessibilityRole="button"
            onPress={clearInput}
            style={{
              position: 'absolute',
              top: theme.spacing[3],
              right: theme.spacing[3],
              width: 44,
              height: 44,
              borderRadius: theme.borderRadius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.semantic.surfaceGlass,
            }}
          >
            <Text color="text.secondary" variant="label">x</Text>
          </Pressable>
        ) : null}
      </View>

      {showCharacterCount ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing[2] }}>
          <Text color={isOverLimit ? 'error.DEFAULT' : isUnderMin && showMinLengthIndicator ? 'warning.DEFAULT' : 'text.muted'} variant="caption">
            {`${characterCount.toLocaleString()} / max ${CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH.toLocaleString()}`}
          </Text>
          {wordCount > 0 ? (
            <Text color="text.muted" variant="caption">{`${wordCount.toLocaleString()} words`}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={{ marginTop: theme.spacing[2], gap: theme.spacing[1] }}>
        {errors.map((error) => (
          <Text key={error.message} color="error.DEFAULT" variant="caption">{error.message}</Text>
        ))}
        {errors.length === 0 ? warnings.slice(0, 2).map((warning) => (
          <Text key={warning.message} color="warning.DEFAULT" variant="caption">{warning.message}</Text>
        )) : null}
      </View>
    </Animated.View>
  );
}
