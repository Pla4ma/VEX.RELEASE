import type { IconSize, IconStrokeWidth } from './types';

/**
 * Icon size values in pixels
 */
export const ICON_SIZE_VALUES: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

/**
 * Icon stroke width values
 */
export const ICON_STROKE_WIDTH_VALUES: Record<IconStrokeWidth, number> = {
  thin: 1,
  normal: 1.5,
  thick: 2,
};
