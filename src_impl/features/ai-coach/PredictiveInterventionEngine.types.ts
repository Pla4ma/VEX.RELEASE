export interface BehavioralPattern {
    userId: string;
    patternType: 'consistent' | 'inconsistent' | 'declining' | 'improving';
    daysOfWeek: number[];
    timeOfDay: number[];
    averageSessionDuration: number;
    completionRate: number;
    streakBreakFrequency: number;
    last30DaysTrend: 'up' | 'stable' | 'down';
}

export interface RiskPrediction {
    id: string;
    userId: string;
    type: PredictionType;
    confidence: number;
    predictedAt: number;
    predictedToOccurAt: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    evidence: string[];
    recommendedAction: string;
    interventionSent: boolean;
    interventionType: string;
    actualOutcome: 'prevented' | 'occurred' | 'unknown' | null;
    outcomeVerifiedAt: number | null;
}

export interface InterventionResult {
    predictionId: string;
    sentAt: number;
    channel: 'push' | 'in_app' | 'coach_message';
    message: string;
    userResponded: boolean;
    outcome: 'prevented' | 'ignored' | 'unknown';
}

export type PredictionType = | 'STREAK_AT_RISK' // User likely to miss tomorrow
      | 'SESSION_ABANDON_RISK' // User likely to abandon session
      | 'BURNOUT_DETECTED' // User showing burnout patterns
      | 'OPTIMAL_TIME_WINDOW' // Recommended time for session
      | 'DIFFICULTY_MISMATCH' // Session difficulty too high/low
      | 'SOCIAL_ISOLATION' // User hasn't interacted with squad
      | 'CREATURE_NEGLECT' // User not caring for streak creature
      | 'RAID_PARTICIPATION_DROP' // User missing weekend boss raids
      | 'PRIME_TIME_MISSED' // User missing scheduled bonus events
      | 'CREATURE_EVOLUTION_STALL';
