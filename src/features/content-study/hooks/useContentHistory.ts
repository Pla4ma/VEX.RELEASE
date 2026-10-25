/**
 * useContentHistory Hook
 * Manages user's content history and deletion
 */

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useToast } from '../../../shared/ui/components/Toast';
import { useAuthStore } from '../../../store';
import { deleteContent, fetchContentHistory } from '../ContentStudyService';

import { contentStudyQueryKeys } from './queryKeys';

export function useContentHistory() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { show } = useToast();

  const history = useInfiniteQuery({
    queryKey: contentStudyQueryKeys.history(user?.id ?? ''),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => user
      ? fetchContentHistory(user.id, 20, pageParam)
      : Promise.resolve([]),
    getNextPageParam: (lastPage, _pages, lastOffset) =>
      lastPage.length === 20 ? lastOffset + 20 : undefined,
    enabled: !!user,
    staleTime: 60 * 1000,
  });
  const data = history.data?.pages.flat() ?? [];
  const deleteContentMutation = useMutation({
    mutationFn: (contentId: string) => deleteContent(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contentStudyQueryKeys.all,
      });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'content-study', operation: 'deleteContent' } });
      show({ type: 'error', title: 'Delete failed', message: 'Try again when connection returns.' });
    },
  });

  return {
    content: data,
    error: history.error?.message ?? null,
    fetchNextPage: history.fetchNextPage,
    hasNextPage: history.hasNextPage ?? false,
    isFetchingNextPage: history.isFetchingNextPage,
    isLoading: history.isPending,
    refetch: history.refetch,
    deleteContent: deleteContentMutation.mutate,
  };
}
