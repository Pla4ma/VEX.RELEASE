/**
 * Focus Identity Event Definitions
 *
 * Events for the Focus Identity Protocol (FIP) - credit-score style
 * productivity identity system.
 */

export interface FocusIdentityEventDefinitions {
  'focus-identity:score_updated': {
    userId: string;
    previousScore: number;
    newScore: number;
    delta: number;
    band: string;
    timestamp: number;
  };
  FOCUS_IDENTITY_CREATED: {
    userId: string;
    initialScore: number;
    band: string;
  };

  FOCUS_SCORE_UPDATED: {
    userId: string;
    previousScore: number;
    newScore: number;
    change: number;
    band: string;
    isInRecovery: boolean;
  };

  FOCUS_SCORE_BAND_CHANGE: {
    userId: string;
    oldBand: string;
    newBand: string;
    newScore: number;
  };

  FOCUS_RECOVERY_COMPLETE: {
    userId: string;
    finalScore: number;
  };

  ANCHOR_PROMPT_TRIGGERED: {
    userId: string;
    anchorId: string;
    promptId: string;
    message: string;
    implementationIntention: string;
    sessionPreset: {
      duration: number;
      mode: string;
    };
    streak: number;
  };

  ANCHOR_PROMPT_RESPONDED: {
    userId: string;
    anchorId: string;
    promptId: string;
    response: 'SNOOZED' | 'STARTED' | 'COMPLETED' | 'DISMISSED';
    consistency: number;
    currentStreak: number;
  };

  ANCHOR_STREAK_MILESTONE: {
    userId: string;
    anchorId: string;
    streak: number;
    implementationIntention: string;
  };

  HABIT_ANCHOR_CREATED: {
    userId: string;
    anchorId: string;
    type: string;
    implementationIntention: string;
  };
  FOCUS_XP_MULTIPLIER_UPDATED: {
    userId: string;
    multiplier: number;
    score?: number;
    band?: string;
  };

  MONTHLY_REPORT_VIEWED: {
    userId: string;
    month: string;
    grade: string;
    change: number;
    timestamp: number;
  };

  MONTHLY_REPORT_SHARED: {
    userId: string;
    month: string;
    grade: string;
    platform?: string;
    timestamp: number;
  };

  MONTHLY_REPORT_DISMISSED: {
    userId: string;
    month: string;
    timestamp: number;
  };
}
