import { PENALTY_CONSTANTS, severityRankings } from './penalty-constants';
import {
  calculatePausePenalty,
  calculateInterruptionPenalty,
  getSeverityFromTimeLost,
  calculateQualityPenalty,
} from './penalty-basic';
import {
  calculateAntiCheatPenalty,
  calculateAbandonPenalty,
  calculateTotalPenalty,
} from './penalty-advanced';

export { PENALTY_CONSTANTS, severityRankings }
export {
  calculatePausePenalty,
  calculateInterruptionPenalty,
  getSeverityFromTimeLost,
  calculateQualityPenalty,
  calculateAntiCheatPenalty,
  calculateAbandonPenalty,
  calculateTotalPenalty,
};

export type {
  PausePenaltyInput,
  InterruptionSeverity,
  InterruptionPenaltyInput,
  QualityPenaltyInput,
  AntiCheatViolationType,
  AntiCheatPenaltyInput,
  AbandonPenaltyInput,
  AbandonPenaltyResult,
  TotalPenaltyInput,
  PenaltyAction,
  InterruptionPenaltyResult,
  AntiCheatPenaltyResult,
  TotalPenaltyResult,
} from './penalty-types';

export const PenaltyCalculator = {
  calculatePausePenalty,
  calculateInterruptionPenalty,
  getSeverityFromTimeLost,
  calculateQualityPenalty,
  calculateAntiCheatPenalty,
  calculateAbandonPenalty,
  calculateTotalPenalty,
  constants: PENALTY_CONSTANTS,
};