import {
  trackRecommendationInteraction,
  batchProcessRecommendations,
} from '../recommendation-pipeline';

describe('trackRecommendationInteraction', () => {
  it('tracks view without error', async () => {
    await expect(
      trackRecommendationInteraction('rec-1', 'user-123', 'viewed'),
    ).resolves.not.toThrow();
  });
  it('tracks acceptance without error', async () => {
    await expect(
      trackRecommendationInteraction('rec-1', 'user-123', 'accepted'),
    ).resolves.not.toThrow();
  });
  it('tracks dismissal without error', async () => {
    await expect(
      trackRecommendationInteraction('rec-1', 'user-123', 'dismissed'),
    ).resolves.not.toThrow();
  });
});

describe('batchProcessRecommendations', () => {
  it('groups recommendations by priority', () => {
    const now = Date.now();
    const recommendations = [
      {
        id: 'rec-1',
        userId: 'user-123',
        type: 'session' as const,
        title: 'Critical',
        description: 'Test',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'critical' as const,
        actionType: 'start_session' as const,
        expiresAt: now + 60 * 60 * 1000,
      },
      {
        id: 'rec-2',
        userId: 'user-123',
        type: 'session' as const,
        title: 'High 1',
        description: 'Test',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'high' as const,
        actionType: 'start_session' as const,
        expiresAt: now + 60 * 60 * 1000,
      },
      {
        id: 'rec-3',
        userId: 'user-123',
        type: 'session' as const,
        title: 'High 2',
        description: 'Test',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'high' as const,
        actionType: 'start_session' as const,
        expiresAt: now + 60 * 60 * 1000,
      },
      {
        id: 'rec-4',
        userId: 'user-123',
        type: 'session' as const,
        title: 'Low',
        description: 'Test',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'low' as const,
        actionType: 'start_session' as const,
        expiresAt: now + 60 * 60 * 1000,
      },
    ];
    const batched = batchProcessRecommendations(recommendations);
    expect(batched.critical.length).toBe(1);
    expect(batched.high.length).toBe(2);
    expect(batched.medium.length).toBe(0);
    expect(batched.low.length).toBe(1);
  });
});
