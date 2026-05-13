import { z } from "zod";


export const AnalyticsMetricSchema = z.enum(['sessions_completed', 'sessions_abandoned', 'total_focus_time', 'average_session_duration', 'streak_days', 'longest_streak', 'xp_earned', 'level_progression', 'boss_damage_dealt', 'bosses_defeated', 'rewards_claimed', 'coins_earned', 'coins_spent', 'gems_earned', 'gems_spent', 'items_crafted', 'challenges_completed', 'social_interactions', 'squad_contributions', 'daily_active', 'weekly_active', 'retention_rate']);

export const AnalyticsDimensionSchema = z.enum(['day_of_week', 'hour_of_day', 'session_category', 'streak_milestone', 'boss_type', 'item_type', 'challenge_difficulty', 'social_activity_type', 'time_of_day', 'device_type']);

export const TrendDirectionSchema = z.enum(['up', 'down', 'flat', 'volatile', 'seasonal']);

export const TimeRangeSchema = z.enum(['today', 'yesterday', 'last_7_days', 'last_30_days', 'this_week', 'last_week', 'this_month', 'last_month', 'this_year', 'last_year', 'all_time', 'custom']);

export const InsightSeveritySchema = z.enum(['info', 'positive', 'warning', 'critical', 'celebration']);

export const InsightTypeSchema = z.enum(['milestone_reached', 'streak_at_risk', 'streak_achieved', 'improvement_detected', 'decline_detected', 'pattern_discovered', 'anomaly_detected', 'comparison_insight', 'recommendation', 'achievement_unlocked', 'boss_defeated', 'level_up', 'season_progress']);

export const DashboardWidgetTypeSchema = z.enum(['line_chart', 'bar_chart', 'pie_chart', 'stat_card', 'trend_indicator', 'heatmap', 'leaderboard', 'goal_progress', 'comparison_chart', 'insight_card', 'pattern_list']);

export const ExportFormatSchema = z.enum(['json', 'csv', 'xlsx', 'pdf']);

export const AnalyticsFilterSchema = z
  .object({
    dimension: AnalyticsDimensionSchema,
    operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'between']),
    value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.array(z.number())]),
  })
  .strict();

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

export const DashboardWidgetSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    type: DashboardWidgetTypeSchema,
    title: z.string().min(1).max(100),
    position: z
      .object({
        x: z.number().int().min(0),
        y: z.number().int().min(0),
        w: z.number().int().min(1).max(12),
        h: z.number().int().min(1).max(12),
      })
      .strict(),
    config: z
      .object({
        metric: AnalyticsMetricSchema.optional(),
        dimension: AnalyticsDimensionSchema.optional(),
        timeRange: TimeRangeSchema.optional(),
        comparisonEnabled: z.boolean().optional(),
        filters: z.array(AnalyticsFilterSchema).optional(),
        colorScheme: z.string().optional(),
        showLegend: z.boolean().optional(),
        showGrid: z.boolean().optional(),
      })
      .strict(),
    isVisible: z.boolean(),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
  })
  .strict();

export const DashboardLayoutSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    name: z.string().min(1).max(100),
    isDefault: z.boolean(),
    widgets: z.array(DashboardWidgetSchema),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
  })
  .strict();

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
      .object({
        value: z.number(),
        label: z.string(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const DetectedPatternSchema = z
  .object({
    id: z.string().uuid(),
    type: z.enum(['correlation', 'anomaly', 'cycle', 'milestone', 'regression']),
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