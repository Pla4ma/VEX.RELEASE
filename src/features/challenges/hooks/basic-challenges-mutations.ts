import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store";
import * as service from "../basic-challenges-service";
import type {
  BasicChallengeProgressResult,
  BasicChallengeClaimResult,
} from "../basic-challenges-service";
import { createDebugger } from "../../../utils/debug";
import type { QueryKey } from "@tanstack/react-query";

const debug = createDebugger("challenges:mutations");

// ============================================================================
// Challenge Progress Hook
// ============================================================================

export function useUpdateBasicChallengeProgress(
  challengesKeys: {
    status: (userId: string) => QueryKey;
    daily: (userId: string) => QueryKey;
    weekly: (userId: string) => QueryKey;
  },
) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useMutation<
    BasicChallengeProgressResult,
    Error,
    { sessionId: string; sessionDuration: number }
  >({
    mutationFn: ({ sessionId, sessionDuration }) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      return service.updateBasicChallengeProgressFromSession(
        userId,
        sessionId,
        sessionDuration,
      );
    },
    onSuccess: (result) => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: challengesKeys.status(userId),
        });
        queryClient.invalidateQueries({
          queryKey: challengesKeys.daily(userId),
        });
        queryClient.invalidateQueries({
          queryKey: challengesKeys.weekly(userId),
        });
      }

      if (result.dailyCompleted || result.weeklyCompleted) {
        queryClient.invalidateQueries({ queryKey: ["progression", userId] });
        queryClient.invalidateQueries({ queryKey: ["rewards", userId] });
      }
    },
    onError: (error) => {
      debug.error(
        "Failed to update challenge progress",
        error instanceof Error ? error : new Error(String(error)),
      );
    },
  });
}

// ============================================================================
// Challenge Reward Claim Hook
// ============================================================================

export function useClaimBasicChallengeReward(
  challengesKeys: {
    status: (userId: string) => QueryKey;
    daily: (userId: string) => QueryKey;
    weekly: (userId: string) => QueryKey;
  },
) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useMutation<BasicChallengeClaimResult, Error, "DAILY" | "WEEKLY">({
    mutationFn: (challengeType) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      return service.claimBasicChallengeReward(userId, challengeType);
    },
    onSuccess: (result) => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: challengesKeys.status(userId),
        });
        queryClient.invalidateQueries({
          queryKey: challengesKeys.daily(userId),
        });
        queryClient.invalidateQueries({
          queryKey: challengesKeys.weekly(userId),
        });
      }

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["rewards", userId] });
        queryClient.invalidateQueries({ queryKey: ["progression", userId] });
      }
    },
    onError: (error) => {
      debug.error(
        "Failed to claim challenge reward",
        error instanceof Error ? error : new Error(String(error)),
      );
    },
  });
}
