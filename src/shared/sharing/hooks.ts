/**
 * Share Service — React Hooks
 *
 * Wraps share service functions with loading/error state for React components.
 */

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { shareSession, shareAchievement, shareProfile } from "./share-service";
import type { SessionShareSummary, ShareResult } from "./types";

type UseShareSessionResult = {
  share: (sessionId: string, summary: SessionShareSummary) => void;
  isSharing: boolean;
  error: Error | null;
  result: ShareResult | undefined;
  reset: () => void;
};

export function useShareSession(): UseShareSessionResult {
  const mutation = useMutation({
    mutationFn: ({
      sessionId,
      summary,
    }: {
      sessionId: string;
      summary: SessionShareSummary;
    }) => shareSession(sessionId, summary),
  });

  const share = useCallback(
    (sessionId: string, summary: SessionShareSummary) => {
      mutation.mutate({ sessionId, summary });
    },
    [mutation],
  );

  return {
    share,
    isSharing: mutation.isPending,
    error: mutation.error,
    result: mutation.data,
    reset: mutation.reset,
  };
}

type UseShareAchievementResult = {
  share: (achievementId: string, name: string) => void;
  isSharing: boolean;
  error: Error | null;
  result: ShareResult | undefined;
  reset: () => void;
};

export function useShareAchievement(): UseShareAchievementResult {
  const mutation = useMutation({
    mutationFn: ({ achievementId, name }: { achievementId: string; name: string }) =>
      shareAchievement(achievementId, name),
  });

  const share = useCallback(
    (achievementId: string, name: string) => {
      mutation.mutate({ achievementId, name });
    },
    [mutation],
  );

  return {
    share,
    isSharing: mutation.isPending,
    error: mutation.error,
    result: mutation.data,
    reset: mutation.reset,
  };
}

type UseShareProfileResult = {
  share: (userId: string) => void;
  isSharing: boolean;
  error: Error | null;
  result: ShareResult | undefined;
  reset: () => void;
};

export function useShareProfile(): UseShareProfileResult {
  const mutation = useMutation({
    mutationFn: (userId: string) => shareProfile(userId),
  });

  const share = useCallback(
    (userId: string) => {
      mutation.mutate(userId);
    },
    [mutation],
  );

  return {
    share,
    isSharing: mutation.isPending,
    error: mutation.error,
    result: mutation.data,
    reset: mutation.reset,
  };
}
