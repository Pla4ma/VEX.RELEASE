export {
  createUnlockDecision,
  getUnlockExplainerCopy,
  isFeatureVisible,
} from './service';

export { useUnlockDecision, useUnlockWithHide } from './hooks';
export type { UnlockWithHide } from './hooks';

export {
  buildUserFacingReason,
  UnlockReasonCodeSchema,
} from './schemas';

export {
  computeFeatureSafetyGates,
  isPremiumGatedFeature,
  canDegradedPremiumTease,
  isNeverUnlockFeature,
  NEVER_UNLOCK_FEATURES,
} from './safety';
export type { FeatureSafetyGates } from './safety';

export { useUnlockExplainerStore } from './store';
export type {
  UnlockExplainerActions,
  UnlockExplainerState,
  UnlockExplainerStore,
} from './store';

export {
  checkRouteSafety,
  canRegisterFeatureRouteWithSafety,
  canNavigateToRouteWithSafety,
} from './route-safety-bridge';
export type { RouteSafetyCheck } from './route-safety-bridge';

export {
  buildCompletionUnlock,
  unlockDecisionToCompletion,
} from './completion-bridge';

export { UnlockExplainerCard } from './components/UnlockExplainerCard';

export type {
  LaneFit,
  UnlockDecision,
  UnlockDecisionType,
  UnlockEvidence,
  UnlockExplainerInput,
  UnlockReasonCode,
} from './types';
