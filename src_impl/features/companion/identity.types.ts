export interface IdentityProfile {
    userId: string;
    totalSessions: number;
    totalFocusMinutes: number;
    longestStreak: number;
    currentStreak: number;
    bestSessionQuality: number;
    favoriteTimeOfDay: string | null;
    averageSessionMinutes: number;
    identityLevel: IdentityLevel;
    lastIdentityShiftAt: number | null;
    weeklyMinutes: number;
    weeklySessions: number;
    weekStartDate: string;
}

export interface IdentityReflection {
    type: 'PATTERN' | 'MILESTONE' | 'WEEKLY' | 'IDENTITY_SHIFT';
    message: string;
    identityLevel: IdentityLevel;
    timestamp: number;
}

export type IdentityLevel = | 'newcomer'
      | 'building'
      | 'consistent'
      | 'dedicated'
      | 'committed'
      | 'mastered';
