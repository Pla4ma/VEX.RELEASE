/**
 * Progression Hooks
 * TanStack Query hooks for UI consumption
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import * as service from "../service";
import * as repository from "../repository";
import {
  getProgressionEnhanced,
  getProgressionSummaryEnhanced,
} from "../service-enhanced-read";
import {
  AddXpInputSchema,
  PrestigeInputSchema,
  type AddXpInput,
  type PrestigeInput,
} from "../schemas";
import {
  getProgressionService,
  type LevelState,
} from "../../../progression/ProgressionService";
import type { AddXpOperationResult } from "../service-enhanced";

// ============================================================================
// Query Keys
// ============================================================================

export const progressionKeys = {
  all: ["progression"] as const,
  byUser: (userId: string) => [...progressionKeys.all, userId] as const,
  summary: (userId: string) =>
    [...progressionKeys.byUser(userId), "summary"] as const,
  history: (userId: string) =>
    [...progressionKeys.byUser(userId), "history"] as const,
  daily: (userId: string, date: string) =>
    [...progressionKeys.byUser(userId), "daily", date] as const,
  weekly: (userId: string, weekStart: string) =>
    [...progressionKeys.byUser(userId), "weekly", weekStart] as const,
};

// ============================================================================
// Read Hooks
// ============================================================================

export function useProgression(userId: string | null) {
  return useQuery({
    queryKey: progressionKeys.byUser(userId || ""),
    queryFn: () => {
      if (!userId) {
        throw new Error("User ID required");
      }
      return getProgressionEnhanced(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useProgressionSummary(userId: string | null) {
  return useQuery({
    queryKey: progressionKeys.summary(userId || ""),
    queryFn: () => {
      if (!userId) {
        throw new Error("User ID required");
      }
      return getProgressionSummaryEnhanced(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useXpHistory(
  userId: string | null,
  options?: { limit?: number; since?: number },
) {
  return useQuery({
    queryKey: [...progressionKeys.history(userId || ""), options],
    queryFn: () => {
      if (!userId) {
        throw new Error("User ID required");
      }
      return repository.fetchXpHistory(userId, options);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDailyProgress(userId: string | null, date: string) {
  return useQuery({
    queryKey: progressionKeys.daily(userId || "", date),
    queryFn: () => {
      if (!userId) {
        throw new Error("User ID required");
      }
      return service.getDailyProgress(userId);
    },
    enabled: !!userId,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

export function useAddXp() {
  const queryClient = useQueryClient();

  return useMutation<AddXpOperationResult, Error, AddXpInput>({
    mutationFn: async (input) => {
      const validated = AddXpInputSchema.parse(input);
      return service.addXp(validated.userId, validated);
    },
    onSuccess: (data, variables) => {
      // Invalidate progression queries
      queryClient.invalidateQueries({
        queryKey: progressionKeys.byUser(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: progressionKeys.summary(variables.userId),
      });
    },
  });
}

export function usePrestige() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, PrestigeInput>({
    mutationFn: async (input) => {
      const validated = PrestigeInputSchema.parse(input);
      const progressionService = getProgressionService(validated.userId);
      if (!progressionService.canPrestige()) {
        throw new Error("Prestige is not available");
      }
      await progressionService.prestige();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: progressionKeys.byUser(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: progressionKeys.summary(variables.userId),
      });
    },
  });
}

// ============================================================================
// Optimistic XP Hook
// ============================================================================

export function useOptimisticXp() {
  const queryClient = useQueryClient();
  const addXpMutation = useAddXp();

  const addXpOptimistic = useCallback(
    async (input: AddXpInput) => {
      const validated = AddXpInputSchema.parse(input);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: progressionKeys.byUser(validated.userId),
      });

      // Snapshot previous value
      const previousProgression = queryClient.getQueryData<
        Awaited<ReturnType<typeof getProgressionEnhanced>>
      >(progressionKeys.byUser(validated.userId));

      // Optimistically update
      if (previousProgression) {
        queryClient.setQueryData(progressionKeys.byUser(validated.userId), {
          ...previousProgression,
          xp: previousProgression.xp + validated.amount,
          totalXp: previousProgression.totalXp + validated.amount,
        });
      }

      // Execute mutation
      try {
        const result = await addXpMutation.mutateAsync(validated);
        return result;
      } catch (error) {
        // Rollback on error
        if (previousProgression) {
          queryClient.setQueryData(
            progressionKeys.byUser(validated.userId),
            previousProgression,
          );
        }
        throw error;
      }
    },
    [queryClient, addXpMutation],
  );

  return {
    addXp: addXpOptimistic,
    isPending: addXpMutation.isPending,
    error: addXpMutation.error,
  };
}
