/**
 * Session Completion Feature Barrel Export
 */

// Schemas & Types
export {
  CompletionLedgerSchema,
  SessionCompletionHeroSchema,
  SessionCompletionNavigationParamsSchema,
  SessionCompletionReturnPlanSchema,
} from './schemas';

export type {
  CompletionLedger,
  SessionCompletionHero,
  SessionCompletionNavigationParams,
  SessionCompletionReturnPlan,
} from './schemas';

// Service
export {
  buildSessionCompletionHero,
  buildSessionCompletionReturnPlan,
  parseSessionCompletionParams,
} from './service';

// Repository
export {
  createCompletionLedger,
  getCompletionLedgerByIdempotencyKey,
  getCompletionLedgerBySessionId,
  hasSessionBeenCompleted,
  updateRewardStatus,
} from './repository';

// Hooks
export {
  useSessionCompleteController,
} from './hooks';

// Route
export {
  useSessionCompletionRouteState,
} from './route';
