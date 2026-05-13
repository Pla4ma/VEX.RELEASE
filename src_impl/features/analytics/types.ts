/**
 * Analytics Feature Types
 * Domain types for analytics dashboards, insights, and trend analysis
 */

import type { z } from 'zod';
import type { AnalyticsMetricSchema, AnalyticsDimensionSchema, TrendDirectionSchema, TimeRangeSchema, InsightSeveritySchema, InsightTypeSchema, DashboardWidgetTypeSchema, ExportFormatSchema, AnalyticsFilterSchema } from './schemas';

// Metric and dimension types
export type AnalyticsMetric = z.infer<typeof AnalyticsMetricSchema>;
export type AnalyticsDimension = z.infer<typeof AnalyticsDimensionSchema>;
export type TrendDirection = z.infer<typeof TrendDirectionSchema>;
export type TimeRange = z.infer<typeof TimeRangeSchema>;
export type InsightSeverity = z.infer<typeof InsightSeveritySchema>;
export type InsightType = z.infer<typeof InsightTypeSchema>;
export type DashboardWidgetType = z.infer<typeof DashboardWidgetTypeSchema>;
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
export type AnalyticsFilter = z.infer<typeof AnalyticsFilterSchema>;

// Analytics data point
// Time series data
// Trend analysis result
// Insight
// Dashboard widget configuration
// Dashboard layout
// Comparative stats
// Pattern detection result
// Export job
// User analytics preferences
// Aggregated stats
// Analytics state for UI
// Degraded analytics mode state
export * from "./types.types";
