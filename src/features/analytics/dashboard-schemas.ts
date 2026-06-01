import { z } from 'zod';
import {
  AnalyticsMetricSchema,
  AnalyticsDimensionSchema,
  TimeRangeSchema,
  DashboardWidgetTypeSchema,
  ExportFormatSchema,
} from './enums';
import { AnalyticsFilterSchema } from './data-schemas';

// ── Dashboard widget ─────────────────────────────────────────────────────

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
export type DashboardWidget = z.infer<typeof DashboardWidgetSchema>;

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
export type DashboardLayout = z.infer<typeof DashboardLayoutSchema>;

// ── Export job ───────────────────────────────────────────────────────────

export const ExportJobSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    status: z.enum([
      'pending',
      'processing',
      'completed',
      'failed',
      'cancelled',
    ]),
    format: ExportFormatSchema,
    dataTypes: z.array(z.string()).min(1),
    dateRange: z
      .object({
        start: z.number().int().positive(),
        end: z.number().int().positive(),
      })
      .strict(),
    filters: z.array(AnalyticsFilterSchema).optional(),
    fileUrl: z.string().url().optional(),
    fileSize: z.number().int().positive().optional(),
    errorMessage: z.string().optional(),
    progress: z.number().min(0).max(100),
    createdAt: z.number().int().positive(),
    completedAt: z.number().int().positive().optional(),
    expiresAt: z.number().int().positive().optional(),
  })
  .strict();
export type ExportJob = z.infer<typeof ExportJobSchema>;

// ── User preferences ────────────────────────────────────────────────────

export const AnalyticsPreferencesSchema = z
  .object({
    userId: z.string().uuid(),
    defaultTimeRange: TimeRangeSchema,
    defaultDashboardId: z.string().uuid(),
    emailReportsEnabled: z.boolean(),
    emailReportFrequency: z.enum(['daily', 'weekly', 'monthly', 'never']),
    insightNotificationsEnabled: z.boolean(),
    autoRefreshEnabled: z.boolean(),
    autoRefreshInterval: z.number().int().min(5000).max(300000),
    currencyDisplay: z.enum(['coins', 'gems', 'both']),
    timezone: z.string(),
    updatedAt: z.number().int().positive(),
  })
  .strict();
