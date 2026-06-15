import { useQuery } from '@tanstack/react-query';

import { getFocusProfile } from './service';

export function useFocusProfile(userId: string | null) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['focus-profile', userId],
    queryFn: () => getFocusProfile(userId ?? ''),
    enabled: Boolean(userId),
    });





  return {
    data: data ?? null,
    isPending: isPending,
    isError: isError,
    error: error,
    refetch: refetch,
  };
}
