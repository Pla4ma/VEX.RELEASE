import { z } from "zod";

// ── Metric & dimension enums ─────────────────────────────────────────────

export const AnalyticsMetricSchema = z.enum([
  "sessions_completed",
  "sessions_abandoned",
  "total_focus_time",
  "average_session_duration",
  "streak_days",
  "longest_streak",
  "xp_earned",
  "level_progression",
  "boss_damage_dealt",
  "bosses_defeated",
  "rewards_claimed",
  "coins_earned",
  "coins_spent",
  "gems_earned",
  "gems_spent",
  "items_crafted",
  "challenges_completed",
  "social_interactions",
  "squad_contributions",
  "daily_active",
  "weekly_active",
  "retention_rate",
]);
export type AnalyticsMetric = z.infer<typeof AnalyticsMetricSchema>;

export const AnalyticsDimensionSchema = z.enum([
  "day_of_week",
  "hour_of_day",
  "session_category",
  "streak_milestone",
  "boss_type",
  "item_type",
  "challenge_difficulty",
  "social_activity_type",
  "time_of_day",
  "device_type",
]);
export type AnalyticsDimension = z.infer<typeof AnalyticsDimensionSchema>;

// ── Trend & time enums ───────────────────────────────────────────────────

export const TrendDirectionSchema = z.enum([
  "up",
  "down",
  "flat",
  "volatile",
  "seasonal",
]);
export type TrendDirection = z.infer<typeof TrendDirectionSchema>;

export const TimeRangeSchema = z.enum([
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "this_week",
  "last_week",
  "this_month",
  "last_month",
  "this_year",
  "last_year",
  "all_time",
  "custom",
]);
export type TimeRange = z.infer<typeof TimeRangeSchema>;

// ── Insight enums ────────────────────────────────────────────────────────

export const InsightSeveritySchema = z.enum([
  "info",
  "positive",
  "warning",
  "critical",
  "celebration",
]);
export type InsightSeverity = z.infer<typeof InsightSeveritySchema>;

export const InsightTypeSchema = z.enum([
  "milestone_reached",
  "streak_at_risk",
  "streak_achieved",
  "improvement_detected",
  "decline_detected",
  "pattern_discovered",
  "anomaly_detected",
  "comparison_insight",
  "recommendation",
  "achievement_unlocked",
  "boss_defeated",
  "level_up",
  "season_progress",
]);
export type InsightType = z.infer<typeof InsightTypeSchema>;

// ── Dashboard & export enums ─────────────────────────────────────────────

export const DashboardWidgetTypeSchema = z.enum([
  "line_chart",
  "bar_chart",
  "pie_chart",
  "stat_card",
  "trend_indicator",
  "heatmap",
  "leaderboard",
  "goal_progress",
  "comparison_chart",
  "insight_card",
  "pattern_list",
]);
export type DashboardWidgetType = z.infer<typeof DashboardWidgetTypeSchema>;

export const ExportFormatSchema = z.enum(["json", "csv", "xlsx", "pdf"]);
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
