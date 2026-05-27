// ═══ Re-exports from split type files ═══════════════════

// Enums
export {
  SessionStatusSchema,
  SessionPhaseSchema,
  ConflictStatusSchema,
  StorageStatusSchema,
  SyncStatusSchema,
  AntiCheatStatusSchema,
  type SessionStatus,
  type SessionPhase,
  type ConflictStatus,
  type StorageStatus,
  type SyncStatus,
  type AntiCheatStatus,
} from "./enums";

// Core schemas and types
export {
  SessionConfigSchema,
  SessionProgressSchema,
  SessionOutcomeSchema,
  SessionSyncMetaSchema,
  SessionStateSchema,
  SessionPresetSchema,
  SessionSummarySchema,
  SessionEventSchema,
  SessionMetricsSchema,
  TimerStateSchema,
  ScoreCalculationSchema,
  DamageCalculationSchema,
  SessionUIStateSchema,
  SessionNotificationTypeSchema,
  type SessionConfig,
  type SessionProgress,
  type SessionOutcome,
  type SessionSyncMeta,
  type SessionState,
  type SessionPreset,
  type SessionSummary,
  type SessionEvent,
  type SessionMetrics,
  type TimerState,
  type ScoreCalculation,
  type DamageCalculation,
  type SessionUIState,
  type SessionNotificationType,
} from "./schemas";

// Interfaces and types
export {
  type SessionHistoryEntry,
  type TimerConfig,
  type InterruptionRecord,
  type RecoveryRecord,
  type PenaltyRecord,
  type AntiCheatFlag,
  type InterruptionType,
  type InterruptionSeverity,
  type RecoveryType,
  type FocusQualityMetrics,
  type SessionCreationResult,
  type StateTransitionResult,
  type TimeCalculationResult,
  type TimeBreakdown,
  type TimeProgressMetrics,
} from "./interfaces";
