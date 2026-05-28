import type {
  HomeContextSnapshot,
  HomePrimaryPriority,
  ProductContext,
} from "./priority-schemas";
import type { FeatureAccessMap } from "../liveops-config";
import {
  checkStreakCritical,
  checkCompanionPromise,
  checkPromiseRecovery,
  checkStreakAtRisk,
  checkRecommendedSession,
  checkDefaultSession,
} from "./priority-checkers-basic";
import {
  checkChallengeNearDone,
  checkBossActive,
} from "./priority-checkers-gated";

export {
  checkStreakCritical,
  checkCompanionPromise,
  checkPromiseRecovery,
  checkStreakAtRisk,
  checkRecommendedSession,
  checkDefaultSession,
} from "./priority-checkers-basic";

export {
  checkChallengeNearDone,
  checkBossActive,
} from "./priority-checkers-gated";

export function getPriorityCandidates(
  snapshot: HomeContextSnapshot,
  featureAccess?: FeatureAccessMap,
  productContext?: ProductContext,
): HomePrimaryPriority[] {
  return [
    checkStreakCritical(snapshot),
    checkCompanionPromise(snapshot),
    checkPromiseRecovery(snapshot),
    checkStreakAtRisk(snapshot),
    checkRecommendedSession(snapshot),
    checkChallengeNearDone(snapshot, featureAccess, productContext),
    checkBossActive(snapshot, featureAccess, productContext),
    checkDefaultSession(snapshot),
  ].filter((priority): priority is HomePrimaryPriority => priority !== null);
}
