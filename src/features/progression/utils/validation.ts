// Re-export from decomposed modules.
// Original file split into validation/ directory to stay under 200 lines per file.
export {
  XPSourceSchema,
  XPTransactionSchema,
  MAX_XP_PER_SESSION,
  MAX_XP_PER_HOUR,
  MAX_STREAK_BONUS_MULTIPLIER,
  MAX_QUALITY_BONUS,
  getNumberFromMetadata,
} from './validation/types';
export type {
  XPTransaction,
  ValidationResult,
  Violation,
  Warning,
} from './validation/types';
export { validateXPTransaction } from './validation/xp-validation';
export { validateSourceSpecific } from './validation/source-validators';
export { validateLevelUp, validatePrestige } from './validation/level-validation';
export { validateXPBatch } from './validation/batch-validation';
export { ProgressionValidation } from './validation/batch-validation';
