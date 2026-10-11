import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { useAuthStore } from '../../../store';
import { getContentStudyEligibility } from '../service-eligibility';
import { contentStudyQueryKeys } from './queryKeys';

export function useContentStudyEligibility() {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const query = useQuery({
    queryKey: contentStudyQueryKeys.eligibility(userId),
    queryFn: getContentStudyEligibility,
    enabled: false,
    staleTime: 0,
    retry: 1,
  });
  const refetchEligibility = query.refetch;
  useFocusEffect(
    useCallback(() => {
      if (userId.length > 0) void refetchEligibility();
    }, [refetchEligibility, userId]),
  );
  useEffect(() => {
    if (query.error) {
      Sentry.captureException(query.error, {
        tags: { feature: 'content-study', operation: 'check-upload-eligibility' },
      });
    }
  }, [query.error]);

  return {
    data: query.data,
    error: query.error,
    isError: query.isError,
    isPending: query.isPending,
    refetch: query.refetch,
  };
}
