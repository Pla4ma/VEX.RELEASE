export interface WeeklyStats {
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  totalMinutes: number;
  sessionsCompleted: number;
  xpEarned: number;
  streakMaintained: boolean;
  streakDays: number;
  bossDamageDealt: number;
  bestSession: {
    duration: number;
    grade: string;
  } | null;
}

export interface WeekComparison {
  currentWeek: WeeklyStats;
  previousWeek: WeeklyStats | null;
  changeMinutes: number;
  changePercent: number;
  percentile: number;
}
