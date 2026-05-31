/**
 * Analytics Data Schema Tests (Filters, DataPoints, TimeSeries, Trends)
 */

import {
  AnalyticsFilterSchema,
  AnalyticsDataPointSchema,
  TimeSeriesDataSchema,
  TrendAnalysisSchema,
} from '../data-schemas';

describe('Analytics Data Schemas', () => {
  describe('AnalyticsFilterSchema', () => {
    it('accepts valid filter', () => {
      const filter = {
        dimension: 'session_category',
        operator: 'eq' as const,
        value: 'boss',
      };
      expect(() => AnalyticsFilterSchema.parse(filter)).not.toThrow();
    });

    it('accepts filter with array value', () => {
      const filter = {
        dimension: 'boss_type',
        operator: 'in' as const,
        value: ['dragon', 'goblin'],
      };
      expect(() => AnalyticsFilterSchema.parse(filter)).not.toThrow();
    });

    it('rejects filter with invalid operator', () => {
      const filter = {
        dimension: 'session_category',
        operator: 'contains',
        value: 'boss',
      };
      expect(() => AnalyticsFilterSchema.parse(filter)).toThrow();
    });
  });

  describe('AnalyticsDataPointSchema', () => {
    it('accepts valid data point', () => {
      const point = { timestamp: Date.now(), value: 42 };
      expect(() => AnalyticsDataPointSchema.parse(point)).not.toThrow();
    });

    it('accepts data point with metadata', () => {
      const point = {
        timestamp: Date.now(),
        value: 42,
        metadata: { category: 'boss' },
      };
      expect(() => AnalyticsDataPointSchema.parse(point)).not.toThrow();
    });

    it('rejects negative timestamp', () => {
      const point = { timestamp: -1, value: 42 };
      expect(() => AnalyticsDataPointSchema.parse(point)).toThrow();
    });
  });

  describe('TimeSeriesDataSchema', () => {
    it('accepts valid time series data', () => {
      const data = {
        metric: 'sessions_completed',
        granularity: 'day',
        points: [{ timestamp: Date.now(), value: 5 }],
        summary: {
          total: 5,
          average: 5,
          min: 5,
          max: 5,
          change: 0,
          changePercent: 0,
        },
      };
      expect(() => TimeSeriesDataSchema.parse(data)).not.toThrow();
    });

    it('rejects empty points array', () => {
      const data = {
        metric: 'sessions_completed',
        granularity: 'day',
        points: [],
        summary: {
          total: 0,
          average: 0,
          min: 0,
          max: 0,
          change: 0,
          changePercent: 0,
        },
      };
      expect(() => TimeSeriesDataSchema.parse(data)).toThrow();
    });
  });

  describe('TrendAnalysisSchema', () => {
    it('accepts valid trend analysis', () => {
      const trend = {
        metric: 'xp_earned',
        direction: 'up',
        strength: 0.8,
        changePercent: 15.5,
        confidence: 0.9,
        points: [],
        projectedNext: 100,
        seasonalityDetected: false,
        outliers: [],
      };
      expect(() => TrendAnalysisSchema.parse(trend)).not.toThrow();
    });

    it('rejects strength > 1', () => {
      const trend = {
        metric: 'xp_earned',
        direction: 'up',
        strength: 1.5,
        changePercent: 15.5,
        confidence: 0.9,
        points: [],
        projectedNext: 100,
        seasonalityDetected: false,
        outliers: [],
      };
      expect(() => TrendAnalysisSchema.parse(trend)).toThrow();
    });
  });
});
