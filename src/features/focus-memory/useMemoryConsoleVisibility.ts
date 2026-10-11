import { useQuery } from '@tanstack/react-query';
import { canShowMemoryConsole } from './service';

export function useMemoryConsoleVisibility(
  userId: string | null,
):
  | { isVisible: false; isLoading: true; error: null }
  | { isVisible: false; isLoading: false; error: Error }
  | { isVisible: boolean; isLoading: false; error: null } {
  const { isPending, isError, error, data } = useQuery<boolean, Error>({
    queryKey: ['memory-console-visible', userId],
    queryFn: () => canShowMemoryConsole(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });

  if (!userId) {
    return { isVisible: false, isLoading: false, error: null };
  }
  if (isPending) {
    return { isVisible: false, isLoading: true, error: null };
  }
  if (isError) {
    return {
      isVisible: false,
      isLoading: false,
      error: error ?? new Error('Could not check memory availability.'),
    };
  }
  return { isVisible: data ?? false, isLoading: false, error: null };
}
