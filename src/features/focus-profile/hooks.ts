import { useQuery } from '@tanstack/react-query';

import { getFocusProfile } from './service';

export function useFocusProfile(userId: string | null) {
  const query = useQuery({
    queryKey: ['focus-profile', userId],
    queryFn: () => getFocusProfile(userId ?? ''),
    enabled: Boolean(userId),
  });

  return {
    data: query.data ?? null,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
