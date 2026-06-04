import { isRecommendationRelevant } from '../recommendation/recommendation-pipeline';
import { mockContext } from './recommendation-test-fixtures';

describe('isRecommendationRelevant', () => {
  it('returns false for expired recommendation', () => {
    const now = Date.now();
    const recommendation = {
      id: 'rec-1',
      userId: 'user-123',
      type: 'session' as const,
      title: 'Test',
      description: 'Test',
      reasoning: 'Test',
      confidence: 0.9,
      priority: 'high' as const,
      actionType: 'start_session' as const,
      expiresAt: now - 60 * 60 * 1000,
    };
    expect(isRecommendationRelevant(recommendation, mockContext)).toBe(false);
  });
  it('returns false for session recommendation when active session', () => {
    const now = Date.now();
    const recommendation = {
      id: 'rec-1',
      userId: 'user-123',
      type: 'session' as const,
      title: 'Test',
      description: 'Test',
      reasoning: 'Test',
      confidence: 0.9,
      priority: 'high' as const,
      actionType: 'start_session' as const,
      expiresAt: now + 60 * 60 * 1000,
    };
    const contextWithActiveSession = {
      ...mockContext,
      sessionContext: { activeSession: true },
    };
    expect(
      isRecommendationRelevant(recommendation, contextWithActiveSession),
    ).toBe(false);
  });
  it('returns false for break when few sessions', () => {
    const now = Date.now();
    const recommendation = {
      id: 'rec-1',
      userId: 'user-123',
      type: 'break' as const,
      title: 'Test',
      description: 'Test',
      reasoning: 'Test',
      confidence: 0.9,
      priority: 'low' as const,
      actionType: 'take_break' as const,
      expiresAt: now + 60 * 60 * 1000,
    };
    const contextWithFewSessions = {
      ...mockContext,
      progressContext: {
        ...mockContext.progressContext,
        sessionsThisWeek: 3,
      },
    };
    expect(
      isRecommendationRelevant(recommendation, contextWithFewSessions),
    ).toBe(false);
  });
  it('returns false for social when no squad', () => {
    const now = Date.now();
    const recommendation = {
      id: 'rec-1',
      userId: 'user-123',
      type: 'social' as const,
      title: 'Test',
      description: 'Test',
      reasoning: 'Test',
      confidence: 0.9,
      priority: 'medium' as const,
      actionType: 'join_squad' as const,
      expiresAt: now + 60 * 60 * 1000,
    };
    const contextWithoutSquad = {
      ...mockContext,
      socialContext: { ...mockContext.socialContext, hasSquad: false },
    };
    expect(
      isRecommendationRelevant(recommendation, contextWithoutSquad),
    ).toBe(false);
  });
  it('returns true for valid recommendation', () => {
    const now = Date.now();
    const recommendation = {
      id: 'rec-1',
      userId: 'user-123',
      type: 'time' as const,
      title: 'Test',
      description: 'Test',
      reasoning: 'Test',
      confidence: 0.9,
      priority: 'medium' as const,
      actionType: 'start_session' as const,
      expiresAt: now + 60 * 60 * 1000,
    };
    expect(isRecommendationRelevant(recommendation, mockContext)).toBe(true);
  });
});
