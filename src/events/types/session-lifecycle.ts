export interface SessionLifecycleEventDefinitions {
  'session:created': {
    sessionId: string;
    userId: string;
    config: unknown;
    timestamp: number;
  };
  'session:starting': {
    sessionId: string;
    countdown: number;
    timestamp: number;
  };
  'session:started': { sessionId: string; startedAt: number; phase: string };
  'session:paused': {
    sessionId: string;
    pausedAt: number;
    reason?: string;
    userId: string;
  };
  'session:resumed': {
    sessionId: string;
    resumedAt: number;
    pausedDuration: number;
    userId: string;
  };
  'session:phase:changed': {
    sessionId: string;
    previousPhase: string;
    newPhase: string;
    timestamp: number;
  };
  'session:interval:completed': {
    sessionId: string;
    interval: number;
    totalIntervals: number;
    timestamp: number;
  };
  'session:completing': {
    sessionId: string;
    timestamp: number;
    completionPercentage: number;
  };
  'session:completed': {
    sessionId: string;
    userId: string;
    summary?: unknown;
    timestamp: number;
    duration: number;
    quality?: number;
  };
  'session:partial': {
    sessionId: string;
    userId: string;
    summary: unknown;
    timestamp: number;
    partialReason: string;
  };
  'session:abandoned': {
    sessionId: string;
    userId: string;
    abandonedAt: number;
    reason?: string;
    elapsedTime: number;
  };
  'session:failed': {
    sessionId: string;
    userId: string;
    error: string;
    timestamp: number;
    canRecover: boolean;
  };
  'session:tick': {
    sessionId: string;
    elapsed: number;
    remaining: number;
    percentage: number;
    phase: string;
  };
  'session:progress': {
    sessionId: string;
    phase: string;
    interval: number;
    percentage: number;
    timeRemaining: number;
  };
  'session:difficulty_selected': { difficulty: string; timestamp: number };
  'session:stakes_completed': {
    userId: string;
    sessionId: string;
    difficulty: string;
    completed: boolean;
    winStreakUpdated?: number;
    timestamp?: number;
  };
  'session:mode_phases': {
    userId: string;
    sessionId: string;
    mode: string;
    phase: string;
    timestamp: number;
  };
}
