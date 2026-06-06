import * as Sentry from '@sentry/react-native';
import type { z } from 'zod';
import { ProgressionSummarySchema, type Progression } from './schemas';
import { fetchProgressionEnhanced } from './repository/progression-repository';
import { calculateProgressPercent } from './service-xp-calculations';

const ProgressionSummaryViewSchema = ProgressionSummarySchema.pick({
  level: true,
  xp: true,
  nextLevelThreshold: true,
  progressPercent: true,
});

type ProgressionSummaryView = z.infer<typeof ProgressionSummaryViewSchema>;

const STARTER_PROGRESSION_SUMMARY: ProgressionSummaryView = {
  level: 1,
  xp: 0,
  nextLevelThreshold: 100,
  progressPercent: 0,
};

export async function getProgressionEnhanced(
  userId: string,
): Promise<Progression> {
  const result = await fetchProgressionEnhanced(userId);
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (!result.data) {
    throw new Error('Progression unavailable');
  }
  return result.data;
}

export async function getProgressionSummaryEnhanced(
  userId: string,
): Promise<ProgressionSummaryView> {
  try {
    const progression = await getProgressionEnhanced(userId);
    return ProgressionSummaryViewSchema.parse({
      level: progression.level,
      xp: progression.xp,
      nextLevelThreshold: progression.nextLevelThreshold,
      progressPercent: calculateProgressPercent(
        progression.xp,
        progression.level,
      ),
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'progression', operation: 'getProgressionSummary' },
    });
    return STARTER_PROGRESSION_SUMMARY;
  }
}
