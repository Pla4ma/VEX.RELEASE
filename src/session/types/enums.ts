import { z } from "zod";

export const SessionStatusSchema = z.enum([
  "PREPARING",
  "STARTING",
  "ACTIVE",
  "PAUSED",
  "BACKGROUNDED",
  "INTERRUPTION_RISK",
  "DEGRADED",
  "COMPLETING",
  "COMPLETED",
  "PARTIAL",
  "ABANDONED",
  "FAILED",
  "RECOVERING",
  "CONFLICT",
]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SessionPhaseSchema = z.enum([
  "FOCUS",
  "SHORT_BREAK",
  "LONG_BREAK",
  "PREPARATION",
  "REVIEW",
]);
export type SessionPhase = z.infer<typeof SessionPhaseSchema>;

export const ConflictStatusSchema = z.enum([
  "NONE",
  "PENDING",
  "RESOLVED_LOCAL",
  "RESOLVED_REMOTE",
  "MERGED",
]);
export type ConflictStatus = z.infer<typeof ConflictStatusSchema>;

export const StorageStatusSchema = z.enum([
  "HEALTHY",
  "DEGRADED",
  "UNAVAILABLE",
]);
export type StorageStatus = z.infer<typeof StorageStatusSchema>;

export const SyncStatusSchema = z.enum([
  "IDLE",
  "SYNCING",
  "SYNCED",
  "FAILED",
  "PENDING",
  "OFFLINE",
]);
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

export const AntiCheatStatusSchema = z.enum([
  "CLEAN",
  "WARNING",
  "FLAGGED",
  "FAILED",
  "INVALIDATED",
]);
export type AntiCheatStatus = z.infer<typeof AntiCheatStatusSchema>;
