import { buildProgress, buildSecondaryActions, buildStakes } from './priority-builders';
import { buildHomeContextSnapshot } from './priority-context';
import { checkDefaultSession, getPriorityCandidates } from './priority-checkers';
import {
  HomePrioritySchema,
  type HomeContextSnapshot,
  type HomePrimaryPriority,
  type HomePriority,
  type ProductContext,
} from './priority-schemas';
import type { FeatureAccessMap } from '../liveops-config';

export interface SelectHomePriorityInput {
  userId: string;
  featureAccess?: FeatureAccessMap;
  productContext?: ProductContext;
}

export function rankHomePriorityCandidates(
  snapshot: HomeContextSnapshot,
  featureAccess?: FeatureAccessMap,
  productContext?: ProductContext,
): HomePrimaryPriority[] {
  const candidates = getPriorityCandidates(snapshot, featureAccess, productContext);
  return candidates.length > 0 ? candidates : [checkDefaultSession(snapshot)];
}

export function pickHomePrimaryPriority(
  snapshot: HomeContextSnapshot,
  featureAccess?: FeatureAccessMap,
  productContext?: ProductContext,
): HomePrimaryPriority {
  const primary = rankHomePriorityCandidates(snapshot, featureAccess, productContext)[0];
  if (!primary) {
    throw new Error('Home priority selection produced no primary action');
  }
  return primary;
}

export async function selectHomePriority(input: SelectHomePriorityInput): Promise<HomePriority> {
  const { userId, featureAccess, productContext } = input;
  const snapshot = await buildHomeContextSnapshot(userId, featureAccess);
  const ordered = rankHomePriorityCandidates(snapshot, featureAccess, productContext);
  const primary = pickHomePrimaryPriority(snapshot, featureAccess, productContext);

  return HomePrioritySchema.parse({
    primary,
    progress: buildProgress(snapshot),
    secondary: buildSecondaryActions(ordered),
    stakes: buildStakes(primary, snapshot),
  });
}
