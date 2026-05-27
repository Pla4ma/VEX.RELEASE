/**
 * Feature Job Schemas — domain-specific Zod schemas for all job inputs/outputs.
 * Extracted from schemas.ts. Uses base schemas from base-schemas.ts.
 */

import { z } from 'zod';
import { UUIDSchema } from './base-schemas.ts';

// ── Seasons ─────────────────────────────────────────────────────────────────

export const SeasonRolloverInputSchema = z.object({
  seasonId: UUIDSchema,
  gracePeriodDays: z.number().int().min(1).max(14).default(3),
  autoArchive: z.boolean().default(true),
  notifyUsers: z.boolean().default(true),
}).strict();

export const SeasonRolloverOutputSchema = z.object({
  archivedSeasonId: UUIDSchema,
  newSeasonId: UUIDSchema,
  usersMigrated: z.number().int().nonnegative(),
  rewardsDistributed: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative(),
}).strict();

// ── Challenges ──────────────────────────────────────────────────────────────

export const ChallengeRefreshInputSchema = z.object({
  seasonId: UUIDSchema,
  userIds: z.array(UUIDSchema).optional(),
  challengeTypes: z.array(z.enum(['DAILY', 'WEEKLY'])),
  preserveProgress: z.boolean().default(false),
}).strict();

export const ChallengeRefreshOutputSchema = z.object({
  challengesGenerated: z.number().int().nonnegative(),
  challengesAssigned: z.number().int().nonnegative(),
  errors: z.array(z.object({ userId: UUIDSchema, error: z.string() })),
  durationMs: z.number().int().nonnegative(),
}).strict();

export const ChallengeExpiryCleanupInputSchema = z.object({
  cutoffDate: z.string().datetime(),
  batchSize: z.number().int().min(1).max(1000).default(500),
}).strict();

export const ChallengeExpiryCleanupOutputSchema = z.object({
  expired: z.number().int().nonnegative(),
  cleaned: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative(),
}).strict();

// ── Battle Pass ─────────────────────────────────────────────────────────────

export const BattlePassResetInputSchema = z.object({
  seasonId: UUIDSchema,
  resetType: z.enum(['SOFT', 'HARD']),
  refundPremium: z.boolean().default(false),
  idempotencyKey: z.string().optional(),
}).strict();

export const BattlePassResetOutputSchema = z.object({
  usersReset: z.number().int().nonnegative(),
  gemsRefunded: z.number().int().nonnegative(),
  errors: z.array(z.string()),
  durationMs: z.number().int().nonnegative(),
}).strict();

// ── Notifications ───────────────────────────────────────────────────────────

export const NotificationBatchInputSchema = z.object({
  userIds: z.array(UUIDSchema).min(1).max(10000),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  data: z.record(z.unknown()).optional(),
  delaySeconds: z.number().int().nonnegative().optional(),
  throttleMs: z.number().int().min(10).max(5000).default(20),
}).strict();

export const NotificationBatchOutputSchema = z.object({
  sent: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  throttled: z.number().int().nonnegative(),
  errors: z.array(z.object({ userId: UUIDSchema, error: z.string() })),
  durationMs: z.number().int().nonnegative(),
}).strict();

export const ReEngagementCheckOutputSchema = z.object({
  candidates: z.number().int().nonnegative(),
  scheduled: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  errors: z.array(z.object({ userId: UUIDSchema, error: z.string() })),
  durationMs: z.number().int().nonnegative(),
}).strict();

// ── AI Workflows ────────────────────────────────────────────────────────────

export const AIWorkflowTypeSchema = z.enum([
  'SESSION_SUMMARY', 'PROGRESS_ANALYSIS', 'CHALLENGE_GENERATION', 'USER_INSIGHTS',
]);

export const AIWorkflowInputSchema = z.object({
  workflowType: AIWorkflowTypeSchema,
  userId: UUIDSchema,
  context: z.record(z.unknown()),
  maxTokens: z.number().int().min(100).max(4000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  idempotencyKey: z.string().optional(),
}).strict();

export const AIWorkflowOutputSchema = z.object({
  result: z.unknown(),
  tokensUsed: z.number().int().nonnegative(),
  costEstimate: z.number().nonnegative(),
  durationMs: z.number().int().nonnegative(),
}).strict();

// ── Maintenance ─────────────────────────────────────────────────────────────

export const MaintenanceJobTypeSchema = z.enum([
  'CLEANUP_OLD_DATA', 'RECONCILE_WALLETS', 'SYNC_ANALYTICS', 'HEALTH_CHECK', 'DB_OPTIMIZE',
]);

export const MaintenanceJobInputSchema = z.object({
  jobType: MaintenanceJobTypeSchema,
  dryRun: z.boolean().default(true),
  batchSize: z.number().int().min(1).max(5000).default(100),
  maxRuntimeMinutes: z.number().int().min(1).max(120).default(30),
}).strict();

export const MaintenanceJobOutputSchema = z.object({
  processed: z.number().int().nonnegative(),
  modified: z.number().int().nonnegative(),
  errors: z.array(z.string()),
  log: z.array(z.string()),
  durationMs: z.number().int().nonnegative(),
}).strict();

// ── Economy ─────────────────────────────────────────────────────────────────

export const EconomyReconciliationInputSchema = z.object({
  userIds: z.array(UUIDSchema).optional(),
  checkBalances: z.boolean().default(true),
  checkTransactions: z.boolean().default(true),
  fixDiscrepancies: z.boolean().default(false),
  batchSize: z.number().int().min(1).max(500).default(50),
}).strict();

export const EconomyReconciliationOutputSchema = z.object({
  usersChecked: z.number().int().nonnegative(),
  discrepanciesFound: z.number().int().nonnegative(),
  discrepanciesFixed: z.number().int().nonnegative(),
  reportUrl: z.string().url().optional(),
  durationMs: z.number().int().nonnegative(),
}).strict();

// ── Analytics ───────────────────────────────────────────────────────────────

export const AnalyticsExportInputSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  dimensions: z.array(z.string()),
  format: z.enum(['JSON', 'CSV', 'PARQUET']).default('JSON'),
}).strict();

export const AnalyticsExportOutputSchema = z.object({
  recordsExported: z.number().int().nonnegative(),
  exportUrl: z.string().url(),
  expiresAt: z.number().int().positive(),
  durationMs: z.number().int().nonnegative(),
}).strict();

// ── Type Exports ────────────────────────────────────────────────────────────

export type SeasonRolloverInput = z.infer<typeof SeasonRolloverInputSchema>;
export type SeasonRolloverOutput = z.infer<typeof SeasonRolloverOutputSchema>;
export type ChallengeRefreshInput = z.infer<typeof ChallengeRefreshInputSchema>;
export type ChallengeRefreshOutput = z.infer<typeof ChallengeRefreshOutputSchema>;
export type ChallengeExpiryCleanupInput = z.infer<typeof ChallengeExpiryCleanupInputSchema>;
export type ChallengeExpiryCleanupOutput = z.infer<typeof ChallengeExpiryCleanupOutputSchema>;
export type BattlePassResetInput = z.infer<typeof BattlePassResetInputSchema>;
export type BattlePassResetOutput = z.infer<typeof BattlePassResetOutputSchema>;
export type NotificationBatchInput = z.infer<typeof NotificationBatchInputSchema>;
export type NotificationBatchOutput = z.infer<typeof NotificationBatchOutputSchema>;
export type ReEngagementCheckOutput = z.infer<typeof ReEngagementCheckOutputSchema>;
export type AIWorkflowInput = z.infer<typeof AIWorkflowInputSchema>;
export type AIWorkflowOutput = z.infer<typeof AIWorkflowOutputSchema>;
export type MaintenanceJobInput = z.infer<typeof MaintenanceJobInputSchema>;
export type MaintenanceJobOutput = z.infer<typeof MaintenanceJobOutputSchema>;
export type EconomyReconciliationInput = z.infer<typeof EconomyReconciliationInputSchema>;
export type EconomyReconciliationOutput = z.infer<typeof EconomyReconciliationOutputSchema>;
export type AnalyticsExportInput = z.infer<typeof AnalyticsExportInputSchema>;
export type AnalyticsExportOutput = z.infer<typeof AnalyticsExportOutputSchema>;
