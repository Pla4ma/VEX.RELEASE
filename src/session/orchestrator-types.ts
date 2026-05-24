/**
 * Session Orchestrator Types
 * Type definitions for the session orchestration system
 */

import type { TimerConfig } from "./types";

export interface OrchestratorConfig {
  timerConfig?: Partial<TimerConfig>;
  enableAntiCheat?: boolean;
  enableAutoRecovery?: boolean;
  enableBackgroundTracking?: boolean;
  pauseOnBackground?: boolean;
  pauseThreshold?: number;
}

export interface OrchestratorState {
  isActive: boolean;
  countdownActive: boolean;
  lastSessionSummary: unknown | null;
}

// Session state tracking
export interface SessionTrackingState {
  interruptions: number;
  pauses: number;
  backgroundTime: number;
  effectiveTime: number;
}
