import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { streakKeys } from '../../streaks/hooks';
import type { Streak } from '../../streaks/schemas';
import {
  getOwnedSessionThemeIds,
  getSelectableThemes,
  purchaseTheme,
} from '../service';

export const sessionThemeKeys = {
  all: ['session-themes'] as const,
  owned: (userId: string) =>
    [...sessionThemeKeys.all, 'owned', userId] as const,
  list: (userId: string, longestDays: number) =>
    [...sessionThemeKeys.all, 'list', userId, longestDays] as const,
};

export function useOwnedSessionThemeIds(userId: string | null) {
  return useQuery({
    queryKey: sessionThemeKeys.owned(userId ?? ''),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID required');
      }

      return getOwnedSessionThemeIds(userId);
    },
    enabled: !!userId,
  });
}

export function useSelectableThemes(
  userId: string | null,
  streak: Pick<Streak, 'longestDays'> | null,
) {
  return useQuery({
    queryKey: sessionThemeKeys.list(userId ?? '', streak?.longestDays ?? 0),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID required');
      }

      return getSelectableThemes(userId, streak);
    },
    enabled: !!userId,
  });
}

export function usePurchaseTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      themeId,
      streak,
    }: {
      userId: string;
      themeId: string;
      streak: Pick<Streak, 'longestDays'> | null;
    }) => purchaseTheme(userId, themeId, streak),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: sessionThemeKeys.owned(variables.userId),
        }),
        queryClient.invalidateQueries({
          queryKey: sessionThemeKeys.list(
            variables.userId,
            variables.streak?.longestDays ?? 0,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: ['economy', 'wallet', variables.userId],
        }),
        queryClient.invalidateQueries({
          queryKey: streakKeys.byUser(variables.userId),
        }),
      ]);
    },
  });
}
