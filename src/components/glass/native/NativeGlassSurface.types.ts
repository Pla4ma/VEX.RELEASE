import type { ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

export type NativeGlassSurfaceVariant =
  | 'subtle'
  | 'regular'
  | 'hero'
  | 'nav'
  | 'pill'
  | 'sheet'
  | 'selected';

export interface NativeGlassSurfaceProps {
  children?: ReactNode;
  variant?: NativeGlassSurfaceVariant;
  radius?: number;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: ViewProps['accessibilityRole'];
  accessibilityHint?: string;
  pointerEvents?: ViewProps['pointerEvents'];
  accessible?: boolean;
}
