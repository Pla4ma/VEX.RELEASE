/**
 * NearMissIndicator
 *
 * Psychological retention mechanic for challenges that expired
 * with high progress (75%+ but < 100%).
 *
 * Near-misses motivate users to try harder next time.
 * The "almost got it" feeling creates urgency to complete similar challenges.
 */

import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring, withTiming, withRepeat, withSequence, FadeInUp, FadeIn } from 'react-native-reanimated';
import { Box, Text, Button } from '@/components/primitives';
import { useTheme } from '@/theme';
import * as Sentry from '@sentry/react-native';
import { getAnalyticsService } from '@/analytics/AnalyticsService';

// ============================================================================
// Types
// ============================================================================

interface NearMissIndicatorProps {
  /** Challenge that was almost completed */
  challengeId: string;
  /** User's display name for personalization */
  userName?: string;
  /** Progress percentage (75-99%) */
  progressPercent: number;
  /** How many hours until next challenge */
  hoursUntilNext: number;
  /** Callback when user taps to acknowledge */
  onAcknowledge: () => void;
  /** Callback when user wants to see similar challenges */
  onViewNextChallenge?: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const NEAR_MISS_THRESHOLD = 75; // Minimum % to show near-miss
const COMPLETE_THRESHOLD = 100; // Must be < this

// ============================================================================
// Component
// ============================================================================
// ============================================================================
// Analytics
// ============================================================================
// ============================================================================
// Utility Hook
// ============================================================================
// ============================================================================
// Export
// ============================================================================

export default NearMissIndicator;
export { NEAR_MISS_THRESHOLD, COMPLETE_THRESHOLD };
export * from "./NearMissIndicator.types";
export * from "./NearMissIndicator.types";
export * from "./NearMissIndicator.part1";
export * from "./NearMissIndicator.part2";
