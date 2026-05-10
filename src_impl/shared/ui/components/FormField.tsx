<<<<<<< HEAD
/**
 * Form Field Component
 * Premium form field with validation, states, and accessibility
 *
 * Features:
 * - Label with required indicator
 * - Helper text and error messages
 * - Loading state
 * - Disabled state
 * - Success state
 * - Character counter
 * - Validation with debounce
 * - Accessible error announcements
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  ViewStyle,
  TextStyle,
  TextInput,
  TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
=======
import React, { useCallback, useState } from 'react';
import { TextInput, View, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import { FormSection, type FormSectionProps, InputGroup } from './FormFieldParts';

export type FieldSize = 'sm' | 'md' | 'lg';
export type FieldState = 'default' | 'focused' | 'error' | 'success' | 'disabled' | 'loading';

export interface FormFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  error?: string;
  successMessage?: string;
  helperText?: string;
  state?: FieldState;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  showCounter?: boolean;
  maxLength?: number;
  size?: FieldSize;
  leftIcon?: string;
  rightIcon?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  onValidate?: (value: string) => string | null;
  onChangeText?: (text: string) => void;
}

const sizeConfig = {
  sm: { paddingVertical: 10, paddingHorizontal: 12, fontSize: 14, minHeight: 44 },
  md: { paddingVertical: 13, paddingHorizontal: 16, fontSize: 16, minHeight: 52 },
  lg: { paddingVertical: 16, paddingHorizontal: 18, fontSize: 17, minHeight: 58 },
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  placeholder,
  error,
  successMessage,
  helperText,
  state: propState,
  required = false,
  disabled = false,
  loading = false,
  showCounter = false,
  maxLength,
  size = 'md',
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  accessibilityLabel,
  accessibilityHint,
  onValidate,
  onChangeText,
  value,
  defaultValue,
  ...textInputProps
}) => {
  const { theme } = useTheme();
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const effectiveValue = value ?? internalValue;
  const state: FieldState = propState ??
    (loading ? 'loading' : disabled ? 'disabled' : error || internalError ? 'error' : successMessage ? 'success' : isFocused ? 'focused' : 'default');
  const semantic = theme.colors.semantic;
  const config = sizeConfig[size];

  const validate = useCallback((text: string) => {
    if (onValidate) {
      setInternalError(onValidate(text));
    }
  }, [onValidate]);

  const handleChangeText = useCallback((text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
    validate(text);
  }, [onChangeText, validate]);

  const borderColor = state === 'error'
    ? semantic.danger
    : state === 'success'
    ? semantic.success
    : state === 'focused'
    ? semantic.primary
    : semantic.inputBorder;

<<<<<<< HEAD
  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: state === 'error'
      ? theme.colors.error.DEFAULT
      : state === 'success'
      ? theme.colors.success.DEFAULT
      : state === 'focused'
      ? theme.colors.primary[500]
      : theme.colors.border.DEFAULT,
=======
  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(borderColor, { duration: 160 }),
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
  }));
  const message = error ?? internalError ?? successMessage ?? helperText;
  const messageColor = error || internalError
    ? 'error.DEFAULT'
    : successMessage
    ? 'success.DEFAULT'
    : 'text.muted';

  return (
    <View style={[{ marginBottom: theme.spacing[4] }, containerStyle]}>
      {label ? (
        <Text color={state === 'error' ? 'error.DEFAULT' : 'text.secondary'} mb="sm" variant="label">
          {label}{required ? ' *' : ''}
        </Text>
      ) : null}
      <Animated.View
        style={[
          {
            alignItems: 'center',
            backgroundColor: state === 'disabled' ? theme.colors.background.tertiary : semantic.inputBackground,
            borderRadius: theme.borderRadius.xl,
            borderWidth: 1,
            flexDirection: 'row',
            minHeight: config.minHeight,
            paddingHorizontal: config.paddingHorizontal,
            paddingVertical: config.paddingVertical,
          },
          animatedStyle,
        ]}
      >
        {leftIcon ? <Icon color={state === 'error' ? semantic.danger : theme.colors.text.muted} name={leftIcon} size="md" /> : null}
        <TextInput
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{ disabled }}
          defaultValue={defaultValue}
          editable={!disabled && !loading}
          maxLength={maxLength}
          onBlur={() => {
            setIsFocused(false);
            validate(String(effectiveValue));
          }}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.placeholder}
          style={[
            {
              color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
              flex: 1,
              fontSize: config.fontSize,
              padding: 0,
              marginLeft: leftIcon ? theme.spacing[3] : 0,
              marginRight: rightIcon || loading ? theme.spacing[3] : 0,
            },
            inputStyle,
          ]}
          value={effectiveValue}
          {...textInputProps}
        />
        {loading ? (
          <Text color="text.muted" variant="caption">...</Text>
        ) : rightIcon ? (
          <Icon color={theme.colors.text.muted} name={rightIcon} size="md" />
        ) : null}
      </Animated.View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing[1], minHeight: 20 }}>
        {message ? <Text color={messageColor} flex={1} variant="caption">{message}</Text> : <View />}
        {showCounter && maxLength ? <Text color="text.muted" ml="sm" variant="caption">{String(effectiveValue).length}/{maxLength}</Text> : null}
      </View>
    </View>
  );
};

export { FormSection, InputGroup };
export type { FormSectionProps };
export default FormField;
