/**
 * Coach Event Definitions
 *
 * Event interfaces for the AI coach system: triggers, session feedback,
 * reminders, comebacks, challenge suggestions, and streak warnings.
 */

export type CoachEventType =
  | "coach:trigger"
  | "coach:session_feedback"
  | "coach:reminder"
  | "coach:comeback"
  | "coach:challenge_suggestion"
  | "coach:streak_warning";

export interface CoachTriggerEvent {
  userId: string;
  trigger?:
    | "streak_at_risk"
    | "session_abandoned"
    | "comeback_opportunity"
    | "challenge_reminder"
    | "focus_dip"
    | "milestone_near"
    | string;
  triggerType?: string;
  context?: Record<string, unknown>;
  data?: Record<string, unknown>;
  priority?: "low" | "medium" | "high" | "urgent";
}

export interface CoachSessionFeedbackEvent {
  userId: string;
  sessionId: string;
  feedback: {
    type: "encouragement" | "tip" | "celebration" | "warning";
    message: string;
    action?: { label: string; route: string; params?: Record<string, unknown> };
  };
  context: {
    duration: number;
    quality: number;
    streakDay: number;
    interruptions: number;
  };
}

export interface CoachComebackEvent {
  userId: string;
  daysSinceLastSession: number;
  previousStreak: number;
  suggestedDifficulty: "easy" | "normal" | "hard";
  welcomeBackMessage: string;
  recoveryChallenge?: {
    id: string;
    title: string;
    description: string;
    reward: string;
  };
}
