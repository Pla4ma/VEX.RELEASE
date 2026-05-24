import { useMemo } from 'react';
import type { BehaviorStats } from '../personalization/schemas';

export type BossEngagementLevel = BehaviorStats['bossChallengeEngagement'];

export interface BossEngagementInputs {
  bossIgnored: boolean;
  bossUnlocked: boolean;
  canQueryBoss: boolean;
  bossRouteOpenedCount: number;
  bossCTAClickedCount: number;
  bossDamageEventsCount: number;
  recentSessionsWithBossProgress: number;
}

export function deriveBossEngagementLevel(
  inputs: BossEngagementInputs,
): BossEngagementLevel {
  if (inputs.bossIgnored) return 'none';

  if (!inputs.bossUnlocked) return 'none';

  const totalSignals =
    inputs.bossRouteOpenedCount +
    inputs.bossCTAClickedCount +
    inputs.bossDamageEventsCount +
    inputs.recentSessionsWithBossProgress;

  if (totalSignals >= 8) return 'high';
  if (totalSignals >= 4) return 'medium';
  if (totalSignals >= 1) return 'low';
  return 'none';
}

export function useBossEngagementSignals(
  inputs: BossEngagementInputs,
): BossEngagementLevel {
  return useMemo(() => deriveBossEngagementLevel(inputs), [
    inputs.bossIgnored,
    inputs.bossUnlocked,
    inputs.canQueryBoss,
    inputs.bossRouteOpenedCount,
    inputs.bossCTAClickedCount,
    inputs.bossDamageEventsCount,
    inputs.recentSessionsWithBossProgress,
  ]);
}
