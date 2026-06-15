import { useQuery } from '@tanstack/react-query';
import type { SessionMode } from '../../session/modes';
import * as service from './service';
import type { PersonalBest } from './types';

export const personalBestKeys = {
  all: ['personal-bests'] as const,
  preview: (userId: string, mode: SessionMode, durationSeconds: number) =>
    [
      ...personalBestKeys.all,
      'preview',
      userId,
      mode,
      durationSeconds,
    ] as const,
  profile: (userId: string) =>
    [...personalBestKeys.all, 'profile', userId] as const,
};

export function usePersonalBestPreview(
  userId: string | null,
  mode: SessionMode,
  durationSeconds: number,
): {
  data: PersonalBest | null;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { refetch, data, isPending, isError, error } = useQuery({
    queryKey: personalBestKeys.preview(userId ?? 'none', mode, durationSeconds),
    queryFn: () =>
    userId ? service.getBestPreview(userId, mode, durationSeconds) : null,
    enabled: Boolean(userId && durationSeconds > 0),
    });





  const refresh = refetch;
  return {
    data: data ?? null,
    isPending: isPending,
    isError: isError,
    error: error instanceof Error ? error : null,
    refetch: () => {
      refresh();
    },
  };
}

export function usePersonalBests(userId: string | null): {
  data: PersonalBest[];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { refetch, data, isPending, isError, error } = useQuery({
    queryKey: personalBestKeys.profile(userId ?? 'none'),
    queryFn: () => (userId ? service.getUserPersonalBests(userId) : []),
    enabled: Boolean(userId),
  });
  const refresh = refetch;
  return {
    data: data ?? [],
    isPending: isPending,
    isError: isError,
    error: error instanceof Error ? error : null,
    refetch: () => {
      refresh();
    },
  };
}
