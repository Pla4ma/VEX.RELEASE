/**
 * Session Module
 *
 * Complete focus/session management system for VEX.
 *
 * @module session
 */

// ============================================================================
// Types
// ============================================================================

export type {
  // Core types
  SessionState,
  SessionConfig,
  SessionPreset,
  SessionSummary,
  SessionStatus,
  SessionPhase,
  SessionHistoryEntry,
  SessionUIState,

  // Timer types
  TimerState,
  TimerConfig,

  // Interruption types
  InterruptionType,
  InterruptionSeverity,
  InterruptionRecord,

  // Recovery types
  RecoveryType,
  RecoveryRecord,

  // Quality types
  FocusQualityMetrics,

  // Scoring types
  ScoreCalculation,
  DamageCalculation,

  // Anti-cheat types
  AntiCheatFlag,

  // Notification types
  SessionNotificationType,
} from './types';

export type {
  SessionEventChannel,
  SessionEventPayload,
  SessionEventChannels,
} from './types/events';

// ============================================================================
// Validation
// ============================================================================

export {
  // Schemas
  ValidateSessionConfigSchema,
  ValidateSessionStateSchema,
  ValidateSessionSummarySchema,
  ValidateSessionPresetSchema,
  ValidateInterruptionSchema,
  ValidateRecoveryRecordSchema,
  ValidateAntiCheatFlagSchema,
  ValidateScoreCalculationSchema,
  ValidateDamageCalculationSchema,
  ValidateFocusQualityMetricsSchema,
  ValidateTimerConfigSchema,

  // Action validators
  StartSessionSchema,
  PauseSessionSchema,
  ResumeSessionSchema,
  CompleteSessionSchema,
  AbandonSessionSchema,
  RecoverSessionSchema,

  // Validation functions
  validateSessionConfig,
  validateSessionState,
  validateSessionSummary,
  validateSessionPreset,
  validateInterruption,
  validateRecoveryRecord,
  validateAntiCheatFlag,
  validateScoreCalculation,
  validateDamageCalculation,
  validateFocusQualityMetrics,
  validateTimerConfig,
} from './validation/schemas';

// ============================================================================
// Services
// ============================================================================

export {
  SessionService,
  createSessionService,
  getSessionService,
} from './SessionService';

export type { SessionServiceOptions } from './SessionService';

// ============================================================================
// Orchestrator
// ============================================================================

export {
  SessionOrchestrator,
  createSessionOrchestrator,
  getSessionOrchestrator,
} from './SessionOrchestrator';

// ============================================================================
// Event Emitter
// ============================================================================

export {
  SessionEventEmitter,
  createSessionEventEmitter,
  getSessionEventEmitter,
} from './SessionEventEmitter';

// ============================================================================
// Engines
// ============================================================================

export {
  TimerEngine,
  createTimerEngine,
} from './engines/TimerEngine';

export {
  ScoringEngine,
  createScoringEngine,
} from './engines/ScoringEngine';

export {
  CompletionEngine,
  createCompletionEngine,
} from './engines/CompletionEngine';

export type {
  CompletionResult,
  AbandonResult,
} from './engines/CompletionEngine';

// ============================================================================
// Anti-Cheat
// ============================================================================

export {
  AntiCheatEngine,
  createAntiCheatEngine,
} from './antiCheat/AntiCheatEngine';

// ============================================================================
// Repository
// ============================================================================

export {
  SessionRepository,
  getSessionRepository,
} from './repository/SessionRepository';

// ============================================================================
// Presets
// ============================================================================

export {
  PresetService,
  getPresetService,
  DEFAULT_PRESETS,
} from './presets';

// ============================================================================
// Integration
// ============================================================================

export {
  RewardAdapter,
  createRewardAdapter,
  getRewardAdapter,
} from './integration/RewardAdapter';

// ============================================================================
// Hooks
// ============================================================================

export {
  useSession,
  useSessionHistory,
  useSessionPresets,
  useSessionStats,
} from './hooks/useSession';

// ============================================================================
// Constants
// ============================================================================

export const SESSION_CONSTANTS = {
  // Timing
  MIN_SESSION_DURATION: 60, // 1 minute
  MAX_SESSION_DURATION: 86400, // 24 hours
  DEFAULT_TICK_INTERVAL: 1000, // 1 second

  // Scoring
  BASE_SCORE_PER_MINUTE: 10,
  MIN_COMPLETION_FOR_CREDIT: 0.5, // 50%

  // Interruption thresholds
  AUTO_PAUSE_THRESHOLD: 5000, // 5 seconds
  MAX_PAUSE_DURATION: 3600000, // 1 hour

  // Recovery
  MAX_RECOVERY_ATTEMPTS: 3,

  // Anti-cheat
  MAX_TIME_JUMP: 30000, // 30 seconds
  MIN_TICK_INTERVAL: 900, // ms
  MAX_TICK_INTERVAL: 1100, // ms
} as const;

// ============================================================================
// Default Export
// ============================================================================

export { getSessionService as default } from './SessionService';
