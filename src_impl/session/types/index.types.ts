export interface SessionHistoryEntry {
    sessionId: string;
    userId: string;
    status: SessionStatus;
    config: SessionConfig;
    summary?: SessionSummary;
    startedAt: number;
    endedAt?: number;
    createdAt: number;
    startTime?: number;
    completedAt?: number | null;
    endTime?: number;
    duration?: number;
    mode?: SessionMode;
    name?: string;
    finalScore?: number;
    effectiveDuration?: number;
    streakMaintained?: boolean;
    xpEarned?: number;
    coinsEarned?: number;
    completionPercentage?: number;
    focusQuality?: number;
}

export interface TimerConfig {
    duration?: number;
    breakDuration?: number;
    longBreakDuration?: number;
    intervals?: number;
    longBreakInterval?: number;
    soundEnabled?: boolean;
    vibrationEnabled?: boolean;
    notes?: string;
    tags?: string[];
    tickInterval?: number;
    backgroundTickInterval?: number;
    pauseThreshold?: number;
    maxPauseDuration?: number;
    warningThresholds?: number[];
}

export interface InterruptionRecord {
    id: string;
    sessionId: string;
    timestamp: number;
    reason: string;
    duration: number;
    type: string;
    resolvedAt: number;
    impact: {
        timeLost: number;
        scoreImpact: number;
        damagePoints?: number;
        };
    severity: string;
    autoRecovered: boolean;
}

export interface RecoveryRecord {
    id: string;
    sessionId: string;
    timestamp: number;
    recoveredTime: number;
    success: boolean;
    successful?: boolean;
    type: string;
    attemptedAt: number;
    penalties?: PenaltyRecord[];
}

export interface PenaltyRecord {
    type: string;
    amount: number;
    description?: string;
}

export interface AntiCheatFlag {
    id: string;
    sessionId: string;
    timestamp?: number;
    flagType?: string;
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'WARNING' | 'MODERATE' | 'CRITICAL';
    description?: string;
    detectedAt?: number;
    evidence?: Record<string, unknown>;
    actionTaken?: 'NONE' | 'FLAGGED' | 'SCORE_REDUCED' | 'SESSION_INVALIDATED';
    score?: number;
}

export interface FocusQualityMetrics {
    sessionId: string;
    consistency?: number;
    stability?: number;
    peakPerformance?: number;
    averageFocus?: number;
    distractionCount?: number;
    recoveryTime?: number;
    timeInDeepFocus: number;
    timeInShallowFocus: number;
    timeDistracted: number;
    focusSegments: Array<{
        startAt: number;
        endAt: number;
        duration: number;
        quality: number;
        }>;
    consistencyScore: number;
    depthScore: number;
    recoveryScore: number;
    overallScore: number;
    calculatedAt?: number;
}

export interface SessionCreationResult {
    success: boolean;
    session?: SessionState | null;
    sessionId?: string;
    error?: string;
}

export interface StateTransitionResult {
    success: boolean;
    session?: SessionState;
    newState?: SessionStatus;
    error?: string;
}

export interface TimeCalculationResult {
    elapsed: number;
    remaining: number;
    duration: number;
    percentage: number;
    effectiveTime: number;
    pausedDuration: number;
    backgroundTime: number;
}

export interface TimeBreakdown {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    formatted: string;
}

export interface TimeProgressMetrics {
    elapsed: number;
    remaining: number;
    duration: number;
    percentage: number;
    isComplete: boolean;
    isNearComplete: boolean;
    progressRatio: number;
    phase: string;
    interval: number;
    estimatedCompletionTime: number;
}

export type SessionStatus = z.infer<typeof SessionStatusSchema>;
export type SessionPhase = z.infer<typeof SessionPhaseSchema>;
export type SessionPreset = z.infer<typeof SessionPresetSchema>;
export type SessionConfig = z.infer<typeof SessionConfigSchema>;
export type SessionState = z.infer<typeof SessionStateSchema>;
export type SessionSummary = z.infer<typeof SessionSummarySchema>;
export type SessionEvent = z.infer<typeof SessionEventSchema>;
export type SessionMetrics = z.infer<typeof SessionMetricsSchema>;
export type InterruptionType = 'EXTERNAL' | 'INTERNAL' | 'SYSTEM' | 'USER' | 'USER_PAUSE';
export type InterruptionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'MODERATE' | 'MINOR';
export type RecoveryType = 'AUTO_RESUME' | 'USER_RESUME' | 'MANUAL_RECOVERY' | 'STREAK_SAVE' | 'PARTIAL_CREDIT' | 'FULL_RESET';
export type TimerState = z.infer<typeof TimerStateSchema>;
export type ScoreCalculation = z.infer<typeof ScoreCalculationSchema>;
export type DamageCalculation = z.infer<typeof DamageCalculationSchema>;
export type SessionUIState = z.infer<typeof SessionUIStateSchema>;
export type SessionNotificationType = z.infer<typeof SessionNotificationTypeSchema>;
