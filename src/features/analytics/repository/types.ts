import { z } from 'zod';

export type AnalyticsBucket = {
  timestamp: number;
  values: number[];
  metadata: Record<string, unknown>;
};

export type AggregatedPoint = {
  timestamp: number;
  value: number;
  metadata: Record<string, unknown>;
};

export const SessionHeatmapInputSchema = z.object({
  userId: z.string().min(1),
  weeks: z.number().int().min(1).max(52),
});

export const HeatmapBucketSchema = z.object({
  day: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
  hour: z.number().int().min(0).max(23),
  value: z.number().int().min(0),
});

export const SessionHeatmapDataSchema = z.object({
  totalSessions: z.number().int().min(0),
  buckets: z.array(HeatmapBucketSchema).length(7 * 24),
});

export const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export type SessionHeatmapData = z.infer<typeof SessionHeatmapDataSchema>;
