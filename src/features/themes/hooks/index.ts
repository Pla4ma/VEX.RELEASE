import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useToast } from '../../../shared/ui/components/Toast';

import { streakKeys } from '../../streaks/hooks';
import type { Streak } from '../../streaks/schemas';
import {
  getOwnedSessionThemeIds,
  getSelectableThemes,
  purchaseTheme,
} from '../service';
import type { SessionTheme } from '../session-themes';

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
  const { show } = useToast();

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
    onMutate: async (variables) => {
      const ownedKey = sessionThemeKeys.owned(variables.userId);
      await queryClient.cancelQueries({ queryKey: ownedKey });

      const previousOwned = queryClient.getQueryData<string[]>(ownedKey);

      if (previousOwned && !previousOwned.includes(variables.themeId)) {
        queryClient.setQueryData<string[]>(ownedKey, [...previousOwned, variables.themeId]);
      }

      const listKey = sessionThemeKeys.list(variables.userId, variables.streak?.longestDays ?? 0);
      const previousList = queryClient.getQueryData<SessionTheme[]>(listKey);

      if (previousList) {
        queryClient.setQueryData<SessionTheme[]>(listKey, previousList.map((theme) =>
          theme.id === variables.themeId ? { ...theme, isOwned: true } : theme,
        ));
      }

      return { ownedKey, listKey, previousOwned, previousList };
    },
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
    onError: (error, _variables, context) => {
      if (context?.previousOwned) {
        queryClient.setQueryData(context.ownedKey, context.previousOwned);
      }
      if (context?.previousList) {
        queryClient.setQueryData(context.listKey, context.previousList);
      }
      Sentry.captureException(error, { tags: { feature: 'themes', operation: 'purchaseTheme' } });
      show({ type: 'error', title: 'Theme purchase failed', message: 'Try again when connection returns.' });
    },
  });
}
