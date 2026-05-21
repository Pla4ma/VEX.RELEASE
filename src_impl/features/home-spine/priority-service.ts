import { buildProgress, buildSecondaryActions, buildStakes } from './priority-builders';
import { buildHomeContextSnapshot } from './priority-context';
import { checkDefaultSession, getPriorityCandidates } from './priority-checkers';
import {
  HomePrioritySchema,
  type HomeContextSnapshot,
  type HomePrimaryPriority,
  type HomePriority,
} from './priority-schemas';
import type { FeatureAccessMap } from '../liveops-config';

export function rankHomePriorityCandidates(
  snapshot: HomeContextSnapshot,
  featureAccess?: FeatureAccessMap,
): HomePrimaryPriority[] {
  const candidates = getPriorityCandidates(snapshot, featureAccess);
  return candidates.length > 0 ? candidates : [checkDefaultSession(snapshot)];
}

export function pickHomePrimaryPriority(
  snapshot: HomeContextSnapshot,
  featureAccess?: FeatureAccessMap,
): HomePrimaryPriority {
  const primary = rankHomePriorityCandidates(snapshot, featureAccess)[0];
  if (!primary) {
    throw new Error('Home priority selection produced no primary action');
  }
  return primary;
}

export async function selectHomePriority(
  userId: string,
  featureAccess?: FeatureAccessMap,
): Promise<HomePriority> {
  const snapshot = await buildHomeContextSnapshot(userId, featureAccess);
  const ordered = rankHomePriorityCandidates(snapshot, featureAccess);
  const primary = pickHomePrimaryPriority(snapshot, featureAccess);

  return HomePrioritySchema.parse({
    primary,
    progress: buildProgress(snapshot),
    secondary: buildSecondaryActions(ordered),
    stakes: buildStakes(primary, snapshot),
  });
}
