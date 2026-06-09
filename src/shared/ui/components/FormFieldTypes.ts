import type { ViewStyle } from 'react-native';

export type FieldState = 'default' | 'focused' | 'error' | 'success' | 'loading' | 'disabled';

export interface FormFieldProps {
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
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: string;
  rightIcon?: string;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  onValidate?: (text: string) => string | null;
  onChangeText?: (text: string) => void;
  value?: string;
  defaultValue?: string;
}

export const sizeConfig = {
  sm: { minHeight: 40, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  md: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
  lg: { minHeight: 56, paddingHorizontal: 20, paddingVertical: 16, fontSize: 16 },
};
