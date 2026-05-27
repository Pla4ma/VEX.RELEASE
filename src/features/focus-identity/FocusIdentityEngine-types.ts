export interface ScoreBand {
  min: number;
  max: number;
  label: string;
  title: string;
  color: string;
  percentile: number;
}

export interface FocusScoreFactors {
  consistency: {
    score: number;
    sessionsLast30Days: number;
    targetSessionsPerWeek: number;
    actualConsistency: number;
    missedDaysLast30Days: number;
  };
  streakStability: {
    score: number;
    currentStreak: number;
    longestStreak: number;
    averageStreakLength: number;
    totalStreaksStarted: number;
    streakBreakFrequency: number;
  };
  sessionQuality: {
    score: number;
    averageFocusPurity: number;
    averageGrade: "S" | "A" | "B" | "C" | "D";
    perfectSessionsCount: number;
    averageSessionDuration: number;
  };
  diversity: {
    score: number;
    uniqueSessionModes: number;
    uniqueTimeSlots: number;
    uniqueDaysOfWeek: number;
    weekendSessions: number;
    contextVariety: number;
  };
  recency: {
    score: number;
    daysSinceLastSession: number;
    last7DayActivity: number;
    last30DayActivity: number;
    trendDirection: "UP" | "STABLE" | "DOWN" | "CONCERNING";
    velocity: number;
  };
}

export interface FocusIdentityProfile {
  userId: string;
  currentScore: number;
  previousScore: number;
  scoreHistory: Array<{ date: string; score: number; reason: string }>;
  percentileRank: number;
  band: ScoreBand;
  factors: FocusScoreFactors;
  identityStatement: string;
  streakInCurrentBand: number;
  totalScoreCalculations: number;
  firstScoreDate: string;
  isInRecovery: boolean;
  recoveryStartDate: string | null;
  recoveryProgress: number;
  preLapseScore: number | null;
  topStrength: keyof FocusScoreFactors;
  topWeakness: keyof FocusScoreFactors;
  recommendedActions: string[];
  monthlyReport: {
    month: string;
    startingScore: number;
    endingScore: number;
    change: number;
    sessionsCompleted: number;
    grade: "A+" | "A" | "B+" | "B" | "C" | "D";
    highlight: string;
  } | null;
  updatedAt: number;
}
