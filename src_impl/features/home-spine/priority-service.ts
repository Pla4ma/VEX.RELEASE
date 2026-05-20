import { buildProgress, buildSecondaryActions, buildStakes } from './priority-builders';
import { buildHomeContextSnapshot } from './priority-context';
import { checkDefaultSession, getPriorityCandidates } from './priority-checkers';
import {
  HomePrioritySchema,
  type HomeContextSnapshot,
  type HomePrimaryPriority,
  type HomePriority,
} from './priority-schemas';

export function rankHomePriorityCandidates(
  snapshot: HomeContextSnapshot,
): HomePrimaryPriority[] {
  const candidates = getPriorityCandidates(snapshot);
  return candidates.length > 0 ? candidates : [checkDefaultSession(snapshot)];
}

export function pickHomePrimaryPriority(
  snapshot: HomeContextSnapshot,
): HomePrimaryPriority {
  const primary = rankHomePriorityCandidates(snapshot)[0];
  if (!primary) {
    throw new Error('Home priority selection produced no primary action');
  }
  return primary;
}

export async function selectHomePriority(userId: string): Promise<HomePriority> {
  const snapshot = await buildHomeContextSnapshot(userId);
  const ordered = rankHomePriorityCandidates(snapshot);
  const primary = pickHomePrimaryPriority(snapshot);

  return HomePrioritySchema.parse({
    primary,
    progress: buildProgress(snapshot),
    secondary: buildSecondaryActions(ordered),
    stakes: buildStakes(primary, snapshot),
  });
}
