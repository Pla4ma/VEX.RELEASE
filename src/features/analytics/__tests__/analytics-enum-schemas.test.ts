/**
 * Analytics Enum Schema Tests
 */

import {
  AnalyticsMetricSchema,
  AnalyticsDimensionSchema,
  TrendDirectionSchema,
  TimeRangeSchema,
  InsightSeveritySchema,
  InsightTypeSchema,
  DashboardWidgetTypeSchema,
  ExportFormatSchema,
} from "../enums";

describe("Analytics Enum Schemas", () => {
  describe("AnalyticsMetricSchema", () => {
    it("accepts valid metrics", () => {
      expect(AnalyticsMetricSchema.parse("sessions_completed")).toBe(
        "sessions_completed",
      );
      expect(AnalyticsMetricSchema.parse("xp_earned")).toBe("xp_earned");
      expect(AnalyticsMetricSchema.parse("streak_days")).toBe("streak_days");
    });

    it("rejects invalid metric", () => {
      expect(() => AnalyticsMetricSchema.parse("invalid_metric")).toThrow();
    });
  });

  describe("AnalyticsDimensionSchema", () => {
    it("accepts valid dimensions", () => {
      expect(AnalyticsDimensionSchema.parse("day_of_week")).toBe(
        "day_of_week",
      );
      expect(AnalyticsDimensionSchema.parse("hour_of_day")).toBe(
        "hour_of_day",
      );
      expect(AnalyticsDimensionSchema.parse("session_category")).toBe(
        "session_category",
      );
    });

    it("rejects invalid dimension", () => {
      expect(() => AnalyticsDimensionSchema.parse("invalid")).toThrow();
    });
  });

  describe("TrendDirectionSchema", () => {
    it("accepts valid directions", () => {
      const directions = ["up", "down", "flat", "volatile", "seasonal"];
      directions.forEach((d) => {
        expect(TrendDirectionSchema.parse(d)).toBe(d);
      });
    });

    it("rejects invalid direction", () => {
      expect(() => TrendDirectionSchema.parse("sideways")).toThrow();
    });
  });

  describe("TimeRangeSchema", () => {
    it("accepts valid time ranges", () => {
      const ranges = [
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
      ];
      ranges.forEach((r) => {
        expect(TimeRangeSchema.parse(r)).toBe(r);
      });
    });

    it("rejects invalid range", () => {
      expect(() => TimeRangeSchema.parse("invalid")).toThrow();
    });
  });

  describe("InsightSeveritySchema", () => {
    it("accepts valid severities", () => {
      const severities = ["info", "positive", "warning", "critical", "celebration"];
      severities.forEach((s) => {
        expect(InsightSeveritySchema.parse(s)).toBe(s);
      });
    });

    it("rejects invalid severity", () => {
      expect(() => InsightSeveritySchema.parse("emergency")).toThrow();
    });
  });

  describe("InsightTypeSchema", () => {
    it("accepts valid insight types", () => {
      expect(InsightTypeSchema.parse("milestone_reached")).toBe(
        "milestone_reached",
      );
      expect(InsightTypeSchema.parse("streak_at_risk")).toBe("streak_at_risk");
      expect(InsightTypeSchema.parse("boss_defeated")).toBe("boss_defeated");
    });

    it("rejects invalid type", () => {
      expect(() => InsightTypeSchema.parse("invalid_type")).toThrow();
    });
  });

  describe("DashboardWidgetTypeSchema", () => {
    it("accepts valid widget types", () => {
      const types = [
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
      ];
      types.forEach((t) => {
        expect(DashboardWidgetTypeSchema.parse(t)).toBe(t);
      });
    });

    it("rejects invalid widget type", () => {
      expect(() => DashboardWidgetTypeSchema.parse("scatter")).toThrow();
    });
  });

  describe("ExportFormatSchema", () => {
    it("accepts valid formats", () => {
      const formats = ["json", "csv", "xlsx", "pdf"];
      formats.forEach((f) => {
        expect(ExportFormatSchema.parse(f)).toBe(f);
      });
    });

    it("rejects invalid format", () => {
      expect(() => ExportFormatSchema.parse("xml")).toThrow();
    });
  });
});
