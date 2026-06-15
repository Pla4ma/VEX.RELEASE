import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as service from '../service';

export const notificationKeys = {
  all: ['notifications'] as const,
  unreadCount: (userId: string) =>
    [...notificationKeys.all, 'unread-count', userId] as const,
};

export function useUnreadNotificationsCount(userId: string | null) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch, isPending } = useQuery({
    queryKey: notificationKeys.unreadCount(userId || ''),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID required');
      }
      return service.getUnreadNotificationsCount(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60,
  });

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    return service.subscribeToNotificationCenter(userId, () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(userId),
      });
    });
  }, [queryClient, userId]);

  return { data, isLoading, isError, error, refetch, isPending };
}
