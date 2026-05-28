import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { eventBus } from "../../../events";
import * as service from "../service";
import * as queries from "../queries";
import * as repository from "../repository";
import { economyKeys } from "../../economy/hooks";
import type { UpdateChallengeProgressInput } from "../schemas";
export const challengeKeys = {
  all: ["challenges"] as const,
  byId: (id: string) => [...challengeKeys.all, id] as const,
  byType: (seasonId: string, type: string) =>
    [...challengeKeys.all, "type", seasonId, type] as const,
  byUser: (userId: string) => [...challengeKeys.all, "user", userId] as const,
  userChallenge: (userId: string, challengeId: string) =>
    [...challengeKeys.all, "user-challenge", userId, challengeId] as const,
  active: (userId: string) => [...challengeKeys.all, "active", userId] as const,
  completable: (userId: string) =>
    [...challengeKeys.all, "completable", userId] as const,
};
export function useChallenge(challengeId: string) {
  return useQuery({
    queryKey: challengeKeys.byId(challengeId),
    queryFn: () => repository.fetchChallengeById(challengeId),
    enabled: Boolean(challengeId),
    staleTime: 1000 * 60 * 5,
  });
}
export function useChallengesByType(
  seasonId: string,
  type: "DAILY" | "WEEKLY" | "EVENT",
) {
  return useQuery({
    queryKey: challengeKeys.byType(seasonId, type),
    queryFn: () => repository.fetchChallengesByType(seasonId, type),
    enabled: Boolean(seasonId) && Boolean(type),
    staleTime: 1000 * 60 * 5,
  });
}
export function useUserChallenges(userId: string) {
  return useQuery({
    queryKey: challengeKeys.byUser(userId),
    queryFn: () => repository.fetchUserChallenges(userId),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 1,
  });
}
export function useActiveChallenges(
  userId: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: challengeKeys.active(userId),
    queryFn: () => queries.getActiveChallenges(userId),
    enabled: Boolean(userId) && options.enabled !== false,
    staleTime: 1000 * 60 * 5,
  });
}
export function useChallengeSummaries(userId: string) {
  return useQuery({
    queryKey: [...challengeKeys.all, "summaries", userId],
    queryFn: () => queries.getUserChallengeSummaries(userId),
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
  });
}
export function useUpdateChallengeProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateChallengeProgressInput) =>
      service.updateChallengeProgress(input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({
        queryKey: challengeKeys.byUser(input.userId),
      });
      queryClient.invalidateQueries({
        queryKey: challengeKeys.userChallenge(input.userId, input.challengeId),
      });
    },
  });
}
export function useClaimChallengeReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { userId: string; challengeId: string }) => {
      const result = await service.claimChallengeReward(input);
      if (!result.success) {
        throw new Error(result.error ?? "Challenge reward claim failed");
      }
      return result;
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({
        queryKey: challengeKeys.byUser(input.userId),
      });
      queryClient.invalidateQueries({
        queryKey: challengeKeys.active(input.userId),
      });
      queryClient.invalidateQueries({
        queryKey: economyKeys.wallet(input.userId),
      });
    },
  });
}
export function useChallengeProgress(userId: string) {
  const query = useActiveChallenges(userId);
  const challenges = query.data ?? [];
  const total = challenges.length;
  const completed = challenges.filter(
    (item) =>
      item.userChallenge.status === "COMPLETED" ||
      item.userChallenge.status === "CLAIMED",
  ).length;
  return {
    ...query,
    completed,
    total,
    percentComplete: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}
export function useRerollChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      userId: string;
      challengeId: string;
      usePaidReroll: boolean;
      idempotencyKey?: string;
    }) => queries.rerollChallenge(input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({
        queryKey: challengeKeys.byUser(input.userId),
      });
      queryClient.invalidateQueries({
        queryKey: challengeKeys.active(input.userId),
      });
    },
  });
}
export function useChallengeEvents(userId: string, canSubscribe?: boolean) {
  const queryClient = useQueryClient();
  const handleChallengeCompleted = useCallback(
    (event: { userId: string; challengeId: string }) => {
      if (event.userId !== userId) {
        return;
      }
      queryClient.invalidateQueries({ queryKey: challengeKeys.byUser(userId) });
    },
    [queryClient, userId],
  );
  useEffect(() => {
    if (!canSubscribe) {
      return;
    }
    const unsubscribe = eventBus.subscribe(
      "challenge:completed",
      handleChallengeCompleted,
    );
    return unsubscribe;
  }, [canSubscribe, handleChallengeCompleted]);
}
export function useRerollEligibility(userId: string, challengeId: string) {
  return useQuery({
    queryKey: [...challengeKeys.all, "reroll-eligibility", userId, challengeId],
    queryFn: () => queries.checkRerollEligibility(userId, challengeId),
    enabled: Boolean(userId) && Boolean(challengeId),
    staleTime: 1000 * 30,
  });
}
