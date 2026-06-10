import React, { useCallback, useState } from 'react';
import { TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import {
  FormSection,
  type FormSectionProps,
  InputGroup,
} from './FormFieldParts';
import {
  type FieldState,
  type FormFieldProps,
  sizeConfig,
  getFieldBorderColor,
  getFieldMessageColor,
} from './FormFieldTypes';

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
  const reducedMotion = useReducedMotion();
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState<string | undefined>(undefined);
  const effectiveValue = value ?? internalValue;
  const state: FieldState =
    propState ??
    (loading ? 'loading' : disabled ? 'disabled' : error || internalError
      ? 'error'
      : successMessage ? 'success' : isFocused ? 'focused' : 'default');
  const semantic = theme.colors.semantic;
  const config = sizeConfig[size];
  const validate = useCallback(
    (text: string) => {
      if (onValidate) {setInternalError(onValidate(text) ?? undefined);}
    },
    [onValidate],
  );
  const handleChangeText = useCallback(
    (text: string) => {
      setInternalValue(text);
      onChangeText?.(text);
      validate(text);
    },
    [onChangeText, validate],
  );

  const borderColor = getFieldBorderColor(state, semantic);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: reducedMotion ? borderColor : withTiming(borderColor, { duration: 160 }),
  }));
  const message = error ?? internalError ?? successMessage ?? helperText;
  const messageColor = getFieldMessageColor(error, internalError, successMessage);

  return (
    <View style={[{ marginBottom: theme.spacing[4] }, containerStyle]}>
      {label ? (
        <Text
          color={state === 'error' ? 'error.DEFAULT' : 'text.secondary'}
          mb="sm"
          variant="label"
        >
          {label}
          {required ? ' *' : ''}
        </Text>
      ) : null}
      <Animated.View
        style={[
          {
            alignItems: 'center',
            backgroundColor:
              state === 'disabled'
                ? theme.colors.background.tertiary
                : semantic.inputBackground,
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
        {leftIcon ? (
          <Icon
            color={
              state === 'error' ? semantic.danger : theme.colors.text.muted
            }
            name={leftIcon}
            size="md"
          />
        ) : null}
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
              color: disabled
                ? theme.colors.text.disabled
                : theme.colors.text.primary,
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
          <Text color="text.muted" variant="caption">
            ...
          </Text>
        ) : rightIcon ? (
          <Icon color={theme.colors.text.muted} name={rightIcon} size="md" />
        ) : null}
      </Animated.View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: theme.spacing[1],
          minHeight: 20,
        }}
      >
        {message ? (
          <Text color={messageColor} flex={1} variant="caption">
            {message}
          </Text>
        ) : (
          <View />
        )}
        {showCounter && maxLength ? (
          <Text color="text.muted" ml="sm" variant="caption">
            {String(effectiveValue).length}/{maxLength}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export { FormSection, InputGroup };
export type { FormSectionProps, FormFieldProps };
export default FormField;
