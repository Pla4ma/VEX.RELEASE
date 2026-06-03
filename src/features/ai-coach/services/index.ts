/**
 * AI Coach Services - Internal Implementation Barrel
 *
 * This directory contains sub-service implementations and engines.
 * The public API for the ai-coach feature is re-exported through
 * the root service.ts barrel — do not import from this directory
 * directly in components or external features.
 *
 * Naming convention:
 * - Root service.ts = public API barrel (re-exports only)
 * - services/ = internal implementation modules
 */

export {
  determineOptimalState,
  transitionState,
  checkAutoTransitions,
  resolveCoachState,
  StateTransitionError,
  StateMachineError,
  type CoachSignals,
} from './coach-state-machine';

export { evaluateInterventions } from './intervention-engine';

export {
  InterventionError,
  DailyLimitExceededError,
  InterventionSuppressedError,
  ExecutionSlotUnavailableError,
} from './intervention-engine-types';

export { generateMessage } from './message-generator';

export {
  processBehaviorSignal,
  rebuildBehaviorProfile,
  detectPatterns,
  generateBehaviorAnalytics,
  type DetectedPattern,
  type BehaviorAnalytics,
} from './behavior-analytics';

export * from './notification-support';
export * from './notification-permissions';

// CoachService interface & singleton (moved from root service.ts)
export {
  fetchActiveRecommendations,
  getCoachService,
} from './coach-service';
export type { CoachService } from './coach-service';
