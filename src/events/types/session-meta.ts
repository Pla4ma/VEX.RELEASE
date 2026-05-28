export interface SessionMetaEventDefinitions {
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
    rewards: unknown;
    challengesProgressed: Array<{ challengeId: string; progress: number }>;
    milestoneReached: string | null;
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
  "sessions:completed": {
    sessionId: string;
    userId: string;
    summary?: unknown;
    timestamp: number;
    duration: number;
    quality?: number;
    qualityScore?: number;
    streakDays?: number;
    squadMultiplier?: number;
    bossActive?: boolean;
    perfectSession?: boolean;
    competitiveMode?: boolean;
    leaderboardId?: string;
  };
}
