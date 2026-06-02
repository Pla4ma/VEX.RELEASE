import { captureSilentFailure } from '../../utils/silent-failure';
import { queryClient, QueryKeys } from '../../api/QueryProvider';

export function invalidateCompletionQueries(userId: string): void {
  const keys = [
    QueryKeys.session,
    QueryKeys.streak,
    QueryKeys.achievements,
    ['user', userId],
    ['personal-bests'],
    ['companion-memories', userId],
    ['companion-promise', 'home', userId],
  ];

  for (const queryKey of keys) {
    queryClient.invalidateQueries({ queryKey }).catch((error: unknown) => {
      captureSilentFailure(error, { feature: 'session-completion', operation: 'invalidateQueries', type: 'data' });
    });
  }
}
