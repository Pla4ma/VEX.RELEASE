import { useQuery } from '@tanstack/react-query';

import { getStoredFocusRun } from './repository';

export function useFocusRun(userId: string | null, enabled = true) {
  const query = useQuery({
    enabled: Boolean(userId) && enabled,
    queryFn: () => getStoredFocusRun(userId ?? ''),
    queryKey: ['focus-run', userId],
  });

  return {
    data: query.data ?? null,
    error: query.error,
    isError: query.isError,
    isPending: query.isPending,
    refetch: query.refetch,
  };
}
