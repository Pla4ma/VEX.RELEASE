import { z } from "zod";
import { getSupabaseClient, handleSupabaseError } from "../../config/supabase";
import {
  AggregatedStatsSchema,
  AnalyticsPreferencesSchema,
  DashboardLayoutSchema,
  DashboardWidgetSchema,
  DetectedPatternSchema,
  ExportJobSchema,
  InsightSchema,
  TimeSeriesDataSchema,
  getTimeRangeDates,
  type AnalyticsDimension,
  type AnalyticsFilter,
  type AnalyticsMetric,
  type TimeRange,
} from "./schemas";
const supabase = getSupabaseClient();
type AnalyticsBucket = {
  timestamp: number;
  values: number[];
  metadata: Record<string, unknown>;
};
type AggregatedPoint = {
  timestamp: number;
  value: number;
  metadata: Record<string, unknown>;
};
const SessionHeatmapInputSchema = z.object({
  userId: z.string().min(1),
  weeks: z.number().int().min(1).max(52),
});
const HeatmapBucketSchema = z.object({
  day: z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
  hour: z.number().int().min(0).max(23),
  value: z.number().int().min(0),
});
const SessionHeatmapDataSchema = z.object({
  totalSessions: z.number().int().min(0),
  buckets: z.array(HeatmapBucketSchema).length(7 * 24),
});
const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type SessionHeatmapData = z.infer<typeof SessionHeatmapDataSchema>;
export async function fetchTimeSeriesData(
  userId: string,
  metric: AnalyticsMetric,
  timeRange: TimeRange,
  granularity: "hour" | "day" | "week" | "month",
  dimensions?: AnalyticsDimension[],
  filters?: AnalyticsFilter[],
) {
  const { start, end } = getTimeRangeDates(timeRange);
  let query = supabase
    .from("analytics_events")
    .select("*")
    .eq("user_id", userId)
    .eq("metric_type", metric)
    .gte("timestamp", start)
    .lte("timestamp", end)
    .order("timestamp", { ascending: true });
  if (dimensions?.length) {
    query = query.in("dimension_type", dimensions);
  }
  if (filters?.length) {
    for (const filter of filters) {
      switch (filter.operator) {
        case "eq":
          query = query.eq(filter.dimension, filter.value);
          break;
        case "ne":
          query = query.neq(filter.dimension, filter.value);
          break;
        case "gt":
          query = query.gt(filter.dimension, filter.value);
          break;
        case "gte":
          query = query.gte(filter.dimension, filter.value);
          break;
        case "lt":
          query = query.lt(filter.dimension, filter.value);
          break;
        case "lte":
          query = query.lte(filter.dimension, filter.value);
          break;
        case "in":
          query = query.in(filter.dimension, filter.value as string[]);
          break;
      }
    }
  }
  const { data, error } = await query;
  if (error) {
    throw handleSupabaseError(error);
  }
  const aggregated = aggregateDataPoints(data ?? [], granularity, metric);
  return TimeSeriesDataSchema.parse({
    metric,
    granularity,
    points: aggregated.points,
    summary: aggregated.summary,
  });
}
export async function fetchSessionHeatmapData(
  userId: string,
  weeks: number,
): Promise<SessionHeatmapData> {
  const validated = SessionHeatmapInputSchema.parse({ userId, weeks });
  const periodStart = Date.now() - validated.weeks * 7 * 24 * 60 * 60 * 1000;
  const { data, error } = await supabase
    .from("analytics_events")
    .select("timestamp")
    .eq("user_id", validated.userId)
    .eq("metric_type", "sessions_completed")
    .gte("timestamp", periodStart)
    .order("timestamp", { ascending: false });
  if (error) {
    throw handleSupabaseError(error);
  }
  const timestamps = z
    .array(z.object({ timestamp: z.number().finite() }))
    .parse(data ?? []);
  const bucketMap = new Map<string, number>();
  for (const entry of timestamps) {
    const date = new Date(entry.timestamp);
    const day = HEATMAP_DAYS[(date.getDay() + 6) % 7];
    const hour = date.getHours();
    const bucketKey = `${day}-${hour}`;
    bucketMap.set(bucketKey, (bucketMap.get(bucketKey) ?? 0) + 1);
  }
  const buckets = HEATMAP_DAYS.flatMap((day) =>
    Array.from({ length: 24 }, (_, hour) =>
      HeatmapBucketSchema.parse({
        day,
        hour,
        value: bucketMap.get(`${day}-${hour}`) ?? 0,
      }),
    ),
  );
  return SessionHeatmapDataSchema.parse({
    totalSessions: timestamps.length,
    buckets,
  });
}
function aggregateDataPoints(
  rawData: unknown[],
  granularity: "hour" | "day" | "week" | "month",
  metric: AnalyticsMetric,
): {
  points: AggregatedPoint[];
  summary: {
    total: number;
    average: number;
    min: number;
    max: number;
    change: number;
    changePercent: number;
  };
} {
  const buckets = new Map<number, AnalyticsBucket>();
  for (const point of rawData) {
    const parsedPoint = z
      .object({
        timestamp: z.number(),
        value: z.number(),
        metadata: z.record(z.unknown()).optional(),
      })
      .parse(point);
    const bucketKey = getBucketTimestamp(parsedPoint.timestamp, granularity);
    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, {
        timestamp: bucketKey,
        values: [],
        metadata: {},
      });
    }
    const bucket = buckets.get(bucketKey);
    if (!bucket) {
      continue;
    }
    bucket.values.push(parsedPoint.value);
    if (parsedPoint.metadata) {
      Object.assign(bucket.metadata, parsedPoint.metadata);
    }
  }
  const points = Array.from(buckets.values())
    .sort((left, right) => left.timestamp - right.timestamp)
    .map((bucket) => ({
      timestamp: bucket.timestamp,
      value:
        bucket.values.reduce((sum, value) => sum + value, 0) /
        (metric.includes("average") ? bucket.values.length : 1),
      metadata: bucket.metadata,
    }));
  const values = points.map((point) => point.value);
  const total = values.reduce((sum, value) => sum + value, 0);
  const average = values.length > 0 ? total / values.length : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const firstValue = values[0] ?? 0;
  const lastValue = values[values.length - 1] ?? 0;
  const change = lastValue - firstValue;
  const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;
  return {
    points,
    summary: { total, average, min, max, change, changePercent },
  };
}
function getBucketTimestamp(
  timestamp: number,
  granularity: "hour" | "day" | "week" | "month",
): number {
  const date = new Date(timestamp);
  switch (granularity) {
    case "hour":
      date.setMinutes(0, 0, 0);
      break;
    case "day":
      date.setHours(0, 0, 0, 0);
      break;
    case "week": {
      const day = date.getDay();
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);
      break;
    }
    case "month":
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      break;
  }
  return date.getTime();
}
export async function fetchInsights(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    types?: string[];
    severities?: string[];
    limit?: number;
  },
) {
  let query = supabase
    .from("insights")
    .select("*")
    .eq("user_id", userId)
    .order("detected_at", { ascending: false });
  if (options?.unreadOnly) {
    query = query.eq("is_read", false);
  }
  if (options?.types?.length) {
    query = query.in("type", options.types);
  }
  if (options?.severities?.length) {
    query = query.in("severity", options.severities);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  const { data, error } = await query;
  if (error) {
    throw handleSupabaseError(error);
  }
  return z.array(InsightSchema).parse(data ?? []);
}
export async function createInsight(insight: z.infer<typeof InsightSchema>) {
  const { data, error } = await supabase
    .from("insights")
    .insert(insight)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return InsightSchema.parse(data);
}
export async function markInsightAsRead(userId: string, insightId: string) {
  const { data, error } = await supabase
    .from("insights")
    .update({ is_read: true })
    .eq("id", insightId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return InsightSchema.parse(data);
}
export async function markInsightAsActioned(
  userId: string,
  insightId: string,
  actionType: string,
  actionPayload?: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from("insights")
    .update({
      is_actioned: true,
      action_type: actionType,
      action_payload: actionPayload,
    })
    .eq("id", insightId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return InsightSchema.parse(data);
}
export async function fetchDashboardLayouts(userId: string) {
  const { data, error } = await supabase
    .from("dashboard_layouts")
    .select(
      `
      *,
      widgets:dashboard_widgets(*)
    `,
    )
    .eq("user_id", userId)
    .order("is_default", { ascending: false });
  if (error) {
    throw handleSupabaseError(error);
  }
  return z.array(DashboardLayoutSchema).parse(data ?? []);
}
export async function fetchDefaultDashboard(userId: string) {
  const { data, error } = await supabase
    .from("dashboard_layouts")
    .select(
      `
      *,
      widgets:dashboard_widgets(*)
    `,
    )
    .eq("user_id", userId)
    .eq("is_default", true)
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return data ? DashboardLayoutSchema.parse(data) : null;
}
export async function createDashboardLayout(
  layout: z.infer<typeof DashboardLayoutSchema>,
) {
  const { widgets, ...layoutData } = layout;
  const { data, error } = await supabase
    .from("dashboard_layouts")
    .insert(layoutData)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  if (widgets?.length) {
    const { error: widgetError } = await supabase
      .from("dashboard_widgets")
      .insert(widgets.map((widget) => ({ ...widget, dashboard_id: data.id })));
    if (widgetError) {
      throw handleSupabaseError(widgetError);
    }
  }
  return DashboardLayoutSchema.parse({ ...data, widgets: widgets ?? [] });
}
export async function updateDashboardWidget(
  widgetId: string,
  updates: Partial<z.infer<typeof DashboardWidgetSchema>>,
) {
  const { data, error } = await supabase
    .from("dashboard_widgets")
    .update({ ...updates, updated_at: Date.now() })
    .eq("id", widgetId)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return DashboardWidgetSchema.parse(data);
}
export async function deleteDashboardWidget(widgetId: string) {
  const { error } = await supabase
    .from("dashboard_widgets")
    .delete()
    .eq("id", widgetId);
  if (error) {
    throw handleSupabaseError(error);
  }
}
export async function fetchExportJobs(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from("export_jobs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    throw handleSupabaseError(error);
  }
  return z.array(ExportJobSchema).parse(data ?? []);
}
export async function createExportJob(job: z.infer<typeof ExportJobSchema>) {
  const { data, error } = await supabase
    .from("export_jobs")
    .insert(job)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return ExportJobSchema.parse(data);
}
export async function updateExportJobProgress(
  jobId: string,
  progress: number,
  fileUrl?: string,
  fileSize?: number,
) {
  const updates: Record<string, unknown> = { progress };
  if (fileUrl) {
    updates.file_url = fileUrl;
    updates.file_size = fileSize;
    updates.status = "completed";
    updates.completed_at = Date.now();
  }
  const { data, error } = await supabase
    .from("export_jobs")
    .update(updates)
    .eq("id", jobId)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return ExportJobSchema.parse(data);
}
export async function markExportJobFailed(jobId: string, errorMessage: string) {
  const { data, error } = await supabase
    .from("export_jobs")
    .update({ status: "failed", error_message: errorMessage })
    .eq("id", jobId)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return ExportJobSchema.parse(data);
}
export async function fetchAnalyticsPreferences(userId: string) {
  const { data, error } = await supabase
    .from("analytics_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") {
    throw handleSupabaseError(error);
  }
  return data ? AnalyticsPreferencesSchema.parse(data) : null;
}
export async function updateAnalyticsPreferences(
  userId: string,
  preferences: Partial<z.infer<typeof AnalyticsPreferencesSchema>>,
) {
  const { data, error } = await supabase
    .from("analytics_preferences")
    .upsert({ user_id: userId, ...preferences, updated_at: Date.now() })
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return AnalyticsPreferencesSchema.parse(data);
}
export async function fetchAggregatedStats(userId: string, period: TimeRange) {
  const { data, error } = await supabase
    .from("aggregated_stats")
    .select("*")
    .eq("user_id", userId)
    .eq("period", period)
    .single();
  if (error && error.code !== "PGRST116") {
    throw handleSupabaseError(error);
  }
  return data ? AggregatedStatsSchema.parse(data) : null;
}
export async function storeAggregatedStats(
  stats: z.infer<typeof AggregatedStatsSchema>,
) {
  const { data, error } = await supabase
    .from("aggregated_stats")
    .upsert(stats)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return AggregatedStatsSchema.parse(data);
}
export async function fetchDetectedPatterns(
  userId: string,
  options?: { since?: number; types?: string[]; minConfidence?: number },
) {
  let query = supabase
    .from("detected_patterns")
    .select("*")
    .eq("user_id", userId)
    .order("detected_at", { ascending: false });
  if (options?.since) {
    query = query.gte("detected_at", options.since);
  }
  if (options?.types?.length) {
    query = query.in("type", options.types);
  }
  if (options?.minConfidence !== undefined) {
    query = query.gte("confidence", options.minConfidence);
  }
  const { data, error } = await query;
  if (error) {
    throw handleSupabaseError(error);
  }
  return z.array(DetectedPatternSchema).parse(data ?? []);
}
export async function storeDetectedPattern(
  pattern: z.infer<typeof DetectedPatternSchema>,
) {
  const { data, error } = await supabase
    .from("detected_patterns")
    .insert(pattern)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return DetectedPatternSchema.parse(data);
}
export async function deleteOldAnalyticsData(
  userId: string,
  olderThan: number,
) {
  const { error } = await supabase
    .from("analytics_events")
    .delete()
    .eq("user_id", userId)
    .lt("timestamp", olderThan);
  if (error) {
    throw handleSupabaseError(error);
  }
}
export async function bulkInsertAnalyticsEvents(
  events: Array<{
    user_id: string;
    metric_type: AnalyticsMetric;
    timestamp: number;
    value: number;
    dimension_type?: AnalyticsDimension;
    dimension_value?: string;
    metadata?: Record<string, unknown>;
  }>,
) {
  const { error } = await supabase.from("analytics_events").insert(events);
  if (error) {
    throw handleSupabaseError(error);
  }
}
