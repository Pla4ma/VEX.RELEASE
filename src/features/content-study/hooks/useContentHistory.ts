/**
 * useContentHistory Hook
 * Manages user's content history and deletion
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store';
import { fetchContentHistory } from '../ContentStudyService';
import { contentStudyQueryKeys } from './queryKeys';

export function useContentHistory() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: contentStudyQueryKeys.history(user?.id ?? ''),
    queryFn: async () => {
      if (!user) {
        return [];
      }
      const { fetchContentHistory: fetchHistory } =
        await import('../ContentStudyService');
      return fetchHistory(user.id, 20);
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const { deleteContent: deleteItem } =
        await import('../ContentStudyService');
      await deleteItem(contentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contentStudyQueryKeys.all,
      });
    },
  });

  return {
    content: historyQuery.data || [],
    isLoading: historyQuery.isPending,
    error: historyQuery.error?.message || null,
    refetch: historyQuery.refetch,
    deleteContent: deleteContentMutation.mutate,
  };
}
