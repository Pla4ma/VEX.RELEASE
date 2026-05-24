import type { SessionMode, SessionStatus, SessionPhase } from './schemas';

// Re-export types for backward compatibility
export type { SessionMode, SessionStatus, SessionPhase };

export interface SessionState {
  id: string;
  userId: string;
  status: SessionStatus;
  phase: SessionPhase;
  mode: SessionMode;
  startedAt: number;
  expectedDurationSeconds: number;
  elapsedSeconds: number;
  technique?: string;
  targetDuration?: number;
  metadata?: Record<string, unknown>;
}

export interface SessionConfig {
  mode: SessionMode;
  duration: number;
  technique?: string;
  allowPauses?: boolean;
  metadata?: Record<string, unknown>;
}

export interface FocusTechnique {
  id: string;
  name: string;
  description: string;
  defaultDuration: number;
  config: Record<string, unknown>;
}

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
