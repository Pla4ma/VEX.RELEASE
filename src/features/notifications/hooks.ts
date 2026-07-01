// notifications feature hooks
// TanStack Query hooks for notifications server state

import { useQuery } from '@tanstack/react-query';

export const notificationKeys = {
  all: ['notifications'] as const,
  unreadCount: (userId: string) => ['notifications', 'unread-count', userId] as const,
  list: (userId: string) => ['notifications', 'list', userId] as const,
  detail: (id: string) => ['notifications', 'detail', id] as const,
};

export function useUnreadNotificationCount(userId: string | undefined) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(userId ?? 'anonymous'),
    queryFn: async () => ({ count: 0 }),
    enabled: !!userId,
  });
}
