/**
 * ponytail: re-export canonical interfaces from session module
 * Exact duplicate of src/session/types/interfaces.ts — consolidated here.
 */
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
} from '../../../session/types/interfaces';
