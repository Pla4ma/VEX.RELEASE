import type { Streak } from '../schemas';
import { updateStreakEnhanced } from './streak-repository';
import type { RepositoryResult } from '../../../lib/repository/fallback';
import { StreaksRepositoryError } from '../../../lib/repository/fallback';

export async function batchUpdateStreaks(
  updates: Array<{ userId: string; streak: Partial<Streak> }>,
): Promise<{
  successful: Streak[];
  failed: Array<{ userId: string; error: StreaksRepositoryError }>;
}> {
  const results = {
    successful: [] as Streak[],
    failed: [] as Array<{ userId: string; error: StreaksRepositoryError }>,
  };
  for (const update of updates) {
    const result = await updateStreakEnhanced(update.userId, update.streak);
    if (result.error) {
      results.failed.push({ userId: update.userId, error: result.error });
    } else if (result.data) {
      results.successful.push(result.data);
    }
  }
  return results;
}