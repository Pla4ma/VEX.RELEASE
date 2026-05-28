export interface CoachMemory {
  userId: string;
  longestStreak: number;
  longestStreakDate: number | null;
  bestSessionQuality: number;
  bestSessionQualityDate: number | null;
  mostProductiveTimeOfDay:
    | "morning"
    | "afternoon"
    | "evening"
    | "night"
    | null;
  mostUsedSessionDuration: number;
  totalSessionsCompleted: number;
  totalFocusMinutes: number;
  lastBossDefeated: string | null;
  lastBossDefeatedDate: number | null;
  favoriteSessionType: string | null;
  averageSessionQuality: number;
  comebackCount: number;
  lastUpdated: number;
}

export interface SessionFacts {
  duration: number;
  quality: number;
  completedAt: number;
  sessionType: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
}

export interface StreakFacts {
  currentDays: number;
  longestDays: number;
  lastQualifyingSessionAt: number;
  wasRecentlyBroken: boolean;
}
