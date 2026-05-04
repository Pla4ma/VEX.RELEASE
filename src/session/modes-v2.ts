/**
 * Session Modes V2 - Consolidated Mode System
 *
 * Phase 1 Core Loop Revolution
 * Transforms 5 confusing modes into 3 meaningful choices
 *
 * Modes:
 * - FLOW: Standard productivity (balanced difficulty, standard rewards)
 * - CHALLENGE: Test limits (no pauses, harder bosses, 2x rewards)
 * - RECOVERY: After failure (easier targets, reduced penalties, comeback bonus)
 *
 * Dependencies:
 * - feature-flags (for gradual rollout)
 * - session/SessionOrchestrator (mode selection)
 * - features/boss (difficulty scaling)
 */

import { z } from 'zod';
import { featureFlags } from '../feature-flags/FeatureFlagEngine';

// ============================================================================
// New Consolidated Mode Enum
// ============================================================================

export enum SessionModeV2 {
  FLOW = 'FLOW',           // Standard productivity
  CHALLENGE = 'CHALLENGE', // Hard mode, high rewards
  RECOVERY = 'RECOVERY',   // Easy mode, after failure
}

export const SessionModeV2Schema = z.nativeEnum(SessionModeV2);

// ============================================================================
// Mode Configuration
// ============================================================================

export type CompanionModeBehaviorV2 =
  | 'focused'      // FLOW: Steady, encouraging
  | 'intense'      // CHALLENGE: Demanding, high stakes
  | 'gentle';      // RECOVERY: Supportive, forgiving

export interface SessionModeV2Config {
  // Display
  name: string;
  description: string;
  icon: string;
  color: string;

  // Difficulty
  bossHealthMultiplier: number;
  bossAttackFrequency: number; // attacks per 10 minutes
  pausePenaltyMultiplier: number;
  purityPassThreshold: number;

  // Rewards
  xpMultiplier: number;
  coinMultiplier: number;
  gemDropChance: number; // 0-1

  // Restrictions
  allowPauses: boolean;
  maxPauses: number;
  minimumDurationMinutes: number;
  maximumDurationMinutes: number;

  // Scoring weights
  scoringWeights: {
    consistency: number;
    depth: number;
    recovery: number;
  };

  // Behavior
  companionBehavior: CompanionModeBehaviorV2;
  comebackBonusActive: boolean;
}

// ============================================================================
// Mode Configurations
// ============================================================================

export const SESSION_MODE_V2_CONFIG: Record<SessionModeV2, SessionModeV2Config> = {
  [SessionModeV2.FLOW]: {
    name: 'Flow',
    description: 'Standard productivity session with balanced difficulty',
    icon: '🌊',
    color: '#3B82F6', // blue-500

    // Balanced difficulty
    bossHealthMultiplier: 1.0,
    bossAttackFrequency: 2, // 2 attacks per 10 min
    pausePenaltyMultiplier: 1.0,
    purityPassThreshold: 75,

    // Standard rewards
    xpMultiplier: 1.0,
    coinMultiplier: 1.0,
    gemDropChance: 0.05, // 5% chance

    // Moderate restrictions
    allowPauses: true,
    maxPauses: 3,
    minimumDurationMinutes: 15,
    maximumDurationMinutes: 120,

    // Balanced scoring
    scoringWeights: { consistency: 0.35, depth: 0.35, recovery: 0.30 },

    // Steady companion
    companionBehavior: 'focused',
    comebackBonusActive: false,
  },

  [SessionModeV2.CHALLENGE]: {
    name: 'Challenge',
    description: 'No pauses allowed. Harder bosses. Double rewards.',
    icon: '🔥',
    color: '#EF4444', // red-500

    // High difficulty
    bossHealthMultiplier: 1.5,
    bossAttackFrequency: 4, // 4 attacks per 10 min (intense!)
    pausePenaltyMultiplier: 2.0, // Pauses hurt more
    purityPassThreshold: 85,

    // High rewards
    xpMultiplier: 2.0,
    coinMultiplier: 2.0,
    gemDropChance: 0.15, // 15% chance

    // Strict restrictions
    allowPauses: false,
    maxPauses: 0,
    minimumDurationMinutes: 25,
    maximumDurationMinutes: 90,

    // Purity-weighted scoring
    scoringWeights: { consistency: 0.45, depth: 0.45, recovery: 0.10 },

    // Intense companion
    companionBehavior: 'intense',
    comebackBonusActive: false,
  },

  [SessionModeV2.RECOVERY]: {
    name: 'Recovery',
    description: 'Gentle session after a setback. Reduced pressure.',
    icon: '🌱',
    color: '#10B981', // emerald-500

    // Easy difficulty
    bossHealthMultiplier: 0.7,
    bossAttackFrequency: 1, // 1 attack per 10 min
    pausePenaltyMultiplier: 0.5, // Pauses hurt less
    purityPassThreshold: 65,

    // Reduced but boosted rewards (comeback mechanics)
    xpMultiplier: 0.8,
    coinMultiplier: 0.8,
    gemDropChance: 0.02, // 2% chance

    // Forgiving restrictions
    allowPauses: true,
    maxPauses: 5,
    minimumDurationMinutes: 10,
    maximumDurationMinutes: 60,

    // Recovery-weighted scoring
    scoringWeights: { consistency: 0.20, depth: 0.30, recovery: 0.50 },

    // Supportive companion
    companionBehavior: 'gentle',
    comebackBonusActive: true, // Special comeback XP bonus
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

export function resolveSessionModeV2(input: unknown): SessionModeV2 {
  const parsed = SessionModeV2Schema.safeParse(input);
  return parsed.success ? parsed.data : SessionModeV2.FLOW;
}

export function getSessionModeV2Config(mode: unknown): SessionModeV2Config {
  return SESSION_MODE_V2_CONFIG[resolveSessionModeV2(mode)];
}

/**
 * Determine best mode for user based on their state
 */
export function recommendSessionModeV2(
  lastSessionFailed: boolean,
  currentStreak: number,
  averagePurityLast7Days: number
): SessionModeV2 {
  // Default to flow
  let recommended = SessionModeV2.FLOW;

  // Recovery mode if last session failed or low streak
  if (lastSessionFailed || currentStreak < 2) {
    recommended = SessionModeV2.RECOVERY;
  }

  // Challenge mode if performing well
  if (currentStreak >= 7 && averagePurityLast7Days >= 80) {
    recommended = SessionModeV2.CHALLENGE;
  }

  return recommended;
}

/**
 * Check if user is eligible for a specific mode
 */
export function isModeEligibleV2(
  mode: SessionModeV2,
  userLevel: number,
  hasCompletedTutorial: boolean
): { eligible: boolean; reason?: string } {
  // Everyone can use FLOW
  if (mode === SessionModeV2.FLOW) {
    return { eligible: true };
  }

  // Must complete tutorial for other modes
  if (!hasCompletedTutorial) {
    return { eligible: false, reason: 'Complete tutorial to unlock' };
  }

  // CHALLENGE requires level 5+
  if (mode === SessionModeV2.CHALLENGE && userLevel < 5) {
    return { eligible: false, reason: 'Reach level 5 to unlock Challenge mode' };
  }

  // RECOVERY is always available (for struggling users)
  if (mode === SessionModeV2.RECOVERY) {
    return { eligible: true };
  }

  return { eligible: true };
}

/**
 * Migration function from old 5-mode system to new 3-mode
 */
export function migrateOldModeToV2(oldMode: string): SessionModeV2 {
  switch (oldMode) {
    case 'DEEP_WORK':
      return SessionModeV2.CHALLENGE;
    case 'LIGHT_FOCUS':
      return SessionModeV2.FLOW;
    case 'STUDY':
      return SessionModeV2.FLOW;
    case 'CREATIVE':
      return SessionModeV2.FLOW;
    case 'SPRINT':
      return SessionModeV2.CHALLENGE;
    default:
      return SessionModeV2.FLOW;
  }
}

/**
 * Get mode selector options for UI
 */
export function getModeSelectorOptionsV2(
  userLevel: number,
  hasCompletedTutorial: boolean,
  lastSessionFailed: boolean
): Array<{
  mode: SessionModeV2;
  config: SessionModeV2Config;
  eligible: boolean;
  reason?: string;
  recommended: boolean;
}> {
  const modes = [SessionModeV2.FLOW, SessionModeV2.CHALLENGE, SessionModeV2.RECOVERY];

  return modes.map((mode) => {
    const eligibility = isModeEligibleV2(mode, userLevel, hasCompletedTutorial);
    const recommended =
      (lastSessionFailed && mode === SessionModeV2.RECOVERY) ||
      (!lastSessionFailed && mode === SessionModeV2.FLOW);

    return {
      mode,
      config: SESSION_MODE_V2_CONFIG[mode],
      eligible: eligibility.eligible,
      reason: eligibility.reason,
      recommended,
    };
  });
}

// ============================================================================
// Backward Compatibility Helpers
// ============================================================================

/**
 * Check if consolidated modes feature is enabled
 */
export function isConsolidatedModesEnabled(): boolean {
  return featureFlags.isEnabled('consolidated_session_modes');
}

/**
 * Get active mode config (v1 or v2 based on feature flag)
 */
export function getActiveModeConfig(mode: unknown): {
  name: string;
  description: string;
  xpMultiplier: number;
  allowPauses: boolean;
} {
  if (isConsolidatedModesEnabled()) {
    const v2Config = getSessionModeV2Config(mode);
    return {
      name: v2Config.name,
      description: v2Config.description,
      xpMultiplier: v2Config.xpMultiplier,
      allowPauses: v2Config.allowPauses,
    };
  }

  // Legacy fallback
  return {
    name: 'Standard',
    description: 'Focus session',
    xpMultiplier: 1.0,
    allowPauses: true,
  };
}
