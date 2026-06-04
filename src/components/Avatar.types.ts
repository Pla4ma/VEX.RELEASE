import type { StyleProp, ViewStyle } from 'react-native';
import { lightColors } from '@/theme/tokens/colors';


export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'away' | 'offline' | 'busy' | 'none';
export type AvatarShape = 'circle' | 'rounded' | 'square';

export interface AvatarProps {
  source?: string | { uri: string };
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  badge?: number;
  borderColor?: string;
  borderWidth?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  shape?: AvatarShape;
}

export const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
  '2xl': 96,
};

export const FONT_SIZE_MAP: Record<AvatarSize, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 24,
  '2xl': 32,
};

export const STATUS_COLOR_MAP: Record<AvatarStatus, string> = {
  online: lightColors.semantic.success,
  away: lightColors.semantic.warning,
  offline: lightColors.text.disabled,
  busy: lightColors.semantic.danger,
  none: 'transparent',
};
