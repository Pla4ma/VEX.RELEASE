import {
  filterActiveRecommendations,
  getTopRecommendation,
} from '../recommendation/recommendation-pipeline';

describe('filterActiveRecommendations', () => {
  it('filters out expired recommendations', () => {
    const now = Date.now();
    const recommendations = [
      {
        id: 'rec-1',
        userId: 'user-123',
        type: 'session' as const,
        title: 'Active',
        description: 'Test',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'high' as const,
        actionType: 'start_session' as const,
        expiresAt: now + 60 * 60 * 1000,
      },
      {
        id: 'rec-2',
        userId: 'user-123',
        type: 'session' as const,
        title: 'Expired',
        description: 'Test',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'low' as const,
        actionType: 'start_session' as const,
        expiresAt: now - 60 * 60 * 1000,
      },
    ];
    const active = filterActiveRecommendations(recommendations);
    expect(active.length).toBe(1);
    expect(active[0].title).toBe('Active');
  });
});

describe('getTopRecommendation', () => {
  it('returns highest priority recommendation', () => {
    const now = Date.now();
    const recommendations = [
      {
        id: 'rec-1',
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
      {
        id: 'rec-2',
        userId: 'user-123',
        type: 'session' as const,
        title: 'High',
        description: 'Test',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'high' as const,
        actionType: 'start_session' as const,
        expiresAt: now + 60 * 60 * 1000,
      },
    ];
    const top = getTopRecommendation(recommendations);
    expect(top?.title).toBe('Low');
  });
  it('returns null for empty array', () => {
    expect(getTopRecommendation([])).toBeNull();
  });
  it('returns null when all expired', () => {
    const now = Date.now();
    const recommendations = [
      {
        id: 'rec-1',
        userId: 'user-123',
        type: 'session' as const,
        title: 'Expired',
        description: 'Test',
        reasoning: 'Test',
        confidence: 0.9,
        priority: 'high' as const,
        actionType: 'start_session' as const,
        expiresAt: now - 60 * 60 * 1000,
      },
    ];
    expect(getTopRecommendation(recommendations)).toBeNull();
  });
});
