/**
 * Barrel re-export for analytics schemas.
 *
 * Splits are domain-scoped:
 *  - enums.ts          — all enum schemas & inferred types
 *  - data-schemas.ts   — filter, data-point, trend, insight, pattern, stats
 *  - dashboard-schemas.ts — widget, layout, preferences, export job
 *  - input-schemas.ts  — mutation/query inputs + getTimeRangeDates
 */

// ── Enums ────────────────────────────────────────────────────────────────
export {
  AnalyticsMetricSchema,
  type AnalyticsMetric,
  AnalyticsDimensionSchema,
  type AnalyticsDimension,
  TrendDirectionSchema,
  type TrendDirection,
  TimeRangeSchema,
  type TimeRange,
  InsightSeveritySchema,
  type InsightSeverity,
  InsightTypeSchema,
  type InsightType,
  DashboardWidgetTypeSchema,
  type DashboardWidgetType,
  ExportFormatSchema,
  type ExportFormat,
} from './enums';

// ── Data schemas ─────────────────────────────────────────────────────────
export {
  AnalyticsFilterSchema,
  type AnalyticsFilter,
  AnalyticsDataPointSchema,
  TimeSeriesDataSchema,
  TrendAnalysisSchema,
  type TrendAnalysis,
  InsightSchema,
  type Insight,
  DetectedPatternSchema,
  type DetectedPattern,
  ComparativeStatsSchema,
  type ComparativeStats,
  AggregatedStatsSchema,
  type AggregatedStats,
} from './data-schemas';

// ── Dashboard & export schemas ───────────────────────────────────────────
export {
  DashboardWidgetSchema,
  type DashboardWidget,
  DashboardLayoutSchema,
  type DashboardLayout,
  ExportJobSchema,
  type ExportJob,
  AnalyticsPreferencesSchema,
} from './dashboard-schemas';

// ── Input schemas & utilities ────────────────────────────────────────────
export {
  GetAnalyticsDataInputSchema,
  CreateInsightInputSchema,
  CreateExportJobInputSchema,
  UpdateDashboardWidgetInputSchema,
  getTimeRangeDates,
} from './input-schemas';
