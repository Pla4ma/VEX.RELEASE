/**
 * Adaptive Difficulty Service
 *
 * Analyzes user performance over recent sessions and suggests
 * difficulty adjustments to optimize the challenge-reward balance.
 *
 * Logic:
 * - If last 5 sessions on CASUAL all S-grade → suggest FOCUSED (+100% XP)
 * - If last 5 sessions on FOCUSED all C/D grade → suggest CASUAL
 */

// Local type definition for session data
interface SessionData {
  id: string;
  grade?: string;
  purityScore?: number;
  duration?: number;
  createdAt?: string;
}

type SessionDifficulty = 'CASUAL' | 'FOCUSED' | 'INTENSE';
// Grade to numeric conversion for averaging
const GRADE_VALUES: Record<string, number> = {
  'S': 5,
  'A': 4,
  'B': 3,
  'C': 2,
  'D': 1,
};

// Minimum sessions needed for a suggestion
const MIN_SESSIONS = 5;

// Thresholds for suggestions
const UPGRADE_THRESHOLD = 4.5; // Average grade >= 4.5 (mostly S)
const DOWNGRADE_THRESHOLD = 2.5; // Average grade <= 2.5 (mostly C/D)

// Required purity for upgrade
const UPGRADE_MIN_PURITY = 85;

// Maximum purity for downgrade consideration
const DOWNGRADE_MAX_PURITY = 60;

/**
 * Get encouraging message based on current performance
 */
function getEncouragementMessage(
  currentDifficulty: SessionDifficulty,
  averageGrade: number
): string {
  if (averageGrade >= 4.0) {
    return 'You are performing well at this difficulty. Keep it up!';
  }
  if (averageGrade >= 3.0) {
    return 'You are finding your rhythm. Consistency is key.';
  }
  return 'Focus on completing sessions. Progress comes with practice.';
}

export * from "./adaptiveDifficulty.types";
export * from "./adaptiveDifficulty.part1";
