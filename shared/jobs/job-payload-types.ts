/**
 * Trigger.dev Job Payload Types - Server-Side Only
 *
 * Domain-specific input/output interfaces for each job type.
 * Extracted from job-types.ts to stay under 200-line limit.
 */

// ============================================================================
// Seasons Jobs
// ============================================================================

export interface SeasonRolloverInput {
  seasonId: string;
  gracePeriodDays: number;
  autoArchive: boolean;
  notifyUsers: boolean;
}

export interface SeasonRolloverOutput {
  archivedSeasonId: string;
  newSeasonId: string;
  usersMigrated: number;
  rewardsDistributed: number;
}

// ============================================================================
// Challenge Jobs
// ============================================================================

export interface ChallengeRefreshInput {
  seasonId: string;
  userIds?: string[];
  challengeTypes: ('DAILY' | 'WEEKLY')[];
  preserveProgress: boolean;
}

export interface ChallengeRefreshOutput {
  challengesGenerated: number;
  challengesAssigned: number;
  errors: Array<{ userId: string; error: string }>;
}

// ============================================================================
// Battle Pass Jobs
// ============================================================================

export interface BattlePassResetInput {
  seasonId: string;
  resetType: 'SOFT' | 'HARD';
  refundPremium: boolean;
}

export interface BattlePassResetOutput {
  usersReset: number;
  gemsRefunded: number;
  errors: string[];
}

// ============================================================================
// Notification Jobs
// ============================================================================

export interface NotificationBatchInput {
  userIds: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  delaySeconds?: number;
  throttleMs?: number;
}

export interface NotificationBatchOutput {
  sent: number;
  failed: number;
  throttled: number;
  errors: Array<{ userId: string; error: string }>;
}

// ============================================================================
// AI Jobs
// ============================================================================

export interface AIWorkflowInput {
  workflowType: 'SESSION_SUMMARY' | 'PROGRESS_ANALYSIS' | 'CHALLENGE_GENERATION';
  userId: string;
  context: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
}

export interface AIWorkflowOutput {
  result: unknown;
  tokensUsed: number;
  costEstimate: number;
  durationMs: number;
}

// ============================================================================
// Maintenance Jobs
// ============================================================================

export interface MaintenanceJobInput {
  jobType: 'CLEANUP_OLD_DATA' | 'RECONCILE_WALLETS' | 'SYNC_ANALYTICS' | 'HEALTH_CHECK';
  dryRun: boolean;
  batchSize: number;
  maxRuntimeMinutes: number;
}

export interface MaintenanceJobOutput {
  processed: number;
  modified: number;
  errors: string[];
  log: string[];
}

// ============================================================================
// Economy Jobs
// ============================================================================

export interface EconomyReconciliationInput {
  userIds?: string[];
  checkBalances: boolean;
  checkTransactions: boolean;
  fixDiscrepancies: boolean;
}

export interface EconomyReconciliationOutput {
  usersChecked: number;
  discrepanciesFound: number;
  discrepanciesFixed: number;
  reportUrl?: string;
}
