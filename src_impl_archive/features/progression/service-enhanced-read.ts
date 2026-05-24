import { ProgressionSummarySchema, type Progression } from './schemas';
import { fetchProgressionEnhanced } from './repository/enhanced';
import { calculateProgressPercent } from './service-enhanced-math';

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

export async function getProgressionSummaryEnhanced(userId: string): Promise<{
  level: number;
  xp: number;
  nextLevelThreshold: number;
  progressPercent: number;
} | null> {
  const progression = await getProgressionEnhanced(userId);
  return ProgressionSummarySchema.pick({
    level: true,
    xp: true,
    nextLevelThreshold: true,
    progressPercent: true,
  }).parse({
    level: progression.level,
    xp: progression.xp,
    nextLevelThreshold: progression.nextLevelThreshold,
    progressPercent: calculateProgressPercent(
      progression.xp,
      progression.level,
    ),
  });
}

