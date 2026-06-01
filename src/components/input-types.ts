import type { TextInputProps, ViewStyle } from 'react-native';

// Icon name type from registry
type IconName = string;

/**
 * Input props
 */
export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helper?: string;
  /** Left icon name */
  leftIcon?: IconName;
  /** Right icon name */
  rightIcon?: IconName;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Input style */
  inputStyle?: ViewStyle;
}
