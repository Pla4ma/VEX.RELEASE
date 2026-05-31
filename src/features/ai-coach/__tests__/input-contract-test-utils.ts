import type { CoachInputContract } from '../input-contract-schema';

function generateMockUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : 8 + (r % 4);
    return v.toString(16);
  });
}

export function createMockCoachInput(
  overrides: Partial<CoachInputContract> = {},
): CoachInputContract {
  const now = Date.now();
  const currentHour = new Date(now).getHours();
  const dayOfWeek = new Date(now).getDay();

  return {
    recentSessionGrades: [
      {
        sessionId: generateMockUUID(),
        grade: 85,
        duration: 1500,
        completedAt: now - 86400000,
        difficulty: 'NORMAL',
      },
      {
        sessionId: generateMockUUID(),
        grade: 92,
        duration: 1800,
        completedAt: now - 172800000,
        difficulty: 'CHALLENGING',
      },
    ],
    preferredSessionLengths: [1500, 1800, 2100],
    completionTimes: [9, 14, 19],
    streakState: {
      currentStreak: 5,
      streakAtRisk: false,
      hoursSinceLastSession: 18,
      streakRecord: 12,
      missedDays: 0,
    },
    focusScoreFactors: {
      currentScore: 78,
      trend: 'improving',
      primaryFactors: ['consistency', 'duration'],
    },
    missionHistory: [
      {
        missionId: generateMockUUID(),
        type: 'daily',
        completed: true,
        completedAt: now - 43200000,
        difficulty: 'NORMAL',
      },
    ],
    userGoalCategory: 'focus_improvement',
    notificationPreferences: {
      enabled: true,
      quietHoursStart: 22,
      quietHoursEnd: 7,
      maxPerDay: 2,
    },
    premiumStatus: {
      isActive: false,
      tier: 'free',
      features: [],
    },
    timeContext: {
      currentHour,
      dayOfWeek,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      localTimezone: 'America/New_York',
    },
    ...overrides,
  };
}
