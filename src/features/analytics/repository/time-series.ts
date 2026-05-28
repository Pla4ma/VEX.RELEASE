import { z } from "zod";
import { getSupabaseClient, handleSupabaseError } from "../../../config/supabase";
import {
  TimeSeriesDataSchema,
  getTimeRangeDates,
  type AnalyticsDimension,
  type AnalyticsFilter,
  type AnalyticsMetric,
  type TimeRange,
} from "../schemas";
import { aggregateDataPoints } from "./helpers";
import {
  SessionHeatmapInputSchema,
  HeatmapBucketSchema,
  SessionHeatmapDataSchema,
  HEATMAP_DAYS,
  type SessionHeatmapData,
} from "./types";

const supabase = getSupabaseClient();

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
