/**
 * CriticalHitOverlay
 *
 * Shows during active session when crit chance is active.
 * Encourages users to maintain focus for the critical hit.
 * Also shows near-miss status after session if applicable.
 */

import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence, FadeIn, FadeOut } from 'react-native-reanimated';
import { Box, Text } from '@/components/primitives';
import { useTheme } from '@/theme';
import { CritStatus, getCritStatusText, bossCritService } from '../critical-hit-system';

// ============================================================================
// Types
// ============================================================================

interface CriticalHitOverlayProps {
  /** Active session ID */
  sessionId: string;
  /** Whether to show the overlay (controlled by parent) */
  visible: boolean;
  /** Called when user dismisses the overlay */
  onDismiss: () => void;
  /** Boss name for personalization */
  bossName?: string;
}

interface NearMissDisplayProps {
  /** Near-miss percentage (e.g., 97%) */
  nearMissPercent: number;
  /** Base damage that would have been dealt */
  baseDamage: number;
  /** What damage WOULD have been with crit */
  potentialCritDamage: number;
}

// ============================================================================
// Main Component: Active Session Overlay
// ============================================================================
// ============================================================================
// Near-Miss Display (shown after session)
// ============================================================================
// ============================================================================
// Crit Stats Display (for Boss Detail Screen)
// ============================================================================

interface CritStatsBadgeProps {
  userId: string;
}

// ============================================================================
// Hook for session integration
// ============================================================================
// ============================================================================
// Export
// ============================================================================

export { CritStatus };
export default CriticalHitOverlay;

export * from "./CriticalHitOverlay.types";
export * from "./CriticalHitOverlay.types";
export * from "./CriticalHitOverlay.part1";
export * from "./CriticalHitOverlay.part2";
