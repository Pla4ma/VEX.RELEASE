import { useQuery } from '@tanstack/react-query';

import { getDailyContributions, getSquadMissions } from './competitive-service';

export const competitiveSquadKeys = {
  all: ['competitive-squads'] as const,
  daily: (squadId: string, date: string) => [...competitiveSquadKeys.all, 'daily', squadId, date] as const,
  missions: (squadId: string) => [...competitiveSquadKeys.all, 'missions', squadId] as const,
};

export function useDailyContributions(squadId: string | undefined) {
  const date = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: competitiveSquadKeys.daily(squadId ?? '', date),
    queryFn: () => {
      if (!squadId) {throw new Error('Squad ID required');}
      return getDailyContributions(squadId, date);
    },
    enabled: Boolean(squadId),
    refetchInterval: 1000 * 60,
  });
}

export function useSquadMissions(squadId: string | undefined) {
  return useQuery({
    queryKey: competitiveSquadKeys.missions(squadId ?? ''),
    queryFn: () => {
      if (!squadId) {throw new Error('Squad ID required');}
      return getSquadMissions(squadId);
    },
    enabled: Boolean(squadId),
    staleTime: Infinity,
  });
}

