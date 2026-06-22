/**
 * useOfflineAwareMutation Hook Stub
 * Placeholder for offline-aware mutation hook
 */

import { useMutation } from '@tanstack/react-query';

export function useOfflineAwareMutation<TData, TError, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Record<string, unknown>,
) {
  return useMutation<TData, TError, TVariables>({
    mutationFn,
    ...options,
  });
}
