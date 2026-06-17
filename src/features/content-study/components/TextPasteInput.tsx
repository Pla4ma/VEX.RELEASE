import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import type { TextPasteInputProps } from '../types';
import { CONTENT_STUDY_CONSTANTS } from '../types';
import { useTextPasteInput } from './useTextPasteInput';

          
export function TextPasteInput({
  value,
  onChange,
  onValidationChange,
  onAutoSave,
  disabled = false,
  autoFocus = false,
  showCharacterCount = true,
  showMinLengthIndicator = true,
}: TextPasteInputProps): React.ReactNode {
  const {
    inputRef,
    errors,
    warnings,
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
  } = useTextPasteInput({
    value,
    onChange,
    onValidationChange,
    onAutoSave,
    disabled,
    autoFocus,
  });

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
            style={{}}
          >
            <Text color="text.secondary" variant="label">
              x
            </Text>
          </Pressable>
        ) : null}
      </View>

      {showCharacterCount ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: theme.spacing[2],
          }}
        >
          <Text
            color={
              isOverLimit
                ? 'error.DEFAULT'
                : isUnderMin && showMinLengthIndicator
                  ? 'warning.DEFAULT'
                  : 'text.muted'
            }
            variant="caption"
          >
            {`${characterCount.toLocaleString()} / max ${CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH.toLocaleString()}`}
          </Text>
          {wordCount > 0 ? (
            <Text
              color="text.muted"
              variant="caption"
            >{`${wordCount.toLocaleString()} words`}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={{ marginTop: theme.spacing[2], gap: theme.spacing[1] }}>
        {errors.map((error) => (
          <Text key={error.message} color="error.DEFAULT" variant="caption">
            {error.message}
          </Text>
        ))}
        {errors.length === 0
          ? warnings.slice(0, 2).map((warning) => (
              <Text
                key={warning.message}
                color="warning.DEFAULT"
                variant="caption"
              >
                {warning.message}
              </Text>
            ))
          : null}
      </View>
    </Animated.View>
  );
}
