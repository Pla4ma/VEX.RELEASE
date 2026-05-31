import type { TextInputProps, TextStyle, ViewStyle } from 'react-native';

export type FieldSize = 'sm' | 'md' | 'lg';

export type FieldState =
  | 'default'
  | 'focused'
  | 'error'
  | 'success'
  | 'disabled'
  | 'loading';

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

export const sizeConfig = {
  sm: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    minHeight: 44,
  },
  md: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    fontSize: 16,
    minHeight: 52,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 17,
    minHeight: 58,
  },
};
