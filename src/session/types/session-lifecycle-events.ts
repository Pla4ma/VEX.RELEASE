import type {
  SessionState,
  SessionSummary,
  InterruptionRecord,
  RecoveryRecord,
  AntiCheatFlag,
} from "./index";

export interface SessionLifecycleEvents {
  "session:created": {
    sessionId: string;
    userId: string;
    config: unknown;
    timestamp: number;
  };
  "session:starting": {
    sessionId: string;
    countdown: number;
    timestamp: number;
  };
  "session:started": { sessionId: string; startedAt: number; phase: string };
  "session:paused": {
    sessionId: string;
    pausedAt: number;
    reason?: string;
    userId: string;
  };
  "session:resumed": {
    sessionId: string;
    resumedAt: number;
    pausedDuration: number;
    userId: string;
  };
  "session:phase:changed": {
    sessionId: string;
    previousPhase: string;
    newPhase: string;
    timestamp: number;
  };
  "session:interval:completed": {
    sessionId: string;
    interval: number;
    totalIntervals: number;
    timestamp: number;
  };
  "session:completing": {
    sessionId: string;
    timestamp: number;
    completionPercentage: number;
  };
  "session:completed": {
    sessionId: string;
    userId: string;
    summary: SessionSummary;
    timestamp: number;
  };
  "session:partial": {
    sessionId: string;
    userId: string;
    summary: SessionSummary;
    timestamp: number;
    partialReason: string;
  };
  "session:abandoned": {
    sessionId: string;
    userId: string;
    abandonedAt: number;
    reason?: string;
    elapsedTime: number;
  };
  "session:failed": {
    sessionId: string;
    userId: string;
    error: string;
    timestamp: number;
    canRecover: boolean;
  };
}
