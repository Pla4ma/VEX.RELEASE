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

export interface DifficultySuggestion {
  suggestion: SessionDifficulty | null;
  reason: string;
  confidence: 'low' | 'medium' | 'high';
  stats: {
    sessionsAnalyzed: number;
    averageGrade: number;
    averagePurity: number;
  };
}

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
 * Analyze recent sessions and generate difficulty suggestion
 */
export function getAdaptiveDifficultySuggestion(
  recentSessions: SessionData[],
  currentDifficulty: SessionDifficulty
): DifficultySuggestion {
  // Filter sessions with valid grades
  const validSessions = recentSessions
    .filter(s => s.grade && GRADE_VALUES[s.grade] !== undefined)
    .slice(0, MIN_SESSIONS);

  if (validSessions.length < MIN_SESSIONS) {
    return {
      suggestion: null,
      reason: 'Complete ' + (MIN_SESSIONS - validSessions.length) + ' more sessions to get personalized difficulty suggestions.',
      confidence: 'low',
      stats: {
        sessionsAnalyzed: validSessions.length,
        averageGrade: 0,
        averagePurity: 0,
      },
    };
  }

  // Calculate statistics
  const gradeSum = validSessions.reduce((sum, s) => {
    const gradeValue = s.grade ? GRADE_VALUES[s.grade] : undefined;
    return sum + (gradeValue || 0);
  }, 0);
  const averageGrade = gradeSum / validSessions.length;

  const puritySum = validSessions.reduce((sum, s) => sum + (s.purityScore || 0), 0);
  const averagePurity = puritySum / validSessions.length;

  const stats = {
    sessionsAnalyzed: validSessions.length,
    averageGrade,
    averagePurity,
  };

  // Generate suggestion based on current difficulty
  switch (currentDifficulty) {
    case 'CASUAL':
      if (averageGrade >= UPGRADE_THRESHOLD && averagePurity >= UPGRADE_MIN_PURITY) {
        return {
          suggestion: 'FOCUSED',
          reason: 'You are crushing CASUAL difficulty. Ready for FOCUSED? You will earn 2x XP.',
          confidence: averageGrade >= 4.8 ? 'high' : 'medium',
          stats,
        };
      }
      break;

    case 'FOCUSED':
      if (averageGrade <= DOWNGRADE_THRESHOLD && averagePurity <= DOWNGRADE_MAX_PURITY) {
        return {
          suggestion: 'CASUAL',
          reason: 'FOCUSED is challenging for you right now. Drop to CASUAL to rebuild momentum.',
          confidence: averageGrade <= 2.0 ? 'high' : 'medium',
          stats,
        };
      }
      if (averageGrade >= UPGRADE_THRESHOLD && averagePurity >= UPGRADE_MIN_PURITY) {
        return {
          suggestion: 'INTENSE',
          reason: 'You have mastered FOCUSED. Try INTENSE for maximum rewards.',
          confidence: 'medium',
          stats,
        };
      }
      break;

    case 'INTENSE':
      if (averageGrade <= DOWNGRADE_THRESHOLD && averagePurity <= DOWNGRADE_MAX_PURITY) {
        return {
          suggestion: 'FOCUSED',
          reason: 'INTENSE might be too punishing. FOCUSED offers better consistency.',
          confidence: averageGrade <= 2.0 ? 'high' : 'medium',
          stats,
        };
      }
      break;
  }

  // No suggestion needed
  return {
    suggestion: null,
    reason: getEncouragementMessage(currentDifficulty, averageGrade),
    confidence: 'low',
    stats,
  };
}

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

/**
 * Check if suggestion should be shown (rate limiting)
 */
export function shouldShowSuggestion(
  lastShownAt: number | null,
  minIntervalMs: number = 24 * 60 * 60 * 1000 // 24 hours
): boolean {
  if (!lastShownAt) {
    return true;
  }
  return Date.now() - lastShownAt >= minIntervalMs;
}

/**
 * Get difficulty display name
 */
export function getDifficultyDisplayName(difficulty: SessionDifficulty): string {
  const names: Record<SessionDifficulty, string> = {
    'CASUAL': 'Casual',
    'FOCUSED': 'Focused',
    'INTENSE': 'Intense',
  };
  return names[difficulty] || difficulty;
}

/**
 * Get XP multiplier for difficulty
 */
export function getDifficultyXPMultiplier(difficulty: SessionDifficulty): number {
  const multipliers: Record<SessionDifficulty, number> = {
    'CASUAL': 1,
    'FOCUSED': 2,
    'INTENSE': 3,
  };
  return multipliers[difficulty] || 1;
}
