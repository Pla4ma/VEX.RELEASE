/**
 * Boss Critical Hit System
 *
 * Variable damage mechanic that adds excitement to boss encounters.
 * - 10% chance per session for critical hit (2x damage)
 * - Near-crit (11-20%): creates "almost got it" tension
 * - Crit tracking: "X crits this week" displayed in boss detail
 * - Overlay during session when crit is active
 *
 * This is a VARIABLE MOMENT - keeps users engaged during sessions.
 */

import { z } from 'zod';
import * as Sentry from '@sentry/react-native';
import { MMKV } from 'react-native-mmkv';

// ============================================================================
// Storage Setup
// ============================================================================

const storage = new MMKV({
  id: 'boss-crit-storage',
});

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Configuration
// ============================================================================

const CRIT_CONFIG = {
  /** Base chance for critical hit (10%) */
  BASE_CHANCE: 0.1,
  /** Range for near-miss (11-20%) */
  NEAR_MISS_MIN: 0.11,
  NEAR_MISS_MAX: 0.2,
  /** Damage multiplier when crit triggers */
  DAMAGE_MULTIPLIER: 2,
  /** Normal damage multiplier */
  NORMAL_MULTIPLIER: 1,
  /** Streak > 7 days adds crit chance */
  STREAK_BONUS: 0.02, // +2%
  /** S grade sessions have higher crit chance */
  S_GRADE_BONUS: 0.03, // +3%
} as const;

// ============================================================================
// Validation Schemas
// ============================================================================
// ============================================================================
// Core Service
// ============================================================================
// Export class and singleton
export { BossCriticalHitService };
// ============================================================================
// Convenience Functions
// ============================================================================
// ============================================================================
// Export
// ============================================================================

export { CRIT_CONFIG };
export default bossCritService;

export * from "./critical-hit-system.types";
export * from "./critical-hit-system.part1";
export * from "./critical-hit-system.part2";
