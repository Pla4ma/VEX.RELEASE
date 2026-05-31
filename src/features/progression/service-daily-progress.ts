import { z } from 'zod';
import { fetchXpHistory } from './repository';
import { fetchXpStats } from './repository/enhanced';

const DailyProgressSchema = z.object({
  date: z.number(),
  xpEarned: z.number(),
  sessionsCompleted: z.number(),
  streakDay: z.boolean(),
  dailyGoalMet: z.boolean(),
  goalProgressPercent: z.number(),
});

export type DailyProgress = z.infer<typeof DailyProgressSchema>;

function emptyDailyProgress(startOfDay: number): DailyProgress {
  return DailyProgressSchema.parse({
    date: startOfDay,
    xpEarned: 0,
    sessionsCompleted: 0,
    streakDay: false,
    dailyGoalMet: false,
    goalProgressPercent: 0,
  });
}

export async function getDailyProgress(userId: string): Promise<DailyProgress> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.getTime();
  try {
    const history = await fetchXpHistory(userId, { since: startOfDay });
    const xpEarned = history.reduce((sum, entry) => sum + entry.amount, 0);
    const sessionsCompleted = new Set(
      history
        .filter(
          (entry) => entry.source === 'SESSION_COMPLETE' && entry.sessionId,
        )
        .map((entry) => entry.sessionId),
    ).size;
    const dailyGoal = 100;
    const goalProgressPercent = Math.min(
      100,
      Math.floor((xpEarned / dailyGoal) * 100),
    );

    return DailyProgressSchema.parse({
      date: startOfDay,
      xpEarned,
      sessionsCompleted,
      streakDay: sessionsCompleted > 0,
      dailyGoalMet: xpEarned >= dailyGoal,
      goalProgressPercent,
    });
  } catch (_error) {
    const statsResult = await fetchXpStats(userId, 'day').catch(() => null);

    if (statsResult?.error || !statsResult?.data) {
      return emptyDailyProgress(startOfDay);
    }

    const stats = statsResult.data;
    const sessionsCompleted = stats.bySource.SESSION_COMPLETE ? 1 : 0;
    const dailyGoal = 100;
    const goalProgressPercent = Math.min(
      100,
      Math.floor((stats.total / dailyGoal) * 100),
    );

    return DailyProgressSchema.parse({
      date: startOfDay,
      xpEarned: stats.total,
      sessionsCompleted,
      streakDay: sessionsCompleted > 0,
      dailyGoalMet: stats.total >= dailyGoal,
      goalProgressPercent,
    });
  }
}
