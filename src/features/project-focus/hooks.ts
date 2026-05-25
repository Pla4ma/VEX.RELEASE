import { useQuery } from '@tanstack/react-query';

import { listStoredProjectThreads } from './repository';

export function useProjectThreads(userId: string | null, enabled = true) {
  const query = useQuery({
    enabled: Boolean(userId) && enabled,
    queryFn: () => listStoredProjectThreads(userId ?? ''),
    queryKey: ['project-focus', userId],
  });

  return {
    data: query.data ?? [],
    error: query.error,
    isError: query.isError,
    isPending: query.isPending,
    refetch: query.refetch,
  };
}
