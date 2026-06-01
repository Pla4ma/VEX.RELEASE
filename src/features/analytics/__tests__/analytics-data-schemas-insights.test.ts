/**
 * Analytics Data Schema Tests (Insights, Patterns, Comparative, Aggregated)
 */

import {
  InsightSchema,
  DetectedPatternSchema,
  ComparativeStatsSchema,
  AggregatedStatsSchema,
} from '../data-schemas';

describe('Analytics Data Schemas', () => {
  describe('InsightSchema', () => {
    const validInsight = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      type: 'milestone_reached',
      severity: 'celebration',
      title: '500 XP Milestone!',
      description: 'You earned 500 total XP!',
      metric: 'xp_earned',
      detectedAt: Date.now(),
      expiresAt: Date.now() + 86400000,
      isRead: false,
      isActioned: false,
      relatedMetrics: ['xp_earned'],
    };

    it('accepts valid insight', () => {
      expect(() => InsightSchema.parse(validInsight)).not.toThrow();
    });

    it('rejects insight with empty title', () => {
      expect(() =>
        InsightSchema.parse({ ...validInsight, title: '' }),
      ).toThrow();
    });

    it('rejects insight with title > 200 chars', () => {
      expect(() =>
        InsightSchema.parse({ ...validInsight, title: 'a'.repeat(201) }),
      ).toThrow();
    });

    it('rejects insight with invalid UUID', () => {
      expect(() =>
        InsightSchema.parse({ ...validInsight, id: 'not-a-uuid' }),
      ).toThrow();
    });
  });

  describe('DetectedPatternSchema', () => {
    const validPattern = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'correlation',
      metric: 'sessions_completed',
      description: 'Sessions correlate with time of day',
      confidence: 0.85,
      detectedAt: Date.now(),
      startDate: Date.now() - 86400000,
      endDate: Date.now(),
      relatedEvents: ['session_complete'],
      recommendations: ['Focus in mornings'],
    };

    it('accepts valid pattern', () => {
      expect(() => DetectedPatternSchema.parse(validPattern)).not.toThrow();
    });

    it('rejects pattern with invalid type', () => {
      expect(() =>
        DetectedPatternSchema.parse({ ...validPattern, type: 'trend' }),
      ).toThrow();
    });

    it('rejects confidence > 1', () => {
      expect(() =>
        DetectedPatternSchema.parse({ ...validPattern, confidence: 1.5 }),
      ).toThrow();
    });
  });

  describe('ComparativeStatsSchema', () => {
    const validStats = {
      metric: 'sessions_completed',
      currentPeriod: {
        value: 10,
        startDate: Date.now() - 86400000,
        endDate: Date.now(),
      },
      previousPeriod: {
        value: 8,
        startDate: Date.now() - 172800000,
        endDate: Date.now() - 86400000,
      },
      change: 2,
      changePercent: 25,
      isSignificant: true,
    };

    it('accepts valid stats', () => {
      expect(() => ComparativeStatsSchema.parse(validStats)).not.toThrow();
    });

    it('accepts stats with benchmark', () => {
      const withBenchmark = {
        ...validStats,
        benchmark: { value: 15, label: 'Average user' },
      };
      expect(() =>
        ComparativeStatsSchema.parse(withBenchmark),
      ).not.toThrow();
    });
  });

  describe('AggregatedStatsSchema', () => {
    const validAgg = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      period: 'last_7_days',
      generatedAt: Date.now(),
      metrics: {
        sessions_completed: {
          value: 10,
          previousValue: 8,
          changePercent: 25,
          trend: 'up',
        },
      },
      insights: [],
      patterns: [],
      topPerforming: {
        dayOfWeek: 1,
        hourOfDay: 9,
        category: 'work',
      },
    };

    it('accepts valid aggregated stats', () => {
      expect(() => AggregatedStatsSchema.parse(validAgg)).not.toThrow();
    });

    it('rejects dayOfWeek > 6', () => {
      expect(() =>
        AggregatedStatsSchema.parse({
          ...validAgg,
          topPerforming: { dayOfWeek: 7, hourOfDay: 9, category: 'work' },
        }),
      ).toThrow();
    });

    it('rejects hourOfDay > 23', () => {
      expect(() =>
        AggregatedStatsSchema.parse({
          ...validAgg,
          topPerforming: { dayOfWeek: 1, hourOfDay: 25, category: 'work' },
        }),
      ).toThrow();
    });
  });
});
