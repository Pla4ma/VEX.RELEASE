import type { z } from 'zod';
import type {
  AnalyticsMetricSchema,
  AnalyticsDimensionSchema,
  TrendDirectionSchema,
  TimeRangeSchema,
  InsightSeveritySchema,
  InsightTypeSchema,
  DashboardWidgetTypeSchema,
  ExportFormatSchema,
  AnalyticsFilterSchema,
} from './schemas';
export type AnalyticsMetric = z.infer<typeof AnalyticsMetricSchema>;
export type AnalyticsDimension = z.infer<typeof AnalyticsDimensionSchema>;
export type TrendDirection = z.infer<typeof TrendDirectionSchema>;
export type TimeRange = z.infer<typeof TimeRangeSchema>;
export type InsightSeverity = z.infer<typeof InsightSeveritySchema>;
export type InsightType = z.infer<typeof InsightTypeSchema>;
export type DashboardWidgetType = z.infer<typeof DashboardWidgetTypeSchema>;
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
export type AnalyticsFilter = z.infer<typeof AnalyticsFilterSchema>;
export interface AnalyticsDataPoint {
  timestamp: number;
  value: number;
  dimension?: string;
  metadata?: Record<string, unknown>;
}
export interface TimeSeriesData {
  metric: AnalyticsMetric;
  granularity: 'hour' | 'day' | 'week' | 'month';
  points: AnalyticsDataPoint[];
  summary: {
    total: number;
    average: number;
    min: number;
    max: number;
    change: number;
    changePercent: number;
  };
}
export interface TrendAnalysis {
  metric: AnalyticsMetric;
  direction: TrendDirection;
  strength: number;
  changePercent: number;
  confidence: number;
  points: AnalyticsDataPoint[];
  projectedNext: number;
  seasonalityDetected: boolean;
  outliers: AnalyticsDataPoint[];
}
export interface Insight {
  id: string;
  userId: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  metric: AnalyticsMetric;
  detectedAt: number;
  expiresAt: number;
  isRead: boolean;
  isActioned: boolean;
  actionType?: string;
  actionPayload?: Record<string, unknown>;
  relatedMetrics: AnalyticsMetric[];
}
export interface DashboardWidget {
  id: string;
  userId: string;
  type: DashboardWidgetType;
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: {
    metric?: AnalyticsMetric;
    dimension?: AnalyticsDimension;
    timeRange?: TimeRange;
    comparisonEnabled?: boolean;
    filters?: AnalyticsFilter[];
    colorScheme?: string;
    showLegend?: boolean;
    showGrid?: boolean;
  };
  isVisible: boolean;
  createdAt: number;
  updatedAt: number;
}
export interface DashboardLayout {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  createdAt: number;
  updatedAt: number;
}
export interface ComparativeStats {
  metric: AnalyticsMetric;
  currentPeriod: { value: number; startDate: number; endDate: number };
  previousPeriod: { value: number; startDate: number; endDate: number };
  change: number;
  changePercent: number;
  isSignificant: boolean;
  benchmark?: { value: number; label: string };
}
export interface DetectedPattern {
  id: string;
  type: 'correlation' | 'anomaly' | 'cycle' | 'milestone' | 'regression';
  metric: AnalyticsMetric;
  description: string;
  confidence: number;
  detectedAt: number;
  startDate: number;
  endDate: number;
  relatedEvents: string[];
  recommendations: string[];
}
export interface ExportJob {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  format: ExportFormat;
  dataTypes: string[];
  dateRange: { start: number; end: number };
  filters?: AnalyticsFilter[];
  fileUrl?: string;
  fileSize?: number;
  errorMessage?: string;
  progress: number;
  createdAt: number;
  completedAt?: number;
  expiresAt?: number;
}
export interface AnalyticsPreferences {
  userId: string;
  defaultTimeRange: TimeRange;
  defaultDashboardId: string;
  emailReportsEnabled: boolean;
  emailReportFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  insightNotificationsEnabled: boolean;
  autoRefreshEnabled: boolean;
  autoRefreshInterval: number;
  currencyDisplay: 'coins' | 'gems' | 'both';
  timezone: string;
  updatedAt: number;
}
export interface AggregatedStats {
  userId: string;
  period: TimeRange;
  generatedAt: number;
  metrics: Record<
    AnalyticsMetric,
    {
      value: number;
      previousValue: number;
      changePercent: number;
      trend: TrendDirection;
    }
  >;
  insights: Insight[];
  patterns: DetectedPattern[];
  topPerforming: { dayOfWeek: number; hourOfDay: number; category: string };
}
export interface AnalyticsState {
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  selectedTimeRange: TimeRange;
  selectedMetrics: AnalyticsMetric[];
  selectedDimensions: AnalyticsDimension[];
  filters: AnalyticsFilter[];
  data: Record<string, TimeSeriesData>;
  insights: Insight[];
  patterns: DetectedPattern[];
  comparisons: ComparativeStats[];
}
export interface DegradedAnalyticsState {
  enabled: boolean;
  reason: 'offline' | 'rate_limited' | 'server_error' | 'cache_only';
  availableMetrics: AnalyticsMetric[];
  dataFreshness: 'realtime' | 'stale' | 'cached' | 'unavailable';
  lastSuccessfulFetch: number;
}
