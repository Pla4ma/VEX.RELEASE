/**
 * Smart Notification Scheduler — Types & Schemas
 *
 * Zod schemas own all types. Constants live here to avoid circular imports.
 */

import { z } from "zod";

// ─── Constants ──────────────────────────────────────────────────────────────

export const ANALYSIS_WINDOW_DAYS = 14;
export const DEFAULT_PEAK_HOUR = 19;
export const MAX_NOTIFICATIONS_PER_DAY = 1;

// ─── Schemas & Inferred Types ───────────────────────────────────────────────

export const PeakFocusWindowSchema = z.object({
  userId: z.string(),
  peakHour: z.number().min(0).max(23),
  confidence: z.number().min(0).max(1),
  sessionCount: z.number(),
  pattern: z.enum(["CONSISTENT", "VARIABLE", "ERRATIC", "NEW"]),
  hourDistribution: z.record(z.number(), z.number()),
});
export type PeakFocusWindow = z.infer<typeof PeakFocusWindowSchema>;

export const NotificationContentTypeSchema = z.enum([
  "STREAK",
  "BOSS",
  "SOCIAL",
  "POSITIVE",
  "COMEBACK",
  "RANK_REPORT",
]);
export type NotificationContentType = z.infer<
  typeof NotificationContentTypeSchema
>;

export const SmartNotificationConfigSchema = z.object({
  userId: z.string(),
  peakWindow: PeakFocusWindowSchema,
  lastNotificationSent: z.number().optional(),
  notificationCountToday: z.number().default(0),
  preferredContentTypes: z
    .array(NotificationContentTypeSchema)
    .default(["STREAK", "BOSS", "SOCIAL", "POSITIVE"]),
});
export type SmartNotificationConfig = z.infer<
  typeof SmartNotificationConfigSchema
>;

export interface NotificationContent {
  title: string;
  body: string;
  data: Record<string, unknown>;
}
