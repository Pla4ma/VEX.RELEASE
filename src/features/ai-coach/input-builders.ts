import type { CoachInputContract } from "./input-contract";
import { generateUUID } from "./ai-helpers";

export async function buildInputContractFromStreakData(
  _userId: string,
  streakData: {
    currentStreak: number;
    hoursSinceLastSession: number;
    riskLevel: string;
  },
): Promise<CoachInputContract> {
  return {
    recentSessionGrades: [],
    preferredSessionLengths: [1500],
    completionTimes: [],
    streakState: {
      currentStreak: Math.max(0, streakData.currentStreak),
      streakAtRisk: streakData.riskLevel !== "low",
      hoursSinceLastSession: Math.max(0, streakData.hoursSinceLastSession),
      streakRecord: Math.max(0, streakData.currentStreak),
      missedDays: 0,
    },
    focusScoreFactors: {
      currentScore: 75,
      trend: "stable",
      primaryFactors: [],
    },
    missionHistory: [],
    userGoalCategory: "focus_improvement",
    notificationPreferences: {
      enabled: true,
      quietHoursStart: 22,
      quietHoursEnd: 7,
      maxPerDay: 2,
    },
    premiumStatus: { isActive: false, tier: "free", features: [] },
    timeContext: getCurrentTimeContext(),
  };
}

export async function buildInputContractForUser(
  _userId: string,
): Promise<CoachInputContract> {
  return {
    recentSessionGrades: [
      {
        sessionId: generateUUID(),
        grade: 85,
        duration: 1500,
        completedAt: Date.now() - 86400000,
        difficulty: "NORMAL",
      },
    ],
    preferredSessionLengths: [1500, 1800],
    completionTimes: [9, 19],
    streakState: {
      currentStreak: 5,
      streakAtRisk: false,
      hoursSinceLastSession: 18,
      streakRecord: 12,
      missedDays: 0,
    },
    focusScoreFactors: {
      currentScore: 78,
      trend: "improving",
      primaryFactors: ["consistency"],
    },
    missionHistory: [],
    userGoalCategory: "focus_improvement",
    notificationPreferences: {
      enabled: true,
      quietHoursStart: 22,
      quietHoursEnd: 7,
      maxPerDay: 2,
    },
    premiumStatus: { isActive: false, tier: "free", features: [] },
    timeContext: getCurrentTimeContext(),
  };
}

function getCurrentTimeContext(): CoachInputContract["timeContext"] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  return {
    currentHour: now.getHours(),
    dayOfWeek,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    localTimezone: "America/New_York",
  };
}
