import { HomePrioritySchema, type HomePriority } from './priority-schemas';
import { buildHomeContextSnapshot } from './priority-context';
import { buildProgress, buildSecondaryActions, buildStakes } from './priority-builders';
import { checkDailyGoal, getPriorityCandidates } from './priority-checkers';

export async function selectHomePriority(userId: string): Promise<HomePriority> {
  const snapshot = await buildHomeContextSnapshot(userId);
  const sorted = getPriorityCandidates(snapshot).sort((a, b) => b.urgency - a.urgency);
  const primary = sorted[0] ?? checkDailyGoal(snapshot);

  if (!primary) {
    throw new Error('Unable to select a home priority');
  }

  return HomePrioritySchema.parse({
    primary,
    progress: buildProgress(snapshot),
    secondary: buildSecondaryActions(sorted),
    stakes: buildStakes(primary, snapshot),
  });
}
