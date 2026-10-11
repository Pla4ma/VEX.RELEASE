import type { AIRequest } from './ai-types';

export function buildAIResponseData(
  request: AIRequest,
  content: string,
): Record<string, unknown> {
  switch (request.requestType) {
    case 'GENERATE_COACH_MESSAGE':
      return { message: content };
    case 'GENERATE_SESSION_SUMMARY':
      return {
        headline: 'Momentum check',
        highlights: [content],
        encouragement: 'Keep stacking focused sessions.',
      };
    case 'GENERATE_COMEBACK_PROMPT':
      return {
        message: content,
        progressPercent: Math.min(
          100,
          Math.max(0, Math.round((request.context.sessionsCompleted / 3) * 100)),
        ),
        encouragement: 'Fresh starts count.',
      };
    case 'GENERATE_STREAK_RISK_NUDGE':
      return {
        urgencyMessage: content,
        streakCount: request.context.currentStreak,
        suggestedDuration: 15,
        emoji: '🔥',
      };
    case 'GENERATE_WEEKLY_REFLECTION':
      return {
        headline: 'Week at a glance',
        wins: [content],
        reflection: content,
        nextWeekGoal:
          'Protect the streak and finish one more session than last week.',
        encouragement: 'You are building a repeatable focus habit.',
      };
    default:
      throw new Error('Unsupported AI response type');
  }
}
