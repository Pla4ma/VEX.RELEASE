/**
 * Focus Identity Protocol (FIP)
 *
 * A revolutionary retention system that transforms users' relationship with focus.
 * Based on behavioral economics and identity-based habits.
 *
 * @priority critical
 * @retention-target identity-based habit formation
 */

// Core Engine
export {
  FocusIdentityEngine,
  FocusIdentityService,
  FOCUS_SCORE_CONFIG,
} from './FocusIdentityEngine';

// Types
export type {
  ScoreBand,
  FocusScoreFactors,
  FocusIdentityProfile,
} from './FocusIdentityEngine';
export type {
  FocusScoreBandLabel,
  FocusScoreFactorKey,
  FocusScoreHistoryPoint,
  FocusScoreRecord,
  FocusScoreUpdateInput,
  FocusScoreUpdateResult,
  MonthlyFocusReportSummary,
} from './types';

// Schemas
export {
  MIN_FOCUS_SCORE,
  MAX_FOCUS_SCORE,
  FocusScoreBandLabelSchema,
  FocusScoreFactorKeySchema,
  FocusScoreFactorsSchema,
  FocusScoreHistoryPointSchema,
  FocusScoreRecordSchema,
  FocusScoreUpdateInputSchema,
  FocusScoreUpdateResultSchema,
  MonthlyFocusReportSummarySchema,
  getFocusScoreFactorsWeightTotal,
} from './schemas';

// Repository
export * as repository from './repository';
export type { MonthlyReportData } from './repository';
export * as focusScoreRepository from "./repository-focus-score";
export type {
  AppendFocusScoreHistoryEvent,
  MonthlyFocusReportInput,
  UpsertCurrentFocusScoreInput,
} from "./repository-focus-score.schemas";
export { focusScoreKeys } from "./focus-score-query-keys";
export { calculateFocusScoreUpdate } from "./score-algorithm";

// Analytics
export * as analytics from './analytics';

// Events
export * as events from './events';
export type {
  MonthlyReportViewedEvent,
  MonthlyReportSharedEvent,
  MonthlyReportDismissedEvent,
} from './events';

// Hooks
export {
  useFocusIdentity,
  useFocusScoreHistory,
  useMonthlyReport,
  useFocusScoreColor,
  useIdentityStatement,
} from './hooks';
export { useFocusScore } from "./hooks-focus-score"; // Only export useFocusScore

// Integration
export { initializeFocusScoreIntegration } from "./integration-focus-score";

// Components
export { FocusScoreCard } from './components/FocusScoreCard';
export { ScoreHistoryChart } from './components/ScoreHistoryChart';
export { FocusScoreDashboard } from "./components/focus-score-dashboard";
export { FocusScoreHomeWidget } from "./components/focus-score-home-widget";
