import { getAIInvocationName } from '../ai-client-requests';
import type { AIRequest } from '../ai-types';

describe('AI Edge Function routing', () => {
  it.each([
    ['GENERATE_COACH_MESSAGE', 'ai/coach-message'],
    ['GENERATE_SESSION_SUMMARY', 'ai/session-summary'],
    ['GENERATE_COMEBACK_PROMPT', 'ai/comeback-prompt'],
    ['GENERATE_STREAK_RISK_NUDGE', 'ai/streak-nudge'],
    ['GENERATE_WEEKLY_REFLECTION', 'ai/weekly-reflection'],
  ] as const)('routes %s to its dedicated AI endpoint', (requestType, expected) => {
    expect(getAIInvocationName(requestType)).toBe(expected);
  });

  it('keeps all public request types mapped to a callable function path', () => {
    const requestTypes: AIRequest['requestType'][] = [
      'GENERATE_COACH_MESSAGE',
      'GENERATE_SESSION_SUMMARY',
      'GENERATE_COMEBACK_PROMPT',
      'GENERATE_STREAK_RISK_NUDGE',
      'GENERATE_WEEKLY_REFLECTION',
    ];

    for (const requestType of requestTypes) {
      expect(getAIInvocationName(requestType)).toMatch(/^ai\/[a-z-]+$/);
    }
  });
});
