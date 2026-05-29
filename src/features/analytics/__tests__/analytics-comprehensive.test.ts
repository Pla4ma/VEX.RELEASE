/**
 * Comprehensive Analytics Feature Tests
 * Covers: enum schemas, data schemas, dashboard schemas, input schemas,
 * getTimeRangeDates, validation functions, batch validation, repository helpers,
 * events, integration helpers, and integration queries.
 */

// ── Mocks ──────────────────────────────────────────────────────────────────────

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));

jest.mock("../../../events/EventBus", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));

jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  }),
}));

jest.mock("../../../utils/silent-failure", () => ({
  captureSilentFailure: jest.fn(),
}));

jest.mock("../../../config/supabase", () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
          order: jest.fn(() => ({
            limit: jest.fn(() =>
              Promise.resolve({ data: [], error: null }),
            ),
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() =>
                  Promise.resolve({ data: null, error: null }),
                ),
              })),
            })),
            in: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() =>
                  Promise.resolve({ data: null, error: null }),
                ),
              })),
            })),
          })),
          in: jest.fn(() => ({
            order: jest.fn(() =>
              Promise.resolve({ data: [], error: null }),
            ),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({ data: null, error: null }),
            ),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          lt: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  })),
  handleSupabaseError: jest.fn((e: unknown) => e),
}));

jest.mock("../../../shared/hardening", () => ({
  withRetry: jest.fn((fn: () => unknown) => fn()),
  CircuitBreaker: jest.fn().mockImplementation(() => ({
    execute: jest.fn((fn: () => unknown) => fn()),
  })),
  classifyError: jest.fn(() => ({
    type: "unknown",
    retryable: false,
    severity: "high",
  })),
  TTLCache: jest.fn().mockImplementation(() => ({
    get: jest.fn(() => undefined),
    set: jest.fn(),
    has: jest.fn(() => false),
    delete: jest.fn(),
    clear: jest.fn(),
    size: 0,
  })),
}));

jest.mock("../repository/storage", () => ({
  uploadExportData: jest.fn(() =>
    Promise.resolve({ url: "https://example.com/export.json", size: 1024 }),
  ),
  downloadExportData: jest.fn(() => Promise.resolve({ data: {} })),
  deleteExportData: jest.fn(() => Promise.resolve(undefined)),
  getStorageMetrics: jest.fn(() =>
    Promise.resolve({ totalSize: 0, fileCount: 0 }),
  ),
  cleanupOldExports: jest.fn(() => Promise.resolve({ deleted: 0 })),
}));

// ── Imports ────────────────────────────────────────────────────────────────────

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

import {
  AnalyticsFilterSchema,
  AnalyticsDataPointSchema,
  TimeSeriesDataSchema,
  TrendAnalysisSchema,
  InsightSchema,
  DetectedPatternSchema,
  ComparativeStatsSchema,
  AggregatedStatsSchema,
} from "../data-schemas";

import {
  DashboardWidgetSchema,
  DashboardLayoutSchema,
  ExportJobSchema,
  AnalyticsPreferencesSchema,
} from "../dashboard-schemas";

import {
  GetAnalyticsDataInputSchema,
  CreateInsightInputSchema,
  CreateExportJobInputSchema,
  UpdateDashboardWidgetInputSchema,
  getTimeRangeDates,
} from "../input-schemas";

import {
  validateTimeRange,
  validateMetrics,
  validateExportConfig,
  validateInsight,
  validateFilter,
  AnalyticsValidationError,
} from "../validation";

import { batchValidate, formatValidationErrors } from "../validation/batch";

import {
  aggregateDataPoints,
  getBucketTimestamp,
} from "../repository/helpers";

import {
  emitInsightGenerated,
  emitInsightRead,
  emitPatternDetected,
  emitExportRequested,
  emitExportCompleted,
  emitExportFailed,
  emitDashboardUpdated,
  emitPreferencesChanged,
} from "../events";

import {
  updateIntegrationState,
  getTimeOfDay,
} from "../integration-helpers";

import { analyticsKeys } from "../hooks/analyticsKeys";

// ── Enum Schema Tests ─────────────────────────────────────────────────────────

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

// ── Data Schema Tests ─────────────────────────────────────────────────────────

describe("Analytics Data Schemas", () => {
  describe("AnalyticsFilterSchema", () => {
    it("accepts valid filter", () => {
      const filter = {
        dimension: "session_category",
        operator: "eq" as const,
        value: "boss",
      };
      expect(() => AnalyticsFilterSchema.parse(filter)).not.toThrow();
    });

    it("accepts filter with array value", () => {
      const filter = {
        dimension: "boss_type",
        operator: "in" as const,
        value: ["dragon", "goblin"],
      };
      expect(() => AnalyticsFilterSchema.parse(filter)).not.toThrow();
    });

    it("rejects filter with invalid operator", () => {
      const filter = {
        dimension: "session_category",
        operator: "contains",
        value: "boss",
      };
      expect(() => AnalyticsFilterSchema.parse(filter)).toThrow();
    });
  });

  describe("AnalyticsDataPointSchema", () => {
    it("accepts valid data point", () => {
      const point = { timestamp: Date.now(), value: 42 };
      expect(() => AnalyticsDataPointSchema.parse(point)).not.toThrow();
    });

    it("accepts data point with metadata", () => {
      const point = {
        timestamp: Date.now(),
        value: 42,
        metadata: { category: "boss" },
      };
      expect(() => AnalyticsDataPointSchema.parse(point)).not.toThrow();
    });

    it("rejects negative timestamp", () => {
      const point = { timestamp: -1, value: 42 };
      expect(() => AnalyticsDataPointSchema.parse(point)).toThrow();
    });
  });

  describe("TimeSeriesDataSchema", () => {
    it("accepts valid time series data", () => {
      const data = {
        metric: "sessions_completed",
        granularity: "day",
        points: [{ timestamp: Date.now(), value: 5 }],
        summary: {
          total: 5,
          average: 5,
          min: 5,
          max: 5,
          change: 0,
          changePercent: 0,
        },
      };
      expect(() => TimeSeriesDataSchema.parse(data)).not.toThrow();
    });

    it("rejects empty points array", () => {
      const data = {
        metric: "sessions_completed",
        granularity: "day",
        points: [],
        summary: {
          total: 0,
          average: 0,
          min: 0,
          max: 0,
          change: 0,
          changePercent: 0,
        },
      };
      expect(() => TimeSeriesDataSchema.parse(data)).toThrow();
    });
  });

  describe("TrendAnalysisSchema", () => {
    it("accepts valid trend analysis", () => {
      const trend = {
        metric: "xp_earned",
        direction: "up",
        strength: 0.8,
        changePercent: 15.5,
        confidence: 0.9,
        points: [],
        projectedNext: 100,
        seasonalityDetected: false,
        outliers: [],
      };
      expect(() => TrendAnalysisSchema.parse(trend)).not.toThrow();
    });

    it("rejects strength > 1", () => {
      const trend = {
        metric: "xp_earned",
        direction: "up",
        strength: 1.5,
        changePercent: 15.5,
        confidence: 0.9,
        points: [],
        projectedNext: 100,
        seasonalityDetected: false,
        outliers: [],
      };
      expect(() => TrendAnalysisSchema.parse(trend)).toThrow();
    });
  });

  describe("InsightSchema", () => {
    const validInsight = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      userId: "550e8400-e29b-41d4-a716-446655440001",
      type: "milestone_reached",
      severity: "celebration",
      title: "500 XP Milestone!",
      description: "You earned 500 total XP!",
      metric: "xp_earned",
      detectedAt: Date.now(),
      expiresAt: Date.now() + 86400000,
      isRead: false,
      isActioned: false,
      relatedMetrics: ["xp_earned"],
    };

    it("accepts valid insight", () => {
      expect(() => InsightSchema.parse(validInsight)).not.toThrow();
    });

    it("rejects insight with empty title", () => {
      expect(() =>
        InsightSchema.parse({ ...validInsight, title: "" }),
      ).toThrow();
    });

    it("rejects insight with title > 200 chars", () => {
      expect(() =>
        InsightSchema.parse({ ...validInsight, title: "a".repeat(201) }),
      ).toThrow();
    });

    it("rejects insight with invalid UUID", () => {
      expect(() =>
        InsightSchema.parse({ ...validInsight, id: "not-a-uuid" }),
      ).toThrow();
    });
  });

  describe("DetectedPatternSchema", () => {
    const validPattern = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      type: "correlation",
      metric: "sessions_completed",
      description: "Sessions correlate with time of day",
      confidence: 0.85,
      detectedAt: Date.now(),
      startDate: Date.now() - 86400000,
      endDate: Date.now(),
      relatedEvents: ["session_complete"],
      recommendations: ["Focus in mornings"],
    };

    it("accepts valid pattern", () => {
      expect(() => DetectedPatternSchema.parse(validPattern)).not.toThrow();
    });

    it("rejects pattern with invalid type", () => {
      expect(() =>
        DetectedPatternSchema.parse({ ...validPattern, type: "trend" }),
      ).toThrow();
    });

    it("rejects confidence > 1", () => {
      expect(() =>
        DetectedPatternSchema.parse({ ...validPattern, confidence: 1.5 }),
      ).toThrow();
    });
  });

  describe("ComparativeStatsSchema", () => {
    const validStats = {
      metric: "sessions_completed",
      currentPeriod: {
        value: 10,
        startDate: Date.now() - 86400000,
        endDate: Date.now(),
      },
      previousPeriod: {
        value: 8,
        startDate: Date.now() - 172800000,
        endDate: Date.now() - 86400000,
      },
      change: 2,
      changePercent: 25,
      isSignificant: true,
    };

    it("accepts valid stats", () => {
      expect(() => ComparativeStatsSchema.parse(validStats)).not.toThrow();
    });

    it("accepts stats with benchmark", () => {
      const withBenchmark = {
        ...validStats,
        benchmark: { value: 15, label: "Average user" },
      };
      expect(() =>
        ComparativeStatsSchema.parse(withBenchmark),
      ).not.toThrow();
    });
  });

  describe("AggregatedStatsSchema", () => {
    const validAgg = {
      userId: "550e8400-e29b-41d4-a716-446655440000",
      period: "last_7_days",
      generatedAt: Date.now(),
      metrics: {
        sessions_completed: {
          value: 10,
          previousValue: 8,
          changePercent: 25,
          trend: "up",
        },
      },
      insights: [],
      patterns: [],
      topPerforming: {
        dayOfWeek: 1,
        hourOfDay: 9,
        category: "work",
      },
    };

    it("accepts valid aggregated stats", () => {
      expect(() => AggregatedStatsSchema.parse(validAgg)).not.toThrow();
    });

    it("rejects dayOfWeek > 6", () => {
      expect(() =>
        AggregatedStatsSchema.parse({
          ...validAgg,
          topPerforming: { dayOfWeek: 7, hourOfDay: 9, category: "work" },
        }),
      ).toThrow();
    });

    it("rejects hourOfDay > 23", () => {
      expect(() =>
        AggregatedStatsSchema.parse({
          ...validAgg,
          topPerforming: { dayOfWeek: 1, hourOfDay: 25, category: "work" },
        }),
      ).toThrow();
    });
  });
});

// ── Dashboard Schema Tests ────────────────────────────────────────────────────

describe("Dashboard Schemas", () => {
  describe("DashboardWidgetSchema", () => {
    const validWidget = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      userId: "550e8400-e29b-41d4-a716-446655440001",
      type: "line_chart",
      title: "Sessions Over Time",
      position: { x: 0, y: 0, w: 6, h: 4 },
      config: {},
      isVisible: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it("accepts valid widget", () => {
      expect(() => DashboardWidgetSchema.parse(validWidget)).not.toThrow();
    });

    it("rejects widget with position width > 12", () => {
      expect(() =>
        DashboardWidgetSchema.parse({
          ...validWidget,
          position: { x: 0, y: 0, w: 13, h: 4 },
        }),
      ).toThrow();
    });

    it("rejects widget with empty title", () => {
      expect(() =>
        DashboardWidgetSchema.parse({ ...validWidget, title: "" }),
      ).toThrow();
    });
  });

  describe("DashboardLayoutSchema", () => {
    const validLayout = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      userId: "550e8400-e29b-41d4-a716-446655440001",
      name: "My Dashboard",
      isDefault: true,
      widgets: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it("accepts valid layout", () => {
      expect(() => DashboardLayoutSchema.parse(validLayout)).not.toThrow();
    });

    it("rejects layout with empty name", () => {
      expect(() =>
        DashboardLayoutSchema.parse({ ...validLayout, name: "" }),
      ).toThrow();
    });
  });

  describe("ExportJobSchema", () => {
    const validJob = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      userId: "550e8400-e29b-41d4-a716-446655440001",
      status: "pending",
      format: "json",
      dataTypes: ["sessions"],
      dateRange: { start: Date.now() - 86400000, end: Date.now() },
      progress: 0,
      createdAt: Date.now(),
    };

    it("accepts valid job", () => {
      expect(() => ExportJobSchema.parse(validJob)).not.toThrow();
    });

    it("rejects job with progress > 100", () => {
      expect(() =>
        ExportJobSchema.parse({ ...validJob, progress: 101 }),
      ).toThrow();
    });

    it("rejects job with empty dataTypes", () => {
      expect(() =>
        ExportJobSchema.parse({ ...validJob, dataTypes: [] }),
      ).toThrow();
    });

    it("accepts completed job with fileUrl", () => {
      const completed = {
        ...validJob,
        status: "completed",
        progress: 100,
        fileUrl: "https://example.com/export.json",
        completedAt: Date.now(),
      };
      expect(() => ExportJobSchema.parse(completed)).not.toThrow();
    });
  });

  describe("AnalyticsPreferencesSchema", () => {
    const validPrefs = {
      userId: "550e8400-e29b-41d4-a716-446655440000",
      defaultTimeRange: "last_7_days",
      defaultDashboardId: "550e8400-e29b-41d4-a716-446655440001",
      emailReportsEnabled: false,
      emailReportFrequency: "weekly",
      insightNotificationsEnabled: true,
      autoRefreshEnabled: true,
      autoRefreshInterval: 30000,
      currencyDisplay: "both",
      timezone: "America/New_York",
      updatedAt: Date.now(),
    };

    it("accepts valid preferences", () => {
      expect(() =>
        AnalyticsPreferencesSchema.parse(validPrefs),
      ).not.toThrow();
    });

    it("rejects autoRefreshInterval < 5000", () => {
      expect(() =>
        AnalyticsPreferencesSchema.parse({
          ...validPrefs,
          autoRefreshInterval: 1000,
        }),
      ).toThrow();
    });

    it("rejects invalid emailReportFrequency", () => {
      expect(() =>
        AnalyticsPreferencesSchema.parse({
          ...validPrefs,
          emailReportFrequency: "hourly",
        }),
      ).toThrow();
    });
  });
});

// ── Input Schema Tests ────────────────────────────────────────────────────────

describe("Input Schemas", () => {
  describe("GetAnalyticsDataInputSchema", () => {
    const validInput = {
      userId: "550e8400-e29b-41d4-a716-446655440000",
      metrics: ["sessions_completed"],
      timeRange: "last_7_days",
      granularity: "day",
    };

    it("accepts valid input", () => {
      expect(() => GetAnalyticsDataInputSchema.parse(validInput)).not.toThrow();
    });

    it("rejects empty metrics", () => {
      expect(() =>
        GetAnalyticsDataInputSchema.parse({ ...validInput, metrics: [] }),
      ).toThrow();
    });

    it("rejects extra fields (strict)", () => {
      expect(() =>
        GetAnalyticsDataInputSchema.parse({
          ...validInput,
          extraField: true,
        }),
      ).toThrow();
    });
  });

  describe("CreateInsightInputSchema", () => {
    const validInput = {
      userId: "550e8400-e29b-41d4-a716-446655440000",
      type: "milestone_reached",
      severity: "celebration",
      title: "500 XP!",
      description: "You earned 500 XP total",
      metric: "xp_earned",
    };

    it("accepts valid input", () => {
      expect(() => CreateInsightInputSchema.parse(validInput)).not.toThrow();
    });

    it("applies default expiresInDays", () => {
      const parsed = CreateInsightInputSchema.parse(validInput);
      expect(parsed.expiresInDays).toBe(30);
    });

    it("applies default relatedMetrics", () => {
      const parsed = CreateInsightInputSchema.parse(validInput);
      expect(parsed.relatedMetrics).toEqual([]);
    });
  });

  describe("CreateExportJobInputSchema", () => {
    const validInput = {
      userId: "550e8400-e29b-41d4-a716-446655440000",
      format: "json",
      dataTypes: ["sessions"],
      dateRange: { start: Date.now() - 86400000, end: Date.now() },
    };

    it("accepts valid input", () => {
      expect(() => CreateExportJobInputSchema.parse(validInput)).not.toThrow();
    });

    it("rejects empty dataTypes", () => {
      expect(() =>
        CreateExportJobInputSchema.parse({ ...validInput, dataTypes: [] }),
      ).toThrow();
    });
  });

  describe("UpdateDashboardWidgetInputSchema", () => {
    const validInput = {
      widgetId: "550e8400-e29b-41d4-a716-446655440000",
      userId: "550e8400-e29b-41d4-a716-446655440001",
      updates: {
        title: "New Title",
      },
    };

    it("accepts valid input", () => {
      expect(() =>
        UpdateDashboardWidgetInputSchema.parse(validInput),
      ).not.toThrow();
    });

    it("accepts empty updates (all fields optional)", () => {
      expect(() =>
        UpdateDashboardWidgetInputSchema.parse({
          ...validInput,
          updates: {},
        }),
      ).not.toThrow();
    });
  });
});

// ── getTimeRangeDates ─────────────────────────────────────────────────────────

describe("getTimeRangeDates", () => {
  it("returns start and end for today", () => {
    const { start, end } = getTimeRangeDates("today");
    expect(start).toBeLessThanOrEqual(end);
    expect(end).toBeLessThanOrEqual(Date.now() + 1000);
  });

  it("returns correct range for last_7_days", () => {
    const { start, end } = getTimeRangeDates("last_7_days");
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const rangeMs = end - start;
    expect(rangeMs).toBeGreaterThanOrEqual(sevenDaysMs - 1000);
    expect(rangeMs).toBeLessThanOrEqual(sevenDaysMs + 1000);
  });

  it("returns correct range for last_30_days", () => {
    const { start, end } = getTimeRangeDates("last_30_days");
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const rangeMs = end - start;
    expect(rangeMs).toBeGreaterThanOrEqual(thirtyDaysMs - 1000);
  });

  it("returns start=0 for all_time", () => {
    const { start } = getTimeRangeDates("all_time");
    expect(start).toBe(0);
  });

  it("returns valid range for this_week", () => {
    const { start, end } = getTimeRangeDates("this_week");
    expect(start).toBeLessThanOrEqual(end);
    expect(end).toBeLessThanOrEqual(Date.now() + 1000);
  });

  it("returns valid range for this_month", () => {
    const { start, end } = getTimeRangeDates("this_month");
    expect(start).toBeLessThanOrEqual(end);
  });

  it("returns valid range for this_year", () => {
    const { start, end } = getTimeRangeDates("this_year");
    expect(start).toBeLessThanOrEqual(end);
  });

  it("returns valid range for yesterday", () => {
    const { start, end } = getTimeRangeDates("yesterday");
    expect(start).toBeLessThan(end);
    // Yesterday should be before today
    const { start: todayStart } = getTimeRangeDates("today");
    expect(start).toBeLessThan(todayStart);
  });

  it("defaults to 7-day range for custom", () => {
    const { start, end } = getTimeRangeDates("custom");
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const rangeMs = end - start;
    expect(rangeMs).toBeGreaterThanOrEqual(sevenDaysMs - 1000);
  });
});

// ── Validation Functions ──────────────────────────────────────────────────────

describe("Validation: validateTimeRange", () => {
  it("accepts valid range", () => {
    const now = Date.now();
    const result = validateTimeRange(now - 86400000, now);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.sanitized).toBeDefined();
  });

  it("rejects negative startDate", () => {
    const result = validateTimeRange(-1, Date.now());
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "INVALID_TIMESTAMP")).toBe(
      true,
    );
  });

  it("rejects inverted range", () => {
    const now = Date.now();
    const result = validateTimeRange(now, now - 86400000);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "INVERTED_RANGE")).toBe(true);
  });

  it("warns on future end date", () => {
    const now = Date.now();
    const result = validateTimeRange(now - 86400000, now + 120000);
    expect(result.warnings.some((w) => w.code === "FUTURE_DATE")).toBe(true);
  });

  it("rejects range exceeding max days", () => {
    const now = Date.now();
    const result = validateTimeRange(now - 400 * 86400000, now, 365);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "RANGE_TOO_LARGE")).toBe(true);
  });

  it("warns on very old data", () => {
    const now = Date.now();
    const twoYearsAgo = now - 2 * 365 * 86400000;
    const result = validateTimeRange(twoYearsAgo, twoYearsAgo + 60 * 86400000);
    expect(result.warnings.some((w) => w.code === "VERY_OLD_DATA")).toBe(true);
  });

  it("uses custom maxRangeDays", () => {
    const now = Date.now();
    const result = validateTimeRange(now - 10 * 86400000, now, 5);
    expect(result.valid).toBe(false);
  });
});

describe("Validation: validateMetrics", () => {
  it("accepts valid metrics", () => {
    const result = validateMetrics(["sessions_completed", "xp_earned"]);
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBeDefined();
  });

  it("rejects empty array", () => {
    const result = validateMetrics([]);
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe("EMPTY_SELECTION");
  });

  it("rejects invalid metrics", () => {
    const result = validateMetrics(["invalid_metric"]);
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe("INVALID_METRICS");
  });

  it("warns on too many metrics", () => {
    const metrics = [
      "sessions_completed",
      "sessions_abandoned",
      "total_focus_time",
      "average_session_duration",
      "streak_days",
      "longest_streak",
      "xp_earned",
      "level_progression",
      "boss_damage_dealt",
      "items_crafted",
      "coins_spent",
    ];
    const result = validateMetrics(metrics);
    expect(result.warnings.some((w) => w.code === "TOO_MANY_METRICS")).toBe(
      true,
    );
  });

  it("warns on duplicate metrics", () => {
    const result = validateMetrics([
      "sessions_completed",
      "sessions_completed",
    ]);
    expect(result.warnings.some((w) => w.code === "DUPLICATE_METRIC")).toBe(
      true,
    );
  });
});

describe("Validation: validateInsight", () => {
  const validInsight = {
    title: "500 XP Milestone!",
    description: "You earned 500 total XP.",
    severity: "celebration",
    metric: "xp_earned",
  };

  it("accepts valid insight", () => {
    const result = validateInsight(validInsight);
    expect(result.valid).toBe(true);
  });

  it("rejects empty title", () => {
    const result = validateInsight({ ...validInsight, title: "" });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe("EMPTY_TITLE");
  });

  it("rejects title > 200 chars", () => {
    const result = validateInsight({
      ...validInsight,
      title: "a".repeat(201),
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe("TITLE_TOO_LONG");
  });

  it("rejects empty description", () => {
    const result = validateInsight({ ...validInsight, description: "" });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe("EMPTY_DESCRIPTION");
  });

  it("warns on long description", () => {
    const result = validateInsight({
      ...validInsight,
      description: "a".repeat(2001),
    });
    expect(result.warnings.some((w) => w.code === "DESCRIPTION_LONG")).toBe(
      true,
    );
  });

  it("rejects invalid severity", () => {
    const result = validateInsight({ ...validInsight, severity: "emergency" });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe("INVALID_SEVERITY");
  });

  it("warns on untracked metric", () => {
    const result = validateInsight({
      ...validInsight,
      metric: "social_interactions",
    });
    expect(result.warnings.some((w) => w.code === "UNKNOWN_METRIC")).toBe(
      true,
    );
  });
});

describe("Validation: validateFilter", () => {
  it("accepts valid filter", () => {
    const result = validateFilter({
      dimension: "session_category",
      operator: "eq",
      value: "boss",
    });
    expect(result.valid).toBe(true);
  });

  it("rejects invalid dimension", () => {
    const result = validateFilter({
      dimension: "invalid_dim",
      operator: "eq",
      value: "boss",
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe("INVALID_DIMENSION");
  });

  it("rejects invalid operator", () => {
    const result = validateFilter({
      dimension: "session_category",
      operator: "contains",
      value: "boss",
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe("INVALID_OPERATOR");
  });

  it("rejects non-array value for 'in' operator", () => {
    const result = validateFilter({
      dimension: "session_category",
      operator: "in",
      value: "boss",
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe("INVALID_VALUE_TYPE");
  });
});

describe("Validation: validateExportConfig", () => {
  const validConfig = {
    format: "json",
    dataTypes: ["sessions"],
    dateRange: { start: Date.now() - 86400000, end: Date.now() },
    userId: "user-123",
  };

  it("accepts valid config", () => {
    const result = validateExportConfig(validConfig);
    expect(result.valid).toBe(true);
  });

  it("rejects invalid format", () => {
    const result = validateExportConfig({ ...validConfig, format: "xml" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "INVALID_FORMAT")).toBe(true);
  });

  it("rejects missing userId", () => {
    const result = validateExportConfig({ ...validConfig, userId: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "MISSING_USER_ID")).toBe(true);
  });

  it("warns on unknown data type", () => {
    const result = validateExportConfig({
      ...validConfig,
      dataTypes: ["sessions", "unknown_type"],
    });
    expect(
      result.warnings.some((w) => w.code === "UNKNOWN_DATA_TYPE"),
    ).toBe(true);
  });
});

// ── Batch Validation ──────────────────────────────────────────────────────────

describe("batchValidate", () => {
  it("validates all items in batch", async () => {
    const items = [1, 2, 3];
    const validator = (item: number) => ({
      valid: item > 0,
      errors: item > 0 ? [] : [{ field: "x", code: "ERR", message: "err", severity: "error" as const }],
      warnings: [],
    });

    const result = await batchValidate(items, validator);
    expect(result.summary.total).toBe(3);
    expect(result.summary.valid).toBe(3);
    expect(result.summary.invalid).toBe(0);
  });

  it("reports invalid items", async () => {
    const items = [1, -1, 3];
    const validator = (item: number) => ({
      valid: item > 0,
      errors: item > 0 ? [] : [{ field: "x", code: "ERR", message: "err", severity: "error" as const }],
      warnings: [],
    });

    const result = await batchValidate(items, validator);
    expect(result.summary.invalid).toBe(1);
  });

  it("handles validator exceptions", async () => {
    const items = [1, 2];
    const validator = (item: number) => {
      if (item === 2) throw new Error("boom");
      return { valid: true, errors: [], warnings: [] };
    };

    const result = await batchValidate(items, validator);
    expect(result.summary.errors).toBeGreaterThanOrEqual(1);
  });

  it("calls onProgress callback", async () => {
    const items = [1, 2, 3];
    const onProgress = jest.fn();
    const validator = () => ({ valid: true, errors: [], warnings: [] });

    await batchValidate(items, validator, { onProgress });
    expect(onProgress).toHaveBeenCalledTimes(3);
  });

  it("stops early when continueOnError is false", async () => {
    const items = [1, -1, 3, -2];
    const validator = (item: number) => ({
      valid: item > 0,
      errors: item > 0 ? [] : [{ field: "x", code: "ERR", message: "err", severity: "error" as const }],
      warnings: [],
    });

    const result = await batchValidate(items, validator, {
      continueOnError: false,
      maxErrors: 1,
    });
    expect(result.results.length).toBeLessThan(4);
  });
});

describe("formatValidationErrors", () => {
  it("formats errors with recovery hints", () => {
    const errors = [
      {
        field: "startDate",
        code: "INVALID",
        message: "Invalid date",
        severity: "error" as const,
        recoveryHint: "Use Date.now()",
      },
    ];
    const formatted = formatValidationErrors(errors);
    expect(formatted).toContain("[ERROR]");
    expect(formatted).toContain("startDate");
    expect(formatted).toContain("Hint");
  });

  it("formats errors without recovery hints", () => {
    const errors = [
      {
        field: "title",
        code: "EMPTY",
        message: "Title is empty",
        severity: "error" as const,
      },
    ];
    const formatted = formatValidationErrors(errors);
    expect(formatted).toContain("Title is empty");
    expect(formatted).not.toContain("Hint");
  });

  it("formats multiple errors", () => {
    const errors = [
      {
        field: "a",
        code: "A",
        message: "err a",
        severity: "error" as const,
      },
      {
        field: "b",
        code: "B",
        message: "err b",
        severity: "warning" as const,
      },
    ];
    const formatted = formatValidationErrors(errors);
    expect(formatted.split("\n").length).toBe(2);
  });
});

// ── Repository Helpers ────────────────────────────────────────────────────────

describe("Repository Helpers", () => {
  describe("getBucketTimestamp", () => {
    it("floors to hour for hour granularity", () => {
      const ts = new Date("2024-06-15T14:37:00Z").getTime();
      const bucket = getBucketTimestamp(ts, "hour");
      const bucketDate = new Date(bucket);
      expect(bucketDate.getUTCMinutes()).toBe(0);
      expect(bucketDate.getUTCSeconds()).toBe(0);
    });

    it("floors to day for day granularity", () => {
      const ts = new Date("2024-06-15T14:37:00Z").getTime();
      const bucket = getBucketTimestamp(ts, "day");
      const bucketDate = new Date(bucket);
      expect(bucketDate.getHours()).toBe(0);
    });

    it("floors to month for month granularity", () => {
      const ts = new Date("2024-06-15T14:37:00Z").getTime();
      const bucket = getBucketTimestamp(ts, "month");
      const bucketDate = new Date(bucket);
      expect(bucketDate.getDate()).toBe(1);
    });
  });

  describe("aggregateDataPoints", () => {
    it("aggregates single point", () => {
      const rawData = [{ timestamp: Date.now(), value: 10 }];
      const result = aggregateDataPoints(rawData, "day", "sessions_completed");
      expect(result.points.length).toBe(1);
      expect(result.summary.total).toBe(10);
    });

    it("aggregates multiple points in same bucket", () => {
      const ts1 = new Date("2024-06-15T10:00:00Z").getTime();
      const ts2 = new Date("2024-06-15T11:00:00Z").getTime();
      const rawData = [
        { timestamp: ts1, value: 5 },
        { timestamp: ts2, value: 10 },
      ];
      const result = aggregateDataPoints(rawData, "day", "sessions_completed");
      expect(result.points.length).toBe(1);
      expect(result.summary.total).toBe(15);
    });

    it("aggregates points in different day buckets", () => {
      const ts1 = new Date("2024-06-15T10:00:00Z").getTime();
      const ts2 = new Date("2024-06-16T10:00:00Z").getTime();
      const rawData = [
        { timestamp: ts1, value: 5 },
        { timestamp: ts2, value: 10 },
      ];
      const result = aggregateDataPoints(rawData, "day", "sessions_completed");
      expect(result.points.length).toBe(2);
      expect(result.summary.total).toBe(15);
      expect(result.summary.min).toBe(5);
      expect(result.summary.max).toBe(10);
    });

    it("calculates change from first to last point", () => {
      const ts1 = new Date("2024-06-15T10:00:00Z").getTime();
      const ts2 = new Date("2024-06-16T10:00:00Z").getTime();
      const rawData = [
        { timestamp: ts1, value: 5 },
        { timestamp: ts2, value: 15 },
      ];
      const result = aggregateDataPoints(rawData, "day", "sessions_completed");
      expect(result.summary.change).toBe(10);
      expect(result.summary.changePercent).toBe(200);
    });

    it("handles empty raw data", () => {
      const result = aggregateDataPoints([], "day", "sessions_completed");
      expect(result.points.length).toBe(0);
      expect(result.summary.total).toBe(0);
      expect(result.summary.average).toBe(0);
    });

    it("averages for average metric type", () => {
      const ts1 = new Date("2024-06-15T10:00:00Z").getTime();
      const ts2 = new Date("2024-06-15T11:00:00Z").getTime();
      const rawData = [
        { timestamp: ts1, value: 10 },
        { timestamp: ts2, value: 20 },
      ];
      const result = aggregateDataPoints(
        rawData,
        "day",
        "average_session_duration",
      );
      // average_session_duration includes "average" so should divide by count
      expect(result.points[0]!.value).toBe(15);
    });
  });
});

// ── Events ────────────────────────────────────────────────────────────────────

describe("Analytics Events", () => {
  it("emitInsightGenerated publishes event", () => {
    const { eventBus } = require("../../../events");
    emitInsightGenerated("user-1", {
      id: "insight-1",
      type: "milestone_reached",
    } as any);
    expect(eventBus.publish).toHaveBeenCalledWith(
      "analytics:insight_generated",
      expect.objectContaining({ userId: "user-1", insightId: "insight-1" }),
    );
  });

  it("emitInsightRead publishes event", () => {
    const { eventBus } = require("../../../events");
    emitInsightRead("user-1", "insight-1");
    expect(eventBus.publish).toHaveBeenCalledWith(
      "analytics:insight_read",
      expect.objectContaining({ userId: "user-1", insightId: "insight-1" }),
    );
  });

  it("emitPatternDetected publishes event", () => {
    const { eventBus } = require("../../../events");
    emitPatternDetected("user-1", {
      id: "pattern-1",
      type: "anomaly",
      confidence: 0.9,
    } as any);
    expect(eventBus.publish).toHaveBeenCalledWith(
      "analytics:pattern_detected",
      expect.objectContaining({
        userId: "user-1",
        patternId: "pattern-1",
        type: "anomaly",
      }),
    );
  });

  it("emitExportRequested publishes event", () => {
    const { eventBus } = require("../../../events");
    emitExportRequested({
      id: "job-1",
      userId: "user-1",
      format: "json",
    } as any);
    expect(eventBus.publish).toHaveBeenCalledWith(
      "analytics:export_requested",
      expect.objectContaining({ jobId: "job-1", format: "json" }),
    );
  });

  it("emitExportCompleted publishes event", () => {
    const { eventBus } = require("../../../events");
    emitExportCompleted({
      id: "job-1",
      userId: "user-1",
      fileUrl: "https://example.com/export.json",
    } as any);
    expect(eventBus.publish).toHaveBeenCalledWith(
      "analytics:export_completed",
      expect.objectContaining({ jobId: "job-1" }),
    );
  });

  it("emitExportFailed publishes event", () => {
    const { eventBus } = require("../../../events");
    emitExportFailed("job-1", "user-1", "Network error");
    expect(eventBus.publish).toHaveBeenCalledWith(
      "analytics:export_failed",
      expect.objectContaining({ jobId: "job-1", error: "Network error" }),
    );
  });

  it("emitDashboardUpdated publishes event", () => {
    const { eventBus } = require("../../../events");
    emitDashboardUpdated("user-1", "dash-1", ["widget_added"]);
    expect(eventBus.publish).toHaveBeenCalledWith(
      "analytics:dashboard_updated",
      expect.objectContaining({ dashboardId: "dash-1" }),
    );
  });

  it("emitPreferencesChanged publishes event", () => {
    const { eventBus } = require("../../../events");
    emitPreferencesChanged("user-1", { timezone: "UTC" });
    expect(eventBus.publish).toHaveBeenCalledWith(
      "analytics:preferences_changed",
      expect.objectContaining({ userId: "user-1" }),
    );
  });
});

// ── Integration Helpers ───────────────────────────────────────────────────────

describe("Integration Helpers", () => {
  describe("updateIntegrationState", () => {
    it("accumulates values for new user", () => {
      updateIntegrationState("new-user", {
        sessionCount: 5,
        totalFocusTime: 100,
        xpEarned: 50,
        streakDays: 3,
        lastSync: Date.now(),
      });
      // No assertion needed - just ensure it doesn't throw
    });

    it("merges with existing state", () => {
      updateIntegrationState("merge-user", {
        sessionCount: 5,
        totalFocusTime: 100,
        xpEarned: 50,
        streakDays: 0,
        lastSync: Date.now(),
      });
      updateIntegrationState("merge-user", {
        sessionCount: 3,
        totalFocusTime: 60,
        xpEarned: 30,
        streakDays: 0,
        lastSync: Date.now(),
      });
      // Just ensure no errors
    });
  });

  describe("getTimeOfDay", () => {
    it("returns a valid time of day string", () => {
      const timeOfDay = getTimeOfDay();
      expect([
        "night",
        "morning",
        "afternoon",
        "evening",
      ]).toContain(timeOfDay);
    });
  });
});

// ── Analytics Keys ────────────────────────────────────────────────────────────

describe("analyticsKeys", () => {
  it("generates data key", () => {
    const key = analyticsKeys.data("user-1", ["sessions_completed"], "today");
    expect(key).toContain("analytics");
    expect(key).toContain("data");
    expect(key).toContain("user-1");
  });

  it("generates trend key", () => {
    const key = analyticsKeys.trend("user-1", "xp_earned", "last_7_days");
    expect(key).toContain("trend");
  });

  it("generates insights key", () => {
    const key = analyticsKeys.insights("user-1", { unreadOnly: true });
    expect(key).toContain("insights");
  });

  it("generates patterns key", () => {
    const key = analyticsKeys.patterns("user-1");
    expect(key).toContain("patterns");
  });

  it("generates dashboard key", () => {
    const key = analyticsKeys.dashboard("user-1");
    expect(key).toContain("dashboard");
  });

  it("generates exportJobs key", () => {
    const key = analyticsKeys.exportJobs("user-1");
    expect(key).toContain("exports");
  });

  it("generates preferences key", () => {
    const key = analyticsKeys.preferences("user-1");
    expect(key).toContain("preferences");
  });

  it("generates summary key", () => {
    const key = analyticsKeys.summary("user-1", "last_30_days");
    expect(key).toContain("summary");
  });

  it("generates sessionHeatmap key", () => {
    const key = analyticsKeys.sessionHeatmap("user-1", 4);
    expect(key).toContain("session-heatmap");
  });

  it("all keys start with 'analytics'", () => {
    const allKeys = [
      analyticsKeys.all,
      analyticsKeys.data("u", ["sessions_completed"], "today"),
      analyticsKeys.trend("u", "xp_earned", "today"),
      analyticsKeys.insights("u"),
      analyticsKeys.patterns("u"),
      analyticsKeys.dashboard("u"),
      analyticsKeys.exportJobs("u"),
      analyticsKeys.preferences("u"),
      analyticsKeys.summary("u", "today"),
      analyticsKeys.sessionHeatmap("u", 4),
    ];
    allKeys.forEach((key) => {
      expect(key[0]).toBe("analytics");
    });
  });
});

// ── AnalyticsValidationError ──────────────────────────────────────────────────

describe("AnalyticsValidationError", () => {
  it("creates error with all fields", () => {
    const error = new AnalyticsValidationError(
      "Invalid field",
      "startDate",
      "INVALID",
      "Use valid date",
      -1,
    );
    expect(error.message).toBe("Invalid field");
    expect(error.field).toBe("startDate");
    expect(error.code).toBe("INVALID");
    expect(error.recoveryHint).toBe("Use valid date");
    expect(error.value).toBe(-1);
    expect(error.name).toBe("AnalyticsValidationError");
    expect(error instanceof Error).toBe(true);
  });
});
