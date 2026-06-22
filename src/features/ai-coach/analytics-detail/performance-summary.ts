import { captureSilentFailure } from '../../../utils/silent-failure';
import { generateSessionSummary } from '../../../shared/ai/edge-function-service';
import { getOrCreateCoachState } from '../persona/persona-manager';
import { getSessionRepository } from '../../../session/repository/SessionRepository';

interface SummaryContext {
  sessionCount: number;
  totalFocusMinutes: number;
  averageSessionQuality: number;
  streakDays: number;
  xpEarned: number;
  challengesCompleted: number;
}

export async function generatePerformanceSummary(
  userId: string,
  period: 'daily' | 'weekly' | 'monthly',
): Promise<{
  period: string;
  sessionsCompleted: number;
  totalFocusTime: number;
  averageSessionQuality: number;
  streakDays: number;
  xpEarned: number;
  coachMessage: string;
}> {
  const state = await getOrCreateCoachState(userId);
  const sessionRepository = getSessionRepository(userId);
  const [stats, summaries] = await Promise.all([
    sessionRepository.getSessionStats(),
    sessionRepository.getAllSummaries(),
  ]);
  const averageSessionQuality =
    summaries.length > 0
      ? summaries.reduce((sum, summary) => sum + summary.focusQuality, 0) /
        summaries.length
      : 0;
  const xpEarned = summaries.reduce(
    (sum, item) => sum + (item.xpEarned ?? 0),
    0,
  );

  const context: SummaryContext = {
    sessionCount: stats.completedSessions,
    totalFocusMinutes: Math.round(stats.totalFocusTime / 60),
    averageSessionQuality,
    streakDays: stats.currentStreak,
    xpEarned,
    challengesCompleted: 0,
  };

  const coachMessage = await generateAISummaryMessage(
    userId,
    period,
    context,
    state.currentState,
  );

  return {
    period,
    sessionsCompleted: stats.completedSessions,
    totalFocusTime: stats.totalFocusTime,
    averageSessionQuality,
    streakDays: stats.currentStreak,
    xpEarned,
    coachMessage,
  };
}

async function generateAISummaryMessage(
  userId: string,
  period: 'daily' | 'weekly' | 'monthly',
  context: SummaryContext,
  currentState: string,
): Promise<string> {
  try {
    const response = await generateSessionSummary({
      userId,
      context: {
        sessionCount: context.sessionCount,
        totalFocusMinutes: context.totalFocusMinutes,
        averageSessionQuality: Math.round(context.averageSessionQuality),
        streakDays: context.streakDays,
        xpEarned: context.xpEarned,
        challengesCompleted: context.challengesCompleted,
        preferredTimeOfDay: period,
        consistencyScore:
          context.sessionCount > 0 ? Math.min(100, context.streakDays * 10) : 0,
      },
    });
    if (response.success) {
      const enouragementValue = response.structuredData?.encouragement;
      if (
        typeof enouragementValue === 'string' &&
        enouragementValue.length > 0
      ) {
        return enouragementValue;
      }
      return response.content ?? generateSummaryMessage(currentState, period);
    }
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'ai-coach',
      operation: 'ui-fallback',
      type: 'ui',
    });
    return generateSummaryMessage(currentState, period);
  }
  return generateSummaryMessage(currentState, period);
}

function generateSummaryMessage(_state: string, period: string): string {
  const messages: Record<string, string[]> = {
    daily: [
      'Great work today! Every session is a step forward.',
      "You showed up today\u2014that's what matters. Keep building!",
      "Today's focus is tomorrow's success. Well done!",
    ],
    weekly: [
      'What a week! Your consistency is paying off.',
      '7 days of effort, infinite progress. Keep it up!',
      'You crushed this week! Ready for the next one?',
    ],
    monthly: [
      "A month of dedication! You're becoming unstoppable.",
      "30 days of growth. Look how far you've come!",
      'Monthly milestone achieved! Your future self thanks you.',
    ],
  };
  const periodMessages = messages[period];
  if (!periodMessages || periodMessages.length === 0) {
    return 'Great work today! Every session is a step forward.';
  }
  const result =
    periodMessages[Math.floor(Math.random() * periodMessages.length)];
  return result ?? 'Great work today! Every session is a step forward.';
}
