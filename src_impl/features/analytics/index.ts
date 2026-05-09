/**
 * Analytics Feature
 * Comprehensive analytics dashboards, insights, and trend analysis
 */

// Types
export type {
  AnalyticsMetric,
  AnalyticsDimension,
  TrendDirection,
  TimeRange,
  InsightSeverity,
  InsightType,
  DashboardWidgetType,
  ExportFormat,
  AnalyticsFilter,
  TrendAnalysis,
  Insight,
  DetectedPattern,
  ComparativeStats,
  AggregatedStats,
  ExportJob,
  DashboardLayout,
  DashboardWidget,
} from './schemas';

// Schemas
export {
  AnalyticsMetricSchema,
  AnalyticsDimensionSchema,
  TrendDirectionSchema,
  TimeRangeSchema,
  InsightSeveritySchema,
  InsightTypeSchema,
  DashboardWidgetTypeSchema,
  ExportFormatSchema,
  AnalyticsFilterSchema,
  TrendAnalysisSchema,
  InsightSchema,
  DetectedPatternSchema,
  ComparativeStatsSchema,
  AggregatedStatsSchema,
  ExportJobSchema,
  DashboardLayoutSchema,
  DashboardWidgetSchema,
  getTimeRangeDates,
} from './schemas';

// Repository
export * as repository from './repository';

// Service
export * as service from './service';

// Hooks
export {
  analyticsKeys,
  useAnalyticsData,
  useTrendAnalysis,
  useInsights,
  useUnreadInsightsCount,
  useMarkInsightAsRead,
  useDetectedPatterns,
  useDashboardLayout,
  useUpdateDashboardWidget,
  useExportJobs,
  useCreateExportJob,
  useAnalyticsPreferences,
  useUpdateAnalyticsPreferences,
  useAnalyticsSummary,
  useGenerateInsights,
  useDetectPatterns,
  useComparativeStats,
  useAnalyticsDegradedState,
} from './hooks';

// Events
export type { AnalyticsEvents } from './events';
export {
  subscribeToAnalyticsEvents,
  emitInsightGenerated,
  emitInsightRead,
  emitPatternDetected,
  emitExportRequested,
  emitExportCompleted,
  emitExportFailed,
  emitDashboardUpdated,
  emitPreferencesChanged,
} from './events';

// Analytics Tracking
export { AnalyticsTracking, setupAnalyticsTracking } from './analytics-tracking';

// Storage
export {
  uploadExportData,
  downloadExportData,
  deleteExportData,
  getStorageMetrics,
  cleanupOldExports,
  type StorageUploadConfig,
  type UploadResult,
  type DownloadResult,
  type StorageError,
} from './storage';

// Validation
export {
  validateTimeRange,
  validateMetrics,
  validateExportConfig,
  validateInsight,
  validateFilter,
  batchValidate,
  formatValidationErrors,
  AnalyticsValidationError,
  type ValidationError,
  type ValidationResult,
} from './validation';

// Integration
export {
  trackSessionCompleted,
  syncAnalyticsData,
  getRealtimeAnalytics,
  trackBossEncounter,
  trackItemCrafted,
  cleanupAnalyticsData,
  initializeAnalytics,
} from './integration';

// Re-export from types.ts for advanced use cases
export type {
  AnalyticsState,
  DegradedAnalyticsState,
} from './types';

// Components
export {
  TimeRangeFilter,
  MetricSelector,
  InsightCard,
  ExportProgress,
  TimeSeriesChart,
  AnalyticsDashboard,
} from './components';

