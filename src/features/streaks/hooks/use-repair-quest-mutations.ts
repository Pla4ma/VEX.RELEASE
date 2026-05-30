import { useQueryClient } from "@tanstack/react-query";
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
  saveRepairQuestEnhanced,
} from "../repository/enhanced";
import { StreakRepairQuestSchema } from "../schemas-risk-repair";
import type { StreakRepairQuest } from "../schemas-risk-repair";
import type { RecordSessionResult } from "./types";
import type { QueryKey } from "@tanstack/react-query";

interface UseRepairQuestMutationsProps {
  userId: string | undefined;
  queryKey: QueryKey;
  statusQueryKey: QueryKey;
  quest: StreakRepairQuest | null | undefined;
}

export function useRepairQuestMutations({
  userId,
  queryKey,
  statusQueryKey,
  quest,
}: UseRepairQuestMutationsProps) {
  const queryClient = useQueryClient();
  const { track } = useAnalytics();

  const createQuestMutation = useOfflineAwareMutation(
    async (previousStreak: number): Promise<StreakRepairQuest> => {
      if (!userId) throw new Error("User not authenticated");
      const createdQuest = await createRepairQuest(userId, previousStreak);
      if (!createdQuest) throw new Error("Failed to create repair quest");
      const result = await saveRepairQuestEnhanced(createdQuest);
      if (result.error) throw result.error;
      return createdQuest;
    },
    {
      onSuccess: (data: StreakRepairQuest) => {
        const parsed = StreakRepairQuestSchema.parse(data);
        queryClient.setQueryData(queryKey, parsed);
        queryClient.invalidateQueries({ queryKey: statusQueryKey });
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
      onSuccess: (result: RecordSessionResult) => {
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: statusQueryKey });
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

  return { createQuestMutation, recordSessionMutation };
}
