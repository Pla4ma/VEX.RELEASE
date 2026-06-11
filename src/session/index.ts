export type {
  SessionState,
  SessionConfig,
  SessionPreset,
  SessionSummary,
  SessionStatus,
  SessionPhase,
  SessionHistoryEntry,
  SessionUIState,
  TimerState,
  TimerConfig,
  InterruptionType,
  InterruptionSeverity,
  InterruptionRecord,
  RecoveryType,
  RecoveryRecord,
  FocusQualityMetrics,
  ScoreCalculation,
  DamageCalculation,
  AntiCheatFlag,
  SessionNotificationType,
} from './types';
export type {
  SessionEventChannel,
  SessionEventPayload,
  SessionEventChannels,
} from './types/events';
export {
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
  StartSessionSchema,
  PauseSessionSchema,
  ResumeSessionSchema,
  CompleteSessionSchema,
  AbandonSessionSchema,
  RecoverSessionSchema,
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
export {
  SessionOrchestrator,
  getSessionOrchestrator,
  createSessionOrchestrator,
} from './SessionOrchestrator';
export { createSessionOrchestrator as getSessionOrchestratorDefault } from './SessionOrchestrator';
export type { OrchestratorConfig } from './orchestrator-types';
export {
  SessionEventEmitter,
  createSessionEventEmitter,
  getSessionEventEmitter,
} from './SessionEventEmitter';
export { TimerEngine, createTimerEngine } from './engines/TimerEngine';
export { ScoringEngine, createScoringEngine } from './engines/ScoringEngine';
export {
  CompletionEngine,
  createCompletionEngine,
} from './engines/CompletionEngine';
export type {
  CompletionResult,
  AbandonResult,
} from './engines/completion-types';
export {
  AntiCheatEngine,
  createAntiCheatEngine,
} from './antiCheat/AntiCheatEngine';
export {
  SessionRepository,
} from './repository/SessionRepository';
export {
  getSessionRepository,
  resetSessionRepository,
} from './repository/SessionRepositoryFactory';
export { PresetService, getPresetService, DEFAULT_PRESETS } from './presets';
export {
  RewardAdapter,
  createRewardAdapter,
  getRewardAdapter,
} from './integration/RewardAdapter';
export {
  useSession,
  useSessionHistory,
  useSessionPresets,
  useSessionStats,
} from './hooks/useSession';
export const SESSION_CONSTANTS = {
  MIN_SESSION_DURATION: 60,
  MAX_SESSION_DURATION: 86400,
  DEFAULT_TICK_INTERVAL: 1000,
  BASE_SCORE_PER_MINUTE: 10,
  MIN_COMPLETION_FOR_CREDIT: 0.5,
  AUTO_PAUSE_THRESHOLD: 5000,
  MAX_PAUSE_DURATION: 3600000,
  MAX_RECOVERY_ATTEMPTS: 3,
  MAX_TIME_JUMP: 30000,
  MIN_TICK_INTERVAL: 900,
  MAX_TICK_INTERVAL: 1100,
} as const;
export { getSessionOrchestrator as default } from './SessionOrchestrator';
