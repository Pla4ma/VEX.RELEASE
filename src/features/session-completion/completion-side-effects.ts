import * as Sentry from "@sentry/react-native";
import { recordCompletionCompanionMemories } from "./companion-memory-integration";
import { processCompletedSessionPromise } from "../companion-promise/service";
import {
  buildPostSessionStoryViewModel,
  type PostSessionStoryViewModel,
} from "./story-view-model-service";
import { setCompletionSyncState } from "./completion-sync-state";
import type { SessionSummary } from "../../session/types";
import type {
  CompletionLedger,
  CompletionPersonalizationResult,
} from "./schemas";

interface CompletionSideEffectInput {
  degradedSystems: string[];
  finalLedger: CompletionLedger;
  isPersonalBest: boolean;
  personalizationResult: CompletionPersonalizationResult | null;
  sessionId: string;
  summary: SessionSummary;
  userId: string;
}

export async function applyCompletionSideEffects(
  input: CompletionSideEffectInput,
): Promise<PostSessionStoryViewModel> {
  const {
    degradedSystems,
    finalLedger,
    isPersonalBest,
    personalizationResult,
    summary,
    userId,
  } = input;

  try {
    const { recordRescueCompletion } =
      await import("../rescue-mode/completion-integration");
    await recordRescueCompletion({
      actualDurationSeconds: summary.actualDuration,
      completionPercentage: summary.completionPercentage,
      sessionMode: summary.sessionMode,
      status: summary.status,
      userId,
    });
  } catch (error: unknown) {
    // rescue-mode may not exist or its dependencies unavailable — safe to skip
  }

  const companionMemories = await recordCompletionCompanionMemories({
    isPersonalBest,
    ledger: finalLedger,
    summary,
    userId,
  });

  const companionPromise = await processCompletedSessionPromise(
    {
      completedAt: finalLedger.completedAt,
      durationMinutes:
        Math.max(summary.actualDuration, summary.effectiveDuration) / 60,
      sessionId: summary.sessionId,
      sessionMode: summary.sessionMode,
      userId,
    },
    finalLedger.timezone,
  );

  const storyViewModel = buildPostSessionStoryViewModel({
    companionMemory: companionMemories[0] ?? null,
    companionPromise:
      companionPromise.fulfilledPromise ??
      companionPromise.createdPromise ??
      companionPromise.missedPromise,
    degradedWarnings: degradedSystems,
    ledger: finalLedger,
    personalBest: { isPersonalBest },
    personalizationResult,
    summary,
  });

  setCompletionSyncState(
    finalLedger.ledgerId,
    degradedSystems,
    storyViewModel.pendingSync,
  );
  return storyViewModel;
}
