import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";
import { useAuthStore } from "../../../store";
import { useOfflineAwareMutation } from "../../../shared/hooks/useOfflineAwareMutation";
import { useAnalytics } from "../../../analytics/hooks/useAnalytics";
import { eventBus } from "../../../events";
import {
  createRepairQuest,
  recordRepairQuestSession,
} from "../streak-repair-quest";
import {
  fetchActiveRepairQuestEnhanced,
  saveRepairQuestEnhanced,
} from "../repository/enhanced";
import { StreakRepairQuestSchema } from "../schemas-enhanced";
import type { StreakRepairQuest } from "../schemas-enhanced";
import type { UseStreakRepairQuestReturn, RecordSessionResult } from "./types";
import { useRepairQuestStatus } from "./useRepairQuestStatus";

const QUERY_KEYS = {
  repairQuest: (userId: string) => ["streaks", "repairQuest", userId],
  repairQuestStatus: (userId: string) => [
    "streaks",
    "repairQuestStatus",
    userId,
  ],
} as const;
const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

export function useStreakRepairQuest(): UseStreakRepairQuestReturn {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const { track } = useAnalytics();

  const {
    status,
    isStatusLoading,
    statusError,
    refetchStatus: refetchStatusFn,
    canStartQuest,
    progressPercent,
    hoursRemaining,
  } = useRepairQuestStatus();

  const {
    data: quest,
    isLoading,
    error,
    refetch: refetchQuest,
  } = useQuery({
    queryKey: QUERY_KEYS.repairQuest(userId ?? ""),
    queryFn: async (): Promise<StreakRepairQuest | null> => {
      if (!userId) return null;
      try {
        const result = await fetchActiveRepairQuestEnhanced(userId);
        if (result.error) throw result.error;
        if (!result.data) return null;
        return StreakRepairQuestSchema.parse(result.data);
      } catch (err) {
        Sentry.captureException(err, {
          tags: {
            feature: "streaks",
            hook: "useStreakRepairQuest",
            operation: "fetchQuest",
          },
        });
        throw err;
      }
    },
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const createQuestMutation = useOfflineAwareMutation(
    async (previousStreak: number): Promise<StreakRepairQuest> => {
      if (!userId) throw new Error("User not authenticated");
      const quest = await createRepairQuest(userId, previousStreak);
      if (!quest) throw new Error("Failed to create repair quest");
      const result = await saveRepairQuestEnhanced(quest);
      if (result.error) throw result.error;
      return quest;
    },
    {
      onSuccess: (data: StreakRepairQuest) => {
        const parsed = StreakRepairQuestSchema.parse(data);
        queryClient.setQueryData(QUERY_KEYS.repairQuest(userId ?? ""), parsed);
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.repairQuestStatus(userId ?? ""),
        });
        track("streak_repair_quest_created", {
          questId: parsed.id,
          previousStreak: parsed.previousStreak,
          targetRestoreDays: parsed.targetRestoreDays,
        });
        eventBus.publish("streak:repair_quest_created", {
          userId: userId ?? "",
          questId: parsed.id,
          daysToRecover: parsed.targetRestoreDays,
          deadline: parsed.expiresAt,
        });
      },
      onError: (error: Error) => {
        Sentry.captureException(error, {
          tags: {
            feature: "streaks",
            hook: "useStreakRepairQuest",
            operation: "createQuest",
          },
        });
      },
    },
  );

  const recordSessionMutation = useOfflineAwareMutation(
    async ({
      sessionId,
      duration,
      qualityScore,
    }: {
      sessionId: string;
      duration: number;
      qualityScore: number;
    }): Promise<RecordSessionResult> => {
      if (!userId) throw new Error("User not authenticated");
      return recordRepairQuestSession(
        userId,
        sessionId,
        duration,
        qualityScore,
      );
    },
    {
      onSuccess: (data: RecordSessionResult) => {
        const result = data as RecordSessionResult;
        // Safe: recordRepairQuestSession return type matches RecordSessionResult
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.repairQuest(userId ?? ""),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.repairQuestStatus(userId ?? ""),
        });
        if (result.questCompleted) {
          track("streak_repair_quest_completed", {
            restoredToDays: result.restoredToDays,
          });
        } else if (result.questUpdated) {
          track("streak_repair_quest_progress", {
            sessionsCompleted: quest?.sessionsCompleted,
          });
        }
      },
      onError: (error: Error) => {
        Sentry.captureException(error, {
          tags: {
            feature: "streaks",
            hook: "useStreakRepairQuest",
            operation: "recordSession",
          },
        });
      },
    },
  );

  const createQuest = useCallback(
    async (previousStreak: number) => {
      await createQuestMutation.mutateAsync(previousStreak);
    },
    [createQuestMutation],
  );

  const recordSession = useCallback(
    async (
      sessionId: string,
      duration: number,
      qualityScore: number,
    ): Promise<boolean> => {
      const result = await recordSessionMutation.mutateAsync({
        sessionId,
        duration,
        qualityScore,
      });
      return result.questCompleted;
    },
    [recordSessionMutation],
  );

  const refetch = useCallback(async () => {
    await refetchQuest();
  }, [refetchQuest]);
  const refetchStatus = useCallback(async () => {
    await refetchStatusFn();
  }, [refetchStatusFn]);
  const retry = useCallback(() => {
    void refetchQuest();
  }, [refetchQuest]);
  const retryCreate = useCallback(() => {
    createQuestMutation.reset();
  }, [createQuestMutation]);
  const retryRecord = useCallback(() => {
    recordSessionMutation.reset();
  }, [recordSessionMutation]);

  const isEmpty = !quest && !isLoading && !error;

  return {
    quest: quest ?? null,
    status,
    isLoading,
    isStatusLoading,
    isCreating: createQuestMutation.isPending,
    isRecordingSession: recordSessionMutation.isPending,
    error: error as Error | null,
    statusError: statusError as Error | null,
    createError: createQuestMutation.error as Error | null,
    recordError: recordSessionMutation.error as Error | null,
    createQuest,
    recordSession,
    refetch,
    refetchStatus,
    retry,
    retryCreate,
    retryRecord,
    isEmpty,
    canStartQuest,
    progressPercent,
    hoursRemaining,
  };
}
