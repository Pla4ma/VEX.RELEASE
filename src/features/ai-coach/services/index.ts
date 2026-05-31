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
