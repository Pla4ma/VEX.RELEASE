import type {
  SessionState,
  SessionSummary,
  InterruptionRecord,
  RecoveryRecord,
  AntiCheatFlag,
} from "./index";
export interface SessionEventChannels {
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
  "session:tick": {
    sessionId: string;
    elapsed: number;
    remaining: number;
    percentage: number;
    phase: string;
  };
  "session:progress": {
    sessionId: string;
    phase: string;
    interval: number;
    percentage: number;
    timeRemaining: number;
  };
  "session:interruption": {
    sessionId: string;
    interruption: InterruptionRecord;
    userId: string;
  };
  "session:interruption:risk": {
    sessionId: string;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    timeUntilRisk: number;
    userId: string;
  };
  "session:backgrounded": {
    sessionId: string;
    userId: string;
    backgroundedAt: number;
  };
  "session:foregrounded": {
    sessionId: string;
    userId: string;
    foregroundedAt: number;
    duration: number;
  };
  "session:recovery:attempted": {
    sessionId: string;
    recovery: RecoveryRecord;
    userId: string;
  };
  "session:recovery:successful": {
    sessionId: string;
    userId: string;
    recoveredAt: number;
    recoveredTime: number;
  };
  "session:recovery:failed": {
    sessionId: string;
    userId: string;
    failedAt: number;
    reason: string;
  };
  "session:score:updated": {
    sessionId: string;
    userId: string;
    score: number;
    previousScore: number;
    reason: string;
  };
  "session:bonus:earned": {
    sessionId: string;
    userId: string;
    type: string;
    amount: number;
    description: string;
  };
  "session:damage:taken": {
    sessionId: string;
    userId: string;
    amount: number;
    reason: string;
    remainingHealth?: number;
  };
  "session:anticheat:flag": {
    sessionId: string;
    userId: string;
    flag: AntiCheatFlag;
  };
  "session:anticheat:cleared": {
    sessionId: string;
    userId: string;
    clearedAt: number;
  };
  "session:sync:started": {
    sessionId: string;
    userId: string;
    timestamp: number;
  };
  "session:sync:completed": {
    sessionId: string;
    userId: string;
    timestamp: number;
  };
  "session:sync:failed": {
    sessionId: string;
    userId: string;
    error: string;
    timestamp: number;
    willRetry: boolean;
  };
  "session:conflict:detected": {
    sessionId: string;
    userId: string;
    localState: SessionState;
    remoteState: SessionState;
  };
  "session:conflict:resolved": {
    sessionId: string;
    userId: string;
    resolution: "LOCAL" | "REMOTE" | "MERGED";
    timestamp: number;
  };
  "session:streak:maintained": {
    sessionId: string;
    userId: string;
    streakDays: number;
    timestamp: number;
  };
  "session:streak:broken": {
    sessionId: string;
    userId: string;
    previousStreak: number;
    timestamp: number;
  };
  "session:streak:protected": {
    sessionId: string;
    userId: string;
    protectionType: string;
    timestamp: number;
  };
  "session:rewards:calculated": {
    sessionId: string;
    userId: string;
    rewards: { xp: number; coins: number; gems: number; bonuses: string[] };
    timestamp: number;
  };
  "session:rewards:granted": {
    sessionId: string;
    userId: string;
    rewards: unknown;
    timestamp: number;
  };
  "session:notification": {
    sessionId: string;
    type: string;
    title: string;
    body: string;
    priority: "low" | "normal" | "high" | "urgent";
    data?: Record<string, unknown>;
  };
  "session:analytics:milestone": {
    sessionId: string;
    userId: string;
    milestone: string;
    value: number;
    timestamp: number;
  };
  "session:analytics:engagement": {
    sessionId: string;
    userId: string;
    metric: string;
    value: number;
    timestamp: number;
  };
}
export type SessionEventChannel = keyof SessionEventChannels;
export type SessionEventPayload<T extends SessionEventChannel> =
  SessionEventChannels[T];
