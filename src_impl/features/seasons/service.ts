import * as Sentry from '@sentry/react-native';

import { eventBus } from '../../events';
import * as repository from './repository';
import type { Season, UserSeasonProgress } from './schemas';

export async function getActiveSeason(): Promise<Season | null> {
  try {
    return await repository.fetchActiveSeason();
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'seasons', operation: 'getActiveSeason' } });
    throw error;
  }
}

export async function getUpcomingSeasons(): Promise<Season[]> {
  try {
    return await repository.fetchUpcomingSeasons();
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'seasons', operation: 'getUpcomingSeasons' } });
    throw error;
  }
}

export async function getUserSeasonProgress(userId: string, seasonId: string): Promise<UserSeasonProgress | null> {
  if (!userId || !seasonId) {
    return null;
  }

  try {
    return await repository.fetchUserSeasonProgress(userId, seasonId);
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'seasons', operation: 'getUserSeasonProgress' } });
    throw error;
  }
}

export async function addSeasonXP(
  userId: string,
  amount: number,
  source: string
): Promise<{ newTier: number; tiersGained: number; totalSeasonXp: number }> {
  const activeSeason = await getActiveSeason();
  const currentProgress = activeSeason ? await getUserSeasonProgress(userId, activeSeason.id) : null;

  if (!activeSeason || !currentProgress || amount <= 0) {
    return { newTier: currentProgress?.currentTier ?? 0, tiersGained: 0, totalSeasonXp: currentProgress?.totalSeasonXp ?? 0 };
  }

  const totalSeasonXp = currentProgress.totalSeasonXp + amount;
  const newTier = Math.min(activeSeason.tierCount, Math.floor(totalSeasonXp / activeSeason.xpPerTier));
  const tierXp = newTier >= activeSeason.tierCount ? 0 : totalSeasonXp % activeSeason.xpPerTier;
  const tiersGained = Math.max(0, newTier - currentProgress.currentTier);

  await repository.updateUserSeasonProgress(userId, activeSeason.id, {
    currentTier: newTier,
    tierXp,
    totalSeasonXp,
  });

  if (tiersGained > 0) {
    for (let tier = currentProgress.currentTier + 1; tier <= newTier; tier += 1) {
      eventBus.publish('season:tier_unlocked', {
        userId,
        seasonId: activeSeason.id,
        tier,
        source,
      });
    }
  }

  return { newTier, tiersGained, totalSeasonXp };
}
