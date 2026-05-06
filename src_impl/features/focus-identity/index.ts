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

// Repository
export * as repository from './repository';
export type { MonthlyReportData } from './repository';

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

// Integration
export {
  initializeFocusIdentityIntegrations,
  initializeSessionIntegration,
  initializeProgressionIntegration,
  initializeForNewUser,
  checkRetentionRisk,
  getXpMultiplierForScore,
} from './integration';

// Components
export { FocusScoreCard } from './components/FocusScoreCard';
export { ScoreHistoryChart } from './components/ScoreHistoryChart';
