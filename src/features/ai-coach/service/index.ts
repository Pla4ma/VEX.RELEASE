/**
 * AI Coach Service Layer
 *
 * Production-grade business logic for coaching, personalization,
 * interventions, and behavior analytics.
 */

// Core services
export {
  determineOptimalState,
  transitionState,
  checkAutoTransitions,
  StateTransitionError,
  StateMachineError,
} from './coach-state-machine';

export {
  evaluateInterventions,
  InterventionError,
  DailyLimitExceededError,
  InterventionSuppressedError,
  ExecutionSlotUnavailableError,
} from './intervention-engine';

export {
  generateMessage,
} from './message-generator';

export {
  processBehaviorSignal,
  rebuildBehaviorProfile,
  detectPatterns,
  generateBehaviorAnalytics,
  type DetectedPattern,
  type BehaviorAnalytics,
} from './behavior-analytics';

// Legacy exports for backward compatibility
export * from '../service';
