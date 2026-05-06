/**
 * Text Paste Input Component
 * Rich text input with validation, autosave, and character count
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, TextInput, Animated, Pressable } from "react-native";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import type { TextPasteInputProps, ValidationError } from "../types";
import { validatePastedText } from "../validation";
import { CONTENT_STUDY_CONSTANTS } from "../types";
import { createSheet } from "@/shared/ui/create-sheet";

export const TextPasteInput: React.FC<TextPasteInputProps> = ({ value, onChange, onValidationChange, onAutoSave, disabled = false, autoFocus = false, showCharacterCount = true, showMinLengthIndicator = true }) => {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [warnings, setWarnings] = useState<ValidationError[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Auto-focus
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  // Validation
  useEffect(() => {
    const result = validatePastedText(value);
    setErrors(result.errors);
    setWarnings(result.warnings);
    onValidationChange?.(result.isValid, [...result.errors, ...result.warnings]);
  }, [value, onValidationChange]);

  // Autosave
  useEffect(() => {
    if (!onAutoSave || !value.trim()) {
      return;
    }

    const timer = setTimeout(() => {
      onAutoSave(value);
    }, CONTENT_STUDY_CONSTANTS.AUTOSAVE_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [value, onAutoSave]);

  // Shake on error
  const shake = useCallback(() => {
    Animated.sequence([Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }), Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }), Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }), Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })]).start();
  }, [shakeAnimation]);

  const handleChange = useCallback(
    (text: string) => {
      if (text.length > CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH) {
        shake();
        return;
      }
      onChange(text);
    },
    [onChange, shake],
  );

  const clearInput = useCallback(() => {
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  const characterCount = value.length;
  const isOverLimit = characterCount > CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH;
  const isUnderMin = characterCount < CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH && characterCount > 0;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
      <View
        style={[
          styles.container,
          {
            borderColor: isFocused ? theme.colors.primary[500] : errors.length > 0 ? theme.colors.error[500] : warnings.length > 0 ? theme.colors.warning[500] : theme.colors.border.DEFAULT,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: theme.colors.text.primary }, disabled && styles.inputDisabled]}
          multiline
          placeholder="Paste your notes, article, or any text here..."
          placeholderTextColor={theme.colors.text.muted}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          maxLength={CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH + 100} // Allow slight overflow for UX
          textAlignVertical="top"
          accessibilityLabel="Text input for pasting content"
          accessibilityHint="Paste your study content here"
        />

        {value.length > 0 && !disabled && (
          <Pressable style={({ pressed }) => [styles.clearButton, pressed && { opacity: 0.8 }]} onPress={clearInput} accessibilityLabel="Clear text" accessibilityRole="button" accessibilityHint="Activates this control">
            <Text style={{ color: theme.colors.text.muted }}>×</Text>
          </Pressable>
        )}
      </View>

      {/* Character Count */}
      {showCharacterCount && (
        <View style={styles.footer}>
          <Text
            style={[
              styles.count,
              {
                color: isOverLimit ? theme.colors.error[500] : isUnderMin && showMinLengthIndicator ? theme.colors.warning[500] : theme.colors.text.muted,
              },
            ]}
          >
            {characterCount.toLocaleString()}
            {showMinLengthIndicator && characterCount < CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH ? ` / min ${CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH}` : ""}
            {` / max ${CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH.toLocaleString()}`}
          </Text>

          {wordCount > 0 && (
            <Text style={[styles.count, { color: theme.colors.text.muted }]}>
              {wordCount.toLocaleString()} words
              {wordCount > 0 && ` (~${Math.ceil(wordCount / 200)} min read)`}
            </Text>
          )}
        </View>
      )}

      {/* Validation Messages */}
      {errors.length > 0 && (
        <View style={styles.validationContainer}>
          {errors.map((error, index) => (
            <Text key={`error-${index}`} style={[styles.validationText, { color: theme.colors.error[500] }]}>
              {error.message}
            </Text>
          ))}
        </View>
      )}

      {errors.length === 0 && warnings.length > 0 && (
        <View style={styles.validationContainer}>
          {warnings.slice(0, 2).map((warning, index) => (
            <Text key={`warning-${index}`} style={[styles.validationText, { color: theme.colors.warning[500] }]}>
              {warning.message}
            </Text>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = createSheet({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "transparent",
    position: "relative",
  },
  input: {
    minHeight: 200,
    maxHeight: 400,
    padding: 16,
    paddingRight: 40,
    fontSize: 16,
    lineHeight: 24,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  clearButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  count: {
    fontSize: 12,
  },
  validationContainer: {
    marginTop: 8,
    gap: 4,
  },
  validationText: {
    fontSize: 13,
  },
});
