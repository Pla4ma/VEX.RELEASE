import { z } from 'zod';
import {
  AnalyticsMetricSchema,
  AnalyticsDimensionSchema,
  TrendDirectionSchema,
  TimeRangeSchema,
  InsightSeveritySchema,
  InsightTypeSchema,
} from './enums';

// ── Filter & data points ─────────────────────────────────────────────────

export const AnalyticsFilterSchema = z
  .object({
    dimension: AnalyticsDimensionSchema,
    operator: z.enum([
      'eq',
      'ne',
      'gt',
      'gte',
      'lt',
      'lte',
      'in',
      'not_in',
      'between',
    ]),
    value: z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
      z.array(z.number()),
    ]),
  })
  .strict();
export type AnalyticsFilter = z.infer<typeof AnalyticsFilterSchema>;

export const AnalyticsDataPointSchema = z
  .object({
    timestamp: z.number().int().positive(),
    value: z.number(),
    dimension: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const TimeSeriesDataSchema = z
  .object({
    metric: AnalyticsMetricSchema,
    granularity: z.enum(['hour', 'day', 'week', 'month']),
    points: z.array(AnalyticsDataPointSchema).min(1),
    summary: z
      .object({
        total: z.number(),
        average: z.number(),
        min: z.number(),
        max: z.number(),
        change: z.number(),
        changePercent: z.number(),
      })
      .strict(),
  })
  .strict();

// ── Trend analysis ───────────────────────────────────────────────────────

export const TrendAnalysisSchema = z
  .object({
    metric: AnalyticsMetricSchema,
    direction: TrendDirectionSchema,
    strength: z.number().min(0).max(1),
    changePercent: z.number(),
    confidence: z.number().min(0).max(1),
    points: z.array(AnalyticsDataPointSchema),
    projectedNext: z.number(),
    seasonalityDetected: z.boolean(),
    outliers: z.array(AnalyticsDataPointSchema),
  })
  .strict();
export type TrendAnalysis = z.infer<typeof TrendAnalysisSchema>;

// ── Insights & patterns ──────────────────────────────────────────────────

export const InsightSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    type: InsightTypeSchema,
    severity: InsightSeveritySchema,
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(2000),
    metric: AnalyticsMetricSchema,
    detectedAt: z.number().int().positive(),
    expiresAt: z.number().int().positive(),
    isRead: z.boolean(),
    isActioned: z.boolean(),
    actionType: z.string().optional(),
    actionPayload: z.record(z.unknown()).optional(),
    relatedMetrics: z.array(AnalyticsMetricSchema),
  })
  .strict();
export type Insight = z.infer<typeof InsightSchema>;

export const DetectedPatternSchema = z
  .object({
    id: z.string().uuid(),
    type: z.enum([
      'correlation',
      'anomaly',
      'cycle',
      'milestone',
      'regression',
    ]),
    metric: AnalyticsMetricSchema,
    description: z.string().min(1).max(1000),
    confidence: z.number().min(0).max(1),
    detectedAt: z.number().int().positive(),
    startDate: z.number().int().positive(),
    endDate: z.number().int().positive(),
    relatedEvents: z.array(z.string()),
    recommendations: z.array(z.string()),
  })
  .strict();
export type DetectedPattern = z.infer<typeof DetectedPatternSchema>;

// ── Comparative & aggregated stats ───────────────────────────────────────

export const ComparativeStatsSchema = z
  .object({
    metric: AnalyticsMetricSchema,
    currentPeriod: z
      .object({
        value: z.number(),
        startDate: z.number().int().positive(),
        endDate: z.number().int().positive(),
      })
      .strict(),
    previousPeriod: z
      .object({
        value: z.number(),
        startDate: z.number().int().positive(),
        endDate: z.number().int().positive(),
      })
      .strict(),
    change: z.number(),
    changePercent: z.number(),
    isSignificant: z.boolean(),
    benchmark: z
      .object({ value: z.number(), label: z.string() })
      .strict()
      .optional(),
  })
  .strict();
export type ComparativeStats = z.infer<typeof ComparativeStatsSchema>;

export const AggregatedStatsSchema = z
  .object({
    userId: z.string().uuid(),
    period: TimeRangeSchema,
    generatedAt: z.number().int().positive(),
    metrics: z.record(
      z
        .object({
          value: z.number(),
          previousValue: z.number(),
          changePercent: z.number(),
          trend: TrendDirectionSchema,
        })
        .strict(),
    ),
    insights: z.array(InsightSchema),
    patterns: z.array(DetectedPatternSchema),
    topPerforming: z
      .object({
        dayOfWeek: z.number().int().min(0).max(6),
        hourOfDay: z.number().int().min(0).max(23),
        category: z.string(),
      })
      .strict(),
  })
  .strict();
export type AggregatedStats = z.infer<typeof AggregatedStatsSchema>;
