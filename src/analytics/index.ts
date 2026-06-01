/**
 * Analytics System Export
 */

export type {
  AnalyticsEvent,
  UserProperties,
  AnalyticsConfig,
} from './AnalyticsService';

export { AnalyticsService, getAnalyticsService } from './AnalyticsService';

export { useAnalytics, useScreenTracking } from './hooks/useAnalytics';

// Phase 6.2 - Analytics Infrastructure & Experimentation
export {
  TARGET_METRICS,
  trackRetentionEvent,
  calculateRetentionRates,
  recordEngagementEvent,
  getAverageSessionsPerWeek,
  getStudyPlanCompletionRate,
  trackMonetizationEvent,
  getMonetizationMetrics,
  trackPaywallEvent,
  getPaywallAnalytics,
  getBestPaywallContext,
  trackStreakEvent,
  getStreakSurvivalMetrics,
  generateDashboardReport,
  type VEXSuccessMetrics,
  type RetentionCohort,
  type EngagementMetrics,
  type MonetizationMetrics,
  type PaywallAnalytics,
  type StreakSurvivalMetrics,
  type VEXDashboard,
} from './VEXAnalyticsInfrastructure';

export {
  PREDEFINED_EXPERIMENTS,
  createExperiment,
  getExperiment,
  assignUserToExperiment,
  getUserVariant,
  getVariantConfig,
  recordExperimentEvent,
  calculateResults,
  completeExperiment,
  getActiveExperiments,
  getUserExperiments,
  type Experiment,
  type ExperimentType,
  type Variant,
  type ExperimentAssignment,
  type ExperimentResults,
  type VariantResult,
} from './ABTestingFramework';
