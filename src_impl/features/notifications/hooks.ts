import { useQuery } from '@tanstack/react-query';
import * as service from './service';

export const notificationKeys = {
  all: ['notifications'] as const,
  unreadCount: (userId: string) => [...notificationKeys.all, 'unread-count', userId] as const,
};

export function useUnreadNotificationsCount(userId: string | null) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(userId || ''),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID required');
      }
      return service.getUnreadNotificationsCount(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}
