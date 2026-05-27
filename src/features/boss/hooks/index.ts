import { useQuery } from "@tanstack/react-query";

interface BossTemplate {
  id: string;
  name: string;
  tier: number;
  minLevel: number;
  bossId?: string;
}

interface BossEngagementSummary {
  bossRouteOpenedCount: number;
  bossCTAClickedCount: number;
  bossDamageEventsCount: number;
  recentSessionsWithBossProgress: number;
}

export interface BossEncounterStub {
  bossId: string;
  bossName: string;
  healthRemaining: number;
  maxHealth: number;
  timeRemaining: number;
  status: string;
  id: string;
}

export function useActiveBoss(..._args: unknown[]) {
  void _args;
  return useQuery<BossEncounterStub | null>({
    queryFn: () => Promise.resolve(null),
    queryKey: ["boss", "active"],
  });
}

export function useBossEngagementSummary(..._args: unknown[]) {
  void _args;
  return useQuery<BossEngagementSummary>({
    queryFn: () =>
      Promise.resolve({
        bossRouteOpenedCount: 0,
        bossCTAClickedCount: 0,
        bossDamageEventsCount: 0,
        recentSessionsWithBossProgress: 0,
      }),
    queryKey: ["boss", "engagement"],
  });
}

export function useAvailableBosses(..._args: unknown[]) {
  void _args;
  return useQuery<BossTemplate[]>({
    queryFn: () => Promise.resolve([]),
    queryKey: ["boss", "available"],
  });
}

export function useBossTemplates(..._args: unknown[]) {
  return useQuery<BossTemplate[]>({
    queryFn: () => Promise.resolve([]),
    queryKey: ["boss", "templates"],
  });
}
