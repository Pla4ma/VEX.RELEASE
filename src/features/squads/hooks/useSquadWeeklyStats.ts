import { useQuery } from '@tanstack/react-query';

import * as service from '../service';

export function useSquadWeeklyStats(squadId: string | undefined) {
  return useQuery({
    queryKey: ['squads', 'weekly-stats', squadId],
    queryFn: () => service.getSquadWeeklyStats(squadId!),
    enabled: Boolean(squadId),
    staleTime: 60 * 1000,
  });
}
