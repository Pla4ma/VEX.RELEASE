import { useQuery } from '@tanstack/react-query';

export interface BossEngagementSummaryData {
  bossRouteOpenedCount: number;
  bossCTAClickedCount: number;
  bossDamageEventsCount: number;
  recentSessionsWithBossProgress: number;
}

const empty: BossEngagementSummaryData = {
  bossRouteOpenedCount: 0,
  bossCTAClickedCount: 0,
  bossDamageEventsCount: 0,
  recentSessionsWithBossProgress: 0,
};

export function useBossEngagementSummaryForCoach(userId: string | null) {
  return useQuery<BossEngagementSummaryData>({
    enabled: Boolean(userId),
    placeholderData: empty,
    queryFn: () => Promise.resolve(empty),
    queryKey: ['boss', 'coach', userId],
  });
}

export { useBossEngagementSummaryForCoach as useBossEngagementSummary };
