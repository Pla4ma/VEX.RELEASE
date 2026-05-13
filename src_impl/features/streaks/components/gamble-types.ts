/**
 * Streak Gamble Types & Constants
 * Types and magic numbers for the streak gamble prompt mechanic.
 */

// ============================================================================
// Types
// ============================================================================

export interface StreakGamblePromptProps {
  streakDays: number;
  hoursRemaining: number;
  shieldsAvailable: number;
  userLevel: number;
  onUseShield: () => void;
  onGamble: () => void;
  onDismiss: () => void;
  onSessionComplete?: (grade: 'S' | 'A' | 'B' | 'C' | 'D') => void;
}

export type GambleState = 'prompt' | 'gambling' | 'won' | 'lost';

export interface GambleOutcome {
  success: boolean;
  grade: string;
  xpEarned: number;
  shieldPreserved: boolean;
}

// ============================================================================
// Constants
// ============================================================================

export const CRITICAL_HOURS_THRESHOLD = 3;
export const GAMBLE_SUCCESS_GRADES = ['S', 'A'];
export const GAMBLE_BONUS_XP = 50;
