import { AIResponseSchema, type AIRequest } from '../ai-types';
import { buildAIResponseData } from '../response-data';

const userId = '550e8400-e29b-41d4-a716-446655440000';
const responseText = 'A useful, grounded reflection for the next step.';

const requests: AIRequest[] = [
  { requestType: 'GENERATE_COACH_MESSAGE', userId, context: { category: 'MOTIVATION_BOOST' } },
  {
    requestType: 'GENERATE_SESSION_SUMMARY', userId,
    context: { sessionCount: 3, totalFocusMinutes: 75, averageSessionQuality: 82, streakDays: 4, xpEarned: 90, challengesCompleted: 1 },
  },
  {
    requestType: 'GENERATE_COMEBACK_PROMPT', userId,
    context: { previousStreak: 4, daysInactive: 2, comebackDay: 1, sessionsCompleted: 2, bonusMultiplier: 1 },
  },
  {
    requestType: 'GENERATE_STREAK_RISK_NUDGE', userId,
    context: { currentStreak: 7, hoursRemaining: 3, riskLevel: 'high' },
  },
  {
    requestType: 'GENERATE_WEEKLY_REFLECTION', userId,
    context: { weekNumber: 12, sessionsCompleted: 5, totalFocusMinutes: 140, averageSessionQuality: 80, streakAtStart: 2, streakAtEnd: 5, xpEarned: 180, levelUps: 1, challengesCompleted: 2, bossEncounters: 1 },
  },
];

describe('AI response structured data', () => {
  it.each(requests)('matches the client response contract for $requestType', (request) => {
    const result = AIResponseSchema.safeParse({
      success: true,
      requestType: request.requestType,
      content: responseText,
      structuredData: buildAIResponseData(request, responseText),
      metadata: { model: 'test-model', processingTimeMs: 1, cached: false },
    });

    expect(result.success).toBe(true);
  });
});
