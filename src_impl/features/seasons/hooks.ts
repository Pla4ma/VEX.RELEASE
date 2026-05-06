import { useQuery } from '@tanstack/react-query';

import * as service from './service';

const ONE_HOUR_MS = 60 * 60 * 1000;

export const seasonKeys = {
  all: ['seasons'] as const,
  active: () => [...seasonKeys.all, 'active'] as const,
  upcoming: () => [...seasonKeys.all, 'upcoming'] as const,
  userProgress: (userId: string, seasonId: string) =>
    [...seasonKeys.all, 'progress', userId, seasonId] as const,
};

export function useActiveSeason() {
  return useQuery({
    queryKey: seasonKeys.active(),
    queryFn: () => service.getActiveSeason(),
    staleTime: ONE_HOUR_MS,
  });
}

export function useUpcomingSeasons() {
  return useQuery({
    queryKey: seasonKeys.upcoming(),
    queryFn: () => service.getUpcomingSeasons(),
    staleTime: ONE_HOUR_MS,
  });
}

export function useUserSeasonProgress(userId: string, seasonId: string) {
  return useQuery({
    queryKey: seasonKeys.userProgress(userId, seasonId),
    queryFn: () => service.getUserSeasonProgress(userId, seasonId),
    enabled: Boolean(userId && seasonId),
    staleTime: 2 * 60 * 1000,
  });
}
