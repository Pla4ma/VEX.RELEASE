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

export * from "./touchTarget.types";
export * from "./touchTarget.part1";
