import { type Insets, type ViewStyle } from 'react-native';
import { createDebugger } from './debug';
const debug = createDebugger('touch-target');
export const MIN_TOUCH_TARGET = 44;
interface TouchTargetOptions {
  minSize?: number;
  logWarnings?: boolean;
}
interface TouchTargetResult {
  hitSlop: Insets;
  needsExpansion: boolean;
  totalSize: { width: number; height: number };
}
export function calculateHitSlop(
  width: number,
  height: number,
  options: TouchTargetOptions = {},
): TouchTargetResult {
  const minSize = options.minSize ?? MIN_TOUCH_TARGET;
  const needsWidthExpansion = width < minSize;
  const needsHeightExpansion = height < minSize;
  const horizontalSlop = needsWidthExpansion ? (minSize - width) / 2 : 0;
  const verticalSlop = needsHeightExpansion ? (minSize - height) / 2 : 0;
  const hitSlop: Insets = {
    top: verticalSlop,
    bottom: verticalSlop,
    left: horizontalSlop,
    right: horizontalSlop,
  };
  if (__DEV__ && options.logWarnings) {
    if (width < minSize || height < minSize) {
      debug.warn(
        `Element ${width}x${height} is smaller than minimum ${minSize}x${minSize}. Applied hitSlop: ${JSON.stringify(hitSlop)}`,
      );
    }
  }
  return {
    hitSlop,
    needsExpansion: needsWidthExpansion || needsHeightExpansion,
    totalSize: {
      width: Math.max(width, minSize),
      height: Math.max(height, minSize),
    },
  };
}
export function getSquareHitSlop(
  size: number,
  minSize: number = MIN_TOUCH_TARGET,
): Insets {
  const slop = size < minSize ? (minSize - size) / 2 : 0;
  return { top: slop, bottom: slop, left: slop, right: slop };
}
export function getIconHitSlop(iconSize: number = 24): Insets {
  return getSquareHitSlop(iconSize);
}
export interface TouchTargetProps {
  width: number;
  height: number;
  additionalHitSlop?: Insets;
}
export function getTouchTargetProps({
  width,
  height,
  additionalHitSlop,
}: TouchTargetProps): {
  hitSlop: Insets;
  accessibilityRole: 'button' | 'link' | 'none';
} {
  const { hitSlop } = calculateHitSlop(width, height);
  const combinedHitSlop: Insets = additionalHitSlop
    ? {
        top: (hitSlop.top ?? 0) + (additionalHitSlop.top ?? 0),
        bottom: (hitSlop.bottom ?? 0) + (additionalHitSlop.bottom ?? 0),
        left: (hitSlop.left ?? 0) + (additionalHitSlop.left ?? 0),
        right: (hitSlop.right ?? 0) + (additionalHitSlop.right ?? 0),
      }
    : hitSlop;
  return { hitSlop: combinedHitSlop, accessibilityRole: 'button' };
}
export function getMinTouchTargetStyle(
  width?: number,
  height?: number,
): ViewStyle {
  return {
    minWidth: width ?? MIN_TOUCH_TARGET,
    minHeight: height ?? MIN_TOUCH_TARGET,
  };
}
export function auditTouchTarget(
  name: string,
  width: number,
  height: number,
): boolean {
  const isValid = width >= MIN_TOUCH_TARGET && height >= MIN_TOUCH_TARGET;
  if (__DEV__ && !isValid) {
    debug.warn(
      `${name}: ${width}x${height} violates minimum ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}`,
    );
  }
  return isValid;
}
export const StandardHitSlops = {
  ICON: { top: 10, bottom: 10, left: 10, right: 10 } as Insets,
  SMALL_ICON: { top: 6, bottom: 6, left: 6, right: 6 } as Insets,
  TEXT_BUTTON: { top: 8, bottom: 8, left: 12, right: 12 } as Insets,
  LINK: { top: 12, bottom: 12, left: 8, right: 8 } as Insets,
} as const;
export default {
  MIN_TOUCH_TARGET,
  calculateHitSlop,
  getSquareHitSlop,
  getIconHitSlop,
  getTouchTargetProps,
  getMinTouchTargetStyle,
  auditTouchTarget,
  StandardHitSlops,
};
