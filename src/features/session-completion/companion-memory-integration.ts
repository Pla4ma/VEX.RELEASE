import * as Sentry from "@sentry/react-native";
import { loadCompanionState } from "../companion/session-storage";
import { checkAndRecordSessionMemories } from "../companion/memory-service";
import type { CompanionMemory } from "../companion/memory-types";
import type { SessionSummary } from "../../session/types";
import type { CompletionLedger } from "./schemas";

export async function recordCompletionCompanionMemories(input: {
  isPersonalBest: boolean;
  ledger: CompletionLedger;
  summary: SessionSummary;
  userId: string;
}): Promise<CompanionMemory[]> {
  try {
    const companion = await loadCompanionState(input.userId);
    return await checkAndRecordSessionMemories({
      grade: input.ledger.grade,
      isPersonalBest: input.isPersonalBest,
      session: {
        actualDuration: input.summary.actualDuration,
        createdAt: input.summary.createdAt,
        focusPurityScore:
          input.summary.focusPurityScore ?? input.ledger.qualityScore,
        sessionId: input.ledger.sessionId,
        sessionMode: input.summary.sessionMode,
      },
      sessionCount: Math.max(1, companion.sessionCount),
      streakDay: input.ledger.streakResult.newDays,
      userId: input.userId,
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: "companion-memory", operation: "completion-check" },
    });
    return [];
  }
}
