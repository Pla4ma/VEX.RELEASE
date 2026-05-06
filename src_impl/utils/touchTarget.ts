/**
 * Touch Target Utility
 *
 * Ensures all interactive elements meet minimum 44x44pt touch target size.
 * Provides hitSlop calculations and accessibility helpers.
 *
 * Phase 7C.2 — Touch target audit
 *
 * Usage:
 *   import { withMinTouchTarget, calculateHitSlop } from '@/utils/touchTarget';
 *
 *   // In component:
 *   <Pressable hitSlop={calculateHitSlop(size, minSize)} />
 *
 *   // Or use the HOC:
 *   const AccessibleButton = withMinTouchTarget(Button);
 */

import { type Insets, type ViewStyle } from 'react-native';
import { createDebugger } from './debug';

const debug = createDebugger('touch-target');

// Minimum touch target size per Apple HIG and Android guidelines
export const MIN_TOUCH_TARGET = 44;

interface TouchTargetOptions {
  /** Minimum touch target size (default: 44) */
  minSize?: number;
  /** Whether to log warnings in development */
  logWarnings?: boolean;
}

interface TouchTargetResult {
  /** Calculated hitSlop to achieve minimum size */
  hitSlop: Insets;
  /** Whether the element needs hitSlop adjustment */
  needsExpansion: boolean;
  /** Total touch target size after expansion */
  totalSize: { width: number; height: number };
}

/**
 * Calculate hitSlop needed to achieve minimum touch target size
 */
export function calculateHitSlop(
  width: number,
  height: number,
  options: TouchTargetOptions = {}
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

  // Development warnings
  if (__DEV__ && options.logWarnings) {
    if (width < minSize || height < minSize) {
      debug.warn(
        `Element ${width}x${height} is smaller than minimum ${minSize}x${minSize}. Applied hitSlop: ${JSON.stringify(hitSlop)}`
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

/**
 * Get hitSlop for a square touch target (common for icons/buttons)
 */
export function getSquareHitSlop(
  size: number,
  minSize: number = MIN_TOUCH_TARGET
): Insets {
  const slop = size < minSize ? (minSize - size) / 2 : 0;
  return {
    top: slop,
    bottom: slop,
    left: slop,
    right: slop,
  };
}

/**
 * Get hitSlop for icon buttons (typically 24x24)
 */
export function getIconHitSlop(iconSize: number = 24): Insets {
  return getSquareHitSlop(iconSize);
}

/**
 * Touch target props for Pressable/Touchable components
 */
export interface TouchTargetProps {
  /** Element width */
  width: number;
  /** Element height */
  height: number;
  /** Additional hitSlop (will be merged) */
  additionalHitSlop?: Insets;
}

/**
 * Get combined touch target props for a component
 */
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

  return {
    hitSlop: combinedHitSlop,
    accessibilityRole: 'button',
  };
}

/**
 * Style helper for minimum touch target dimensions
 */
export function getMinTouchTargetStyle(
  width?: number,
  height?: number
): ViewStyle {
  return {
    minWidth: width ?? MIN_TOUCH_TARGET,
    minHeight: height ?? MIN_TOUCH_TARGET,
  };
}

/**
 * Audit helper - checks if dimensions meet minimum requirements
 */
export function auditTouchTarget(
  name: string,
  width: number,
  height: number
): boolean {
  const isValid = width >= MIN_TOUCH_TARGET && height >= MIN_TOUCH_TARGET;

  if (__DEV__ && !isValid) {
    debug.warn(
      `${name}: ${width}x${height} violates minimum ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}`
    );
  }

  return isValid;
}

/**
 * Common hitSlop values for quick reference
 */
export const StandardHitSlops = {
  /** For 24x24 icons */
  ICON: { top: 10, bottom: 10, left: 10, right: 10 } as Insets,
  /** For 32x32 icons */
  SMALL_ICON: { top: 6, bottom: 6, left: 6, right: 6 } as Insets,
  /** For small text buttons */
  TEXT_BUTTON: { top: 8, bottom: 8, left: 12, right: 12 } as Insets,
  /** For inline links */
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
