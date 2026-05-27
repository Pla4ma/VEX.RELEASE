import { createUnlockDecision, isFeatureVisible } from '../service';
import {
  buildUserFacingReason,
  UnlockDecisionSchema,
} from '../schemas';
import {
  computeFeatureSafetyGates,
  canDegradedPremiumTease,
  isNeverUnlockFeature,
  NEVER_UNLOCK_FEATURES,
} from '../safety';

export {
  createUnlockDecision,
  isFeatureVisible,
  buildUserFacingReason,
  UnlockDecisionSchema,
  computeFeatureSafetyGates,
  canDegradedPremiumTease,
  isNeverUnlockFeature,
  NEVER_UNLOCK_FEATURES,
};

export const NOW = 1_764_000_000_000;
