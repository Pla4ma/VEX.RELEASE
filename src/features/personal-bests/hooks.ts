import { useQuery } from "@tanstack/react-query";
import type { SessionMode } from "../../session/modes";
import * as service from "./service";
import type { PersonalBest } from "./types";

export const personalBestKeys = {
  all: ["personal-bests"] as const,
  preview: (userId: string, mode: SessionMode, durationSeconds: number) =>
    [
      ...personalBestKeys.all,
      "preview",
      userId,
      mode,
      durationSeconds,
    ] as const,
  profile: (userId: string) =>
    [...personalBestKeys.all, "profile", userId] as const,
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
  const query = useQuery({
    queryKey: personalBestKeys.preview(userId ?? "none", mode, durationSeconds),
    queryFn: () =>
      userId ? service.getBestPreview(userId, mode, durationSeconds) : null,
    enabled: Boolean(userId && durationSeconds > 0),
  });
  const refresh = query.refetch;
  return {
    data: query.data ?? null,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    refetch: () => {
      void refresh();
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
  const query = useQuery({
    queryKey: personalBestKeys.profile(userId ?? "none"),
    queryFn: () => (userId ? service.getUserPersonalBests(userId) : []),
    enabled: Boolean(userId),
  });
  const refresh = query.refetch;
  return {
    data: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    refetch: () => {
      void refresh();
    },
  };
}
