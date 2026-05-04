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
  StyleSheet,
  TextInput,
  TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import { createSheet } from '@/shared/ui/create-sheet';

// ============================================================================
// Types
// ============================================================================

export type FieldSize = 'sm' | 'md' | 'lg';
export type FieldState = 'default' | 'focused' | 'error' | 'success' | 'disabled' | 'loading';

export interface FormFieldProps extends Omit<TextInputProps, 'style'> {
  // Core
  label?: string;
  placeholder?: string;

  // Validation
  error?: string;
  successMessage?: string;
  helperText?: string;

  // State
  state?: FieldState;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;

  // Counter
  showCounter?: boolean;
  maxLength?: number;

  // Visual
  size?: FieldSize;
  leftIcon?: string;
  rightIcon?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;

  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;

  // Events
  onValidate?: (value: string) => string | null;
  onChangeText?: (text: string) => void;
}

export interface FormSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

// ============================================================================
// Form Field Component
// ============================================================================

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
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const effectiveValue = value !== undefined ? value : internalValue;

  // Determine effective state
  const state: FieldState = propState ||
    (loading ? 'loading' :
     disabled ? 'disabled' :
     error || internalError ? 'error' :
     successMessage ? 'success' :
     isFocused ? 'focused' : 'default');

  // Focus animation
  const borderColor = useSharedValue(0);
  const labelScale = useSharedValue(value || defaultValue ? 1 : 0);

  useEffect(() => {
    borderColor.value = withTiming(
      state === 'error' ? 1 : state === 'success' ? 2 : state === 'focused' ? 3 : 0,
      { duration: 200 }
    );
  }, [state, borderColor]);

  useEffect(() => {
    labelScale.value = withSpring(effectiveValue ? 1 : isFocused ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [effectiveValue, isFocused, labelScale]);

  // Validation
  const validate = useCallback((text: string) => {
    if (onValidate) {
      const validationError = onValidate(text);
      setInternalError(validationError);
    }
  }, [onValidate]);

  const handleChangeText = useCallback((text: string) => {
    setInternalValue(text);
    onChangeText?.(text);

    // Debounced validation
    const timeoutId = setTimeout(() => validate(text), 300);
    return () => clearTimeout(timeoutId);
  }, [onChangeText, validate]);

  // Size configurations
  const sizeConfig = {
    sm: { paddingVertical: 8, paddingHorizontal: 12, fontSize: 14 },
    md: { paddingVertical: 12, paddingHorizontal: 16, fontSize: 16 },
    lg: { paddingVertical: 16, paddingHorizontal: 20, fontSize: 18 },
  };

  // State colors
  const stateColors = {
    default: theme.colors.border.DEFAULT,
    focused: theme.colors.primary[500],
    error: theme.colors.error.DEFAULT,
    success: theme.colors.success.DEFAULT,
    disabled: theme.colors.border.light,
    loading: theme.colors.border.light,
  };

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: state === 'error'
      ? theme.colors.error.DEFAULT
      : state === 'success'
      ? theme.colors.success.DEFAULT
      : state === 'focused'
      ? theme.colors.primary[500]
      : theme.colors.border.DEFAULT,
  }));

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <View style={styles.labelRow}>
          <Text
            variant="label"
            color={state === 'error' ? 'error.DEFAULT' : 'text.secondary'}
            style={styles.label}
          >
            {label}
            {required && (
              <Text variant="label" color="error.DEFAULT"> *</Text>
            )}
          </Text>
        </View>
      )}

      {/* Input Container */}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor: state === 'disabled'
              ? theme.colors.background.tertiary
              : theme.colors.background.secondary,
            borderRadius: 12,
            paddingVertical: sizeConfig[size].paddingVertical,
            paddingHorizontal: sizeConfig[size].paddingHorizontal,
          },
          animatedBorderStyle,
          state === 'error' && styles.errorBorder,
          state === 'success' && styles.successBorder,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIcon}>
            <Icon
              name={leftIcon}
              size="md"
              color={state === 'error' ? 'error.DEFAULT' : 'text.tertiary'}
            />
          </View>
        )}

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          value={effectiveValue}
          defaultValue={defaultValue}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            validate(effectiveValue);
          }}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          editable={!disabled && !loading}
          maxLength={maxLength}
          style={[
            styles.input,
            {
              fontSize: sizeConfig[size].fontSize,
              color: state === 'disabled'
                ? theme.colors.text.tertiary
                : theme.colors.text.primary,
            },
            inputStyle,
          ]}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
          {...textInputProps}
        />

        {/* Right Icon / Loading / Status */}
        {loading ? (
          <View style={styles.rightIcon}>
            <Text style={{ color: theme.colors.text.tertiary }}>⟳</Text>
          </View>
        ) : state === 'error' ? (
          <View style={styles.rightIcon}>
            <Icon name="alert-circle" size="md" color={theme.colors.error.DEFAULT} />
          </View>
        ) : state === 'success' ? (
          <View style={styles.rightIcon}>
            <Icon name="check-circle" size="md" color={theme.colors.success.DEFAULT} />
          </View>
        ) : rightIcon ? (
          <View style={styles.rightIcon}>
            <Icon name={rightIcon} size="md" color={theme.colors.text.tertiary} />
          </View>
        ) : null}
      </Animated.View>

      {/* Helper Text / Error / Counter */}
      <View style={styles.footer}>
        <View style={styles.messages}>
          {error || internalError ? (
            <Text variant="caption" color="error.DEFAULT" style={styles.message}>
              {error || internalError}
            </Text>
          ) : successMessage ? (
            <Text variant="caption" color="success.DEFAULT" style={styles.message}>
              {successMessage}
            </Text>
          ) : helperText ? (
            <Text variant="caption" color="text.tertiary" style={styles.message}>
              {helperText}
            </Text>
          ) : null}
        </View>

        {showCounter && maxLength && (
          <Text
            variant="caption"
            color={effectiveValue.length > maxLength ? 'error.DEFAULT' : 'text.tertiary'}
            style={styles.counter}
          >
            {effectiveValue.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

// ============================================================================
// Form Section Component
// ============================================================================

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  subtitle,
  children,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.section, style]}>
      {(title || subtitle) && (
        <View style={styles.sectionHeader}>
          {title && (
            <Text variant="heading" color="text.primary" style={styles.sectionTitle}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text variant="body" color="text.secondary" style={styles.sectionSubtitle}>
              {subtitle}
            </Text>
          )}
          <View style={[styles.divider, { backgroundColor: theme.colors.border.DEFAULT }]} />
        </View>
      )}
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
};

// ============================================================================
// Input Group Component
// ============================================================================

export const InputGroup: React.FC<{
  children: React.ReactNode;
  inline?: boolean;
  gap?: number;
  style?: ViewStyle;
}> = ({ children, inline = false, gap = 16, style }) => {
  return (
    <View
      style={[
        styles.inputGroup,
        inline && styles.inputGroupInline,
        { gap },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = createSheet({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  errorBorder: {
    borderColor: '#EF4444',
  },
  successBorder: {
    borderColor: '#10B981',
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  rightIcon: {
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    minHeight: 20,
  },
  messages: {
    flex: 1,
  },
  message: {
    fontSize: 12,
  },
  counter: {
    marginLeft: 8,
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  sectionSubtitle: {
    marginBottom: 12,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  sectionContent: {
    gap: 12,
  },
  inputGroup: {
    gap: 16,
  },
  inputGroupInline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});

export default FormField;
