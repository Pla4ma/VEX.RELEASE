import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TextInput, ViewStyle } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { AnimatedStyle } from 'react-native-reanimated';

import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme/ThemeContext';
import type { TextPasteInputProps, ValidationError } from '../types';
import { CONTENT_STUDY_CONSTANTS } from '../types';
import { validatePastedText } from '../validation';

interface UseTextPasteInputReturn {
  inputRef: RefObject<TextInput | null>;
  errors: ValidationError[];
  warnings: ValidationError[];
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  animatedStyle: AnimatedStyle<ViewStyle>;
  handleChange: (text: string) => void;
  clearInput: () => void;
  characterCount: number;
  wordCount: number;
  isOverLimit: boolean;
  isUnderMin: boolean;
  borderColor: string;
  theme: ReturnType<typeof useTheme>['theme'];
}

export function useTextPasteInput({
  value,
  onChange,
  onValidationChange,
  onAutoSave,
  disabled = false,
  autoFocus = false,
}: TextPasteInputProps): UseTextPasteInputReturn {
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
    onValidationChange?.(result.isValid, [
      ...result.errors,
      ...result.warnings,
    ]);
  }, [onValidationChange, value]);

  useEffect(() => {
    if (!onAutoSave || !value.trim()) {
      return undefined;
    }
    const timer = setTimeout(
      () => onAutoSave(value),
      CONTENT_STUDY_CONSTANTS.AUTOSAVE_INTERVAL_MS,
    );
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

  const handleChange = useCallback(
    (text: string): void => {
      if (text.length > CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH) {
        shake();
        return;
      }
      onChange(text);
    },
    [onChange, shake],
  );

  const clearInput = useCallback((): void => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const characterCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const isOverLimit = characterCount > CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH;
  const isUnderMin =
    characterCount < CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH &&
    characterCount > 0;
  let borderColor: string;
  if (isFocused) {
    borderColor = theme.colors.semantic.primary;
  } else if (errors.length > 0) {
    borderColor = theme.colors.semantic.danger;
  } else if (warnings.length > 0) {
    borderColor = theme.colors.semantic.warning;
  } else {
    borderColor = theme.colors.semantic.inputBorder;
  }

  return {
    inputRef,
    errors,
    warnings,
    isFocused,
    setIsFocused,
    animatedStyle,
    handleChange,
    clearInput,
    characterCount,
    wordCount,
    isOverLimit,
    isUnderMin,
    borderColor,
    theme,
  };
}
