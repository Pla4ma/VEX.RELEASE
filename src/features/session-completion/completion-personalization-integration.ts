import * as Sentry from "@sentry/react-native";

import { createMemoryCandidate, hashEvidence } from "../focus-memory/service";
import { createUnlockDecision } from "../unlock-explainer/service";
import type { CompletionLedger } from "./schemas";
import type { SessionSummary } from "../../session/types";
import type { Lane, LaneProfile } from "../lane-engine/types";
import type { CompletionPersonalizationResult } from "./schemas";
import { buildCompletionPersonalizationResult } from "./completion-personalization";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("completion-personalization:integration");

export interface CompletionPersonalizationInputForIntegration {
  deletedMemoryIds: string[];
  hiddenFeatureKeys: string[];
  isComeback: boolean;
  isPersonalBest: boolean;
  lane: Lane;
  laneProfile: LaneProfile | null;
  ledger: CompletionLedger;
  reflectionAnswer?: string | null;
  sessionCount: number;
  summary: SessionSummary;
}

function resolveLane(
  input: CompletionPersonalizationInputForIntegration,
): Lane {
  return input.laneProfile?.primaryLane ?? input.lane;
}

function resolveHiddenFeatureKeys(
  input: CompletionPersonalizationInputForIntegration,
): string[] {
  if (input.sessionCount < 3) {
    return [...input.hiddenFeatureKeys, "memory_console"];
  }
  return input.hiddenFeatureKeys;
}

async function persistMemoryCandidates(
  result: CompletionPersonalizationResult,
  userId: string,
): Promise<void> {
  for (const candidate of result.memoryCandidates) {
    try {
      const memoryType =
        candidate.confidence >= 0.7
          ? "successful_session_pattern"
          : "lane_evidence";

      await createMemoryCandidate({
        userId,
        type: memoryType,
        summary: candidate.text,
        source: "session_completion" as const,
        confidence: candidate.confidence,
        evidenceHash: hashEvidence(`${memoryType}:${userId}:${candidate.text}`),
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: "completion-memory-persistence" },
      });
    }
  }
}

function produceUnlockDecision(
  input: CompletionPersonalizationInputForIntegration,
): CompletionPersonalizationResult["unlockDecision"] {
  const lane = resolveLane(input);
  const featureKey =
    lane === "student"
      ? "study_os"
      : lane === "game_like"
        ? "run_board"
        : lane === "deep_creative"
          ? "project_thread"
          : "today_strip";

  try {
    const decision = createUnlockDecision({
      featureKey,
      laneProfile: lane,
      sessionCount: input.sessionCount,
      isPremium: false,
      hasRelatedBehavior: input.ledger.grade !== "D",
    });

    return {
      hidden: decision.decision === "hidden",
      key: decision.featureKey as CompletionPersonalizationResult["unlockDecision"]["key"],
      reason: decision.userFacingReason,
      status:
        decision.decision === "hidden"
          ? "blocked"
          : decision.decision === "unlocked"
            ? "available"
            : decision.decision === "teased"
              ? "teased"
              : decision.decision === "degraded"
                ? "blocked"
                : "blocked",
    } as CompletionPersonalizationResult["unlockDecision"];
  } catch {
    return {
      hidden: true,
      key: featureKey as CompletionPersonalizationResult["unlockDecision"]["key"],
      reason: "Feature gate keeps this system out of routing and queries.",
      status: "blocked",
    } as CompletionPersonalizationResult["unlockDecision"];
  }
}

/**
 * Full integration: produce CompletionPersonalizationResult + persist side effects.
 *
 * Called from orchestrator after subsystems have run. Produces canonical
 * personalization output, persists memory candidates into focus-memory,
 * and evaluates unlock decisions.
 *
 * Memory Console is hidden until session 3 (3 sessions minimum).
 * Low-confidence memories (< 0.5) are not persisted.
 * Deleted memory IDs prevent re-creation.
 */
export async function integrateCompletionPersonalization(
  input: CompletionPersonalizationInputForIntegration,
): Promise<CompletionPersonalizationResult> {
  debug.info("Integrating completion personalization for %s", input.summary.sessionId);

  const hiddenFeatureKeys = resolveHiddenFeatureKeys(input);
  const lane = resolveLane(input);

  const result = buildCompletionPersonalizationResult({
    deletedMemoryIds: input.deletedMemoryIds,
    focusScoreDelta: input.ledger.focusScoreDelta,
    grade: input.ledger.grade,
    hiddenFeatureKeys,
    isComeback: input.isComeback,
    isPersonalBest: input.isPersonalBest,
    lane,
    streakAction: input.ledger.streakResult.action,
    streakDays: input.ledger.streakResult.newDays,
    summary: input.summary,
    xpDelta: input.ledger.xpDelta,
    reflectionAnswer: input.reflectionAnswer,
  });

  const unlock = produceUnlockDecision(input);
  const completeResult: CompletionPersonalizationResult = {
    ...result,
    unlockDecision: unlock,
  };

  await persistMemoryCandidates(
    completeResult,
    input.ledger.userId,
  );

  debug.info("Completion personalization integrated for %s", input.summary.sessionId);
  return completeResult;
}
