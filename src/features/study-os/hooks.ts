import { useQuery } from '@tanstack/react-query';

import { listStoredStudyPlans } from './repository';

export function useStudyOsPlans(userId: string | null, enabled = true) {
  const query = useQuery({
    enabled: Boolean(userId) && enabled,
    queryFn: () => listStoredStudyPlans(userId ?? ''),
    queryKey: ['study-os', userId],
  });

  return {
    data: query.data ?? [],
    error: query.error,
    isError: query.isError,
    isPending: query.isPending,
    refetch: query.refetch,
  };
}
