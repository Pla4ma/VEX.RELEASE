/**
 * Input Component
 *
 * Text input with label, error handling, and icons.
 */

import React, { useState, useCallback, forwardRef } from 'react';
import {
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { useTheme } from '../theme';
import { Text } from './primitives';
import { Icon } from '../icons';
import { createSheet } from '@/shared/ui/create-sheet';
import { type InputProps } from './input-types';

export type { InputProps } from './input-types';

/**
 * Input component
 */
export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      containerStyle,
      inputStyle,
      onFocus,
      onBlur,
      ...textInputProps
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Handle focus
    const handleFocus = useCallback(
      (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    // Handle blur
    const handleBlur = useCallback(
      (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const getBorderColor = (): string => {
      if (error) {
        return theme.colors.error.DEFAULT;
      }
      if (isFocused) {
        return theme.colors.semantic.primary;
      }
      return theme.colors.semantic.inputBorder;
    };

    return (
      <View style={containerStyle}>
        {/* Label */}
        {label && (
          <Text variant="body" fontWeight={'500' as const} mb="xs">
            {label}
          </Text>
        )}

        {/* Input container */}
        <View
          style={[
            styles.container,
            {
              borderColor: getBorderColor(),
              backgroundColor: theme.colors.semantic.inputBackground,
              borderRadius: theme.borderRadius.xl,
            },
            inputStyle,
          ]}
        >
          {/* Left icon */}
          {leftIcon && (
            <View style={styles.leftIcon}>
              <Icon
                name={leftIcon}
                size="sm"
                color={
                  isFocused
                    ? theme.colors.primary[500]
                    : theme.colors.text.tertiary
                }
              />
            </View>
          )}

          {/* Text input */}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: theme.colors.text.primary,
                fontSize: theme.typography.body.medium.fontSize,
                paddingLeft: leftIcon ? 0 : theme.spacing[4],
                paddingRight: rightIcon ? 0 : theme.spacing[4],
              },
            ]}
            placeholderTextColor={theme.colors.text.placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxLength={textInputProps.maxLength || 500}
            {...textInputProps}
            accessibilityLabel={textInputProps.accessibilityLabel ?? label}
          />

          {/* Right icon */}
          {rightIcon && (
            <View style={styles.rightIcon}>
              <Icon
                name={rightIcon}
                size="sm"
                color={theme.colors.text.tertiary}
              />
            </View>
          )}
        </View>

        {/* Error or helper text */}
        {(error || helper) && (
          <Text
            variant="caption"
            style={{
              color: error
                ? theme.colors.error.DEFAULT
                : theme.colors.text.tertiary,
            }}
            mt="xs"
          >
            {error || helper}
          </Text>
        )}
      </View>
    );
  },
);

const styles = createSheet({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 52,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: 'System',
  },
  leftIcon: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  rightIcon: {
    paddingLeft: 8,
    paddingRight: 12,
  },
});

export default Input;
