import { FocusIdentityEngine } from '../FocusIdentityEngine';

describe('FocusIdentityEngine recommendation generation', () => {
  let engine: FocusIdentityEngine;
  beforeEach(() => {
    engine = new FocusIdentityEngine();
  });

  it('should recommend consistency improvements when consistency is weakest', () => {
    const factors = {
      consistency: { score: 10, explanation: 'Low' },
      streakStability: { score: 80, explanation: 'Stable' },
      sessionQuality: { score: 75, explanation: 'Good' },
      diversity: { score: 60, explanation: 'Okay' },
      recency: { score: 90, explanation: 'Fresh' },
    };

    const recommendations = engine.generateRecommendations(factors);

    expect(recommendations.length).toBeGreaterThanOrEqual(2);
    expect(recommendations.some((item) => item.includes('Consistency')))
      .toBe(true);
  });

  it('should recommend streak stability support when that factor is weakest', () => {
    const factors = {
      consistency: { score: 90, explanation: 'Strong' },
      streakStability: { score: 15, explanation: 'Unstable' },
      sessionQuality: { score: 70, explanation: 'Good' },
      diversity: { score: 65, explanation: 'Okay' },
      recency: { score: 88, explanation: 'Fresh' },
    };

    const recommendations = engine.generateRecommendations(factors);

    expect(recommendations.some((item) => item.includes('streaks')))
      .toBe(true);
  });

  it('should include the strongest factor as a strength reminder', () => {
    const factors = {
      consistency: { score: 20, explanation: 'Low' },
      streakStability: { score: 30, explanation: 'Low' },
      sessionQuality: { score: 40, explanation: 'Low' },
      diversity: { score: 50, explanation: 'Okay' },
      recency: { score: 95, explanation: 'Great' },
    };

    const recommendations = engine.generateRecommendations(factors);

    expect(recommendations.some((item) => item.includes('Recent Activity')))
      .toBe(true);
  });
});
