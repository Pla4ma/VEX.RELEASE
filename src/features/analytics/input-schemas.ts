import { z } from "zod";
import {
  AnalyticsMetricSchema,
  AnalyticsDimensionSchema,
  TimeRangeSchema,
  InsightTypeSchema,
  InsightSeveritySchema,
  ExportFormatSchema,
} from "./enums";
import { AnalyticsFilterSchema } from "./data-schemas";

// ── Query inputs ─────────────────────────────────────────────────────────

export const GetAnalyticsDataInputSchema = z
  .object({
    userId: z.string().uuid(),
    metrics: z.array(AnalyticsMetricSchema).min(1),
    timeRange: TimeRangeSchema,
    granularity: z.enum(["hour", "day", "week", "month"]),
    dimensions: z.array(AnalyticsDimensionSchema).optional(),
    filters: z.array(AnalyticsFilterSchema).optional(),
    includeComparison: z.boolean().optional(),
  })
  .strict();

// ── Mutation inputs ──────────────────────────────────────────────────────

export const CreateInsightInputSchema = z
  .object({
    userId: z.string().uuid(),
    type: InsightTypeSchema,
    severity: InsightSeveritySchema,
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(2000),
    metric: AnalyticsMetricSchema,
    expiresInDays: z.number().int().min(1).max(365).default(30),
    actionType: z.string().optional(),
    actionPayload: z.record(z.unknown()).optional(),
    relatedMetrics: z.array(AnalyticsMetricSchema).default([]),
  })
  .strict();

export const CreateExportJobInputSchema = z
  .object({
    userId: z.string().uuid(),
    format: ExportFormatSchema,
    dataTypes: z.array(z.string()).min(1),
    dateRange: z
      .object({
        start: z.number().int().positive(),
        end: z.number().int().positive(),
      })
      .strict(),
    filters: z.array(AnalyticsFilterSchema).optional(),
  })
  .strict();

export const UpdateDashboardWidgetInputSchema = z
  .object({
    widgetId: z.string().uuid(),
    userId: z.string().uuid(),
    updates: z
      .object({
        title: z.string().min(1).max(100).optional(),
        position: z
          .object({
            x: z.number().int().min(0),
            y: z.number().int().min(0),
            w: z.number().int().min(1).max(12),
            h: z.number().int().min(1).max(12),
          })
          .strict()
          .optional(),
        config: z.record(z.unknown()).optional(),
        isVisible: z.boolean().optional(),
      })
      .strict(),
  })
  .strict();

// ── Utilities ────────────────────────────────────────────────────────────

export function getTimeRangeDates(range: z.infer<typeof TimeRangeSchema>): {
  start: number;
  end: number;
} {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  switch (range) {
    case "today":
      return { start: new Date(now).setHours(0, 0, 0, 0), end: now };
    case "yesterday":
      return {
        start: new Date(now - oneDay).setHours(0, 0, 0, 0),
        end: new Date(now - oneDay).setHours(23, 59, 59, 999),
      };
    case "last_7_days":
      return { start: now - 7 * oneDay, end: now };
    case "last_30_days":
      return { start: now - 30 * oneDay, end: now };
    case "this_week": {
      const currentWeekDay = new Date(now).getDay();
      return { start: now - currentWeekDay * oneDay, end: now };
    }
    case "this_month": {
      const currentMonthDay = new Date(now).getDate();
      return { start: now - (currentMonthDay - 1) * oneDay, end: now };
    }
    case "this_year": {
      const startOfYear = new Date(now).setMonth(0, 1);
      return { start: startOfYear, end: now };
    }
    case "all_time":
      return { start: 0, end: now };
    default:
      return { start: now - 7 * oneDay, end: now };
  }
}
