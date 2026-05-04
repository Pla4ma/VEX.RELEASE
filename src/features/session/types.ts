import type { SessionMode, SessionStatus } from './schemas';

export interface ActiveSessionConfig {
  mode: SessionMode;
  allowPauses: boolean;
  maxPauses: number;
  minFocusSecondsBeforePause: number;
  pauseCooldownSeconds: number;
  allowBackground: boolean;
  maxBackgroundSeconds: number;
  strictMode: boolean;
  companionEnabled: boolean;
  coachEnabled: boolean;
  coachCooldownSeconds: number;
}

export interface SessionStateTransition {
  from: SessionStatus;
  to: SessionStatus;
  triggeredBy: 'USER' | 'SYSTEM' | 'TIMER' | 'ERROR' | 'RECOVERY';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface ModeSpecificUI {
  theme: 'dark' | 'light' | 'creative' | 'study' | 'energetic';
  companionPosition: 'bottom' | 'side' | 'hidden';
  showProgressBar: boolean;
  showPurityIndicator: boolean;
  showStreakFlame: boolean;
  allowMoodLogging: boolean;
  allowNotes: boolean;
}

export interface CoachInterventionRule {
  id: string;
  trigger: 'PAUSE' | 'RESUME' | 'MILESTONE' | 'STREAK_RISK' | 'LOW_PURITY' | 'IDLE';
  cooldownSeconds: number;
  maxPerSession: number;
  messageTemplate: string;
  priority: number;
}
