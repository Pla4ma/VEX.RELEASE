/**
 * Squads Service Activity
 * Activity logging for squads
 */

import * as repository from '../repository';
import type { SquadActivity } from '../schemas';

export async function logSquadActivity(
  squadId: string,
  userId: string,
  type: SquadActivity['type'],
  content: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await repository.createSquadActivity({ squadId, userId, type, content, metadata: metadata ?? null });
}

export async function getSquadActivity(squadId: string, limit = 50): Promise<SquadActivity[]> {
  return repository.fetchSquadActivity(squadId, limit);
}
