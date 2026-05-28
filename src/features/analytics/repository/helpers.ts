import { z } from "zod";
import type { AnalyticsBucket, AggregatedPoint } from "./types";
import type { AnalyticsMetric } from "../schemas";

export function aggregateDataPoints(
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

export function getBucketTimestamp(
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
