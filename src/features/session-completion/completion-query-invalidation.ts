import { queryClient, QueryKeys } from '../../api/QueryProvider';

export function invalidateCompletionQueries(_userId: string): void {
  void queryClient.invalidateQueries({ queryKey: QueryKeys.session });
  void queryClient.invalidateQueries({ queryKey: QueryKeys.streak });
  void queryClient.invalidateQueries({ queryKey: QueryKeys.achievements });
}
