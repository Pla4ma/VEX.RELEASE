import * as Sentry from "@sentry/react-native";
import { z } from "zod";

import { eventBus } from "../../events";
import { queryClient, QueryKeys } from "../../api/QueryProvider";
import { getConnectionState } from "../../lib/repository/base";
import { enqueue } from "../../lib/offline/queue";
import { SessionSummarySchema } from "../../session/types";
import { useSessionUIStore } from "../../store/session-state";
import { createDebugger } from "../../utils/debug";
import { processCompletedSessionPromise } from "../companion-promise/service";
import { recordCompletionCompanionMemories } from "./companion-memory-integration";
import { setOrchestratorHandlesCompletion } from "../../session/analytics/SessionAnalytics";
import { applyCompletionSubsystems } from "./completion-subsystems";
import { buildCompletionLedger } from "./ledger-service";
import { resolveCompletionPersonalBest } from "./personal-best-integration";
import { createCompletionLedger, getCompletionLedgerByIdempotencyKey } from "./repository";
import { buildPostSessionStoryViewModel, type PostSessionStoryViewModel } from "./story-view-model-service";
import { createSessionRecord } from "../session-history/repository";
import { isKeyProcessed, markKeyProcessed } from "./idempotency";

const debug = createDebugger("session-completion:orchestrator");

const SessionCompletedEventSchema = z
  .object({
    sessionId: z.string().uuid(),
    summary: z.unknown(),
    timestamp: z.number().optional(),
    userId: z.string().min(1),
  })
  .strict();

type SessionCompletedEvent = z.infer<typeof SessionCompletedEventSchema>;

let initialized = false;

export async function orchestrateSessionCompletion(
  event: SessionCompletedEvent,
): Promise<PostSessionStoryViewModel | null> {
  const parsed = SessionCompletedEventSchema.parse(event);
  const summary = SessionSummarySchema.parse(parsed.summary);
  const isOnline = getConnectionState() !== "offline";

  // LAYER 1: Local completion receipt — always succeeds
  const ledger = buildCompletionLedger({
    completedAt: parsed.timestamp ?? Date.now(),
    offlineSyncStatus: isOnline ? "synced" : "pending_sync",
    sessionId: parsed.sessionId,
    summary,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    userId: parsed.userId,
  });
  const key = ledger.idempotencyKey;

  // LAYER 1b: Idempotency guard
  if (isKeyProcessed(key)) return null;

  const existing = await getCompletionLedgerByIdempotencyKey(key);
  if (existing) {
    markKeyProcessed(key);
    useSessionUIStore.getState().setCompletionSyncState({
      ledgerId: existing.ledgerId,
      message: null,
      repairCtaLabel: null,
      status: "synced",
      updatedAt: Date.now(),
    });
    return buildPostSessionStoryViewModel({
      degradedWarnings: existing.degradedSystems,
      ledger: existing,
      summary,
    });
  }

  markKeyProcessed(key);

  // LAYER 2: Persist session — Supabase primary, offline queue fallback
  let persisted = ledger;
  if (isOnline) {
    try {
      persisted = await createCompletionLedger(ledger);
      createSessionRecord({
        sessionId: ledger.sessionId,
        userId: ledger.userId,
        status: "COMPLETED",
        duration: ledger.targetDurationSeconds,
        effectiveDuration: ledger.effectiveFocusedSeconds,
        qualityScore: ledger.qualityScore,
        mode: ledger.mode,
        difficulty: null,
        metadata: {},
        startedAt: new Date(ledger.startedAt).toISOString(),
        completedAt: new Date(ledger.completedAt).toISOString(),
        endedAt: new Date(ledger.completedAt).toISOString(),
      }).catch((err: unknown) => {
        Sentry.captureException(err, {
          tags: { feature: "session-record-creation" },
        });
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: "session-completion-ledger" },
      });
      enqueue({
        feature: "sessions",
        idempotencyKey: ledger.idempotencyKey,
        operation: "CREATE",
        payload: { ledger },
      });
      persisted = { ...ledger, offlineSyncStatus: "pending_sync" };
    }
  } else {
    enqueue({
      feature: "sessions",
      idempotencyKey: ledger.idempotencyKey,
      operation: "CREATE",
      payload: { ledger },
    });
  }

  const sessionUIStore = useSessionUIStore.getState();

  // LAYER 3: XP / streak / progression / rewards — required for user payoff
  const subsystemResult = await applyCompletionSubsystems({
    ledger: persisted,
    summary,
  });
  const finalLedger = subsystemResult.ledger;
  const degradedSystems = subsystemResult.degradedSystems;
  const personalBest = await resolveCompletionPersonalBest(
    parsed.userId,
    finalLedger,
    summary,
  );

  // LAYER 4: Optional companion memories
  const companionMemories = await recordCompletionCompanionMemories({
    isPersonalBest: personalBest.isPersonalBest,
    ledger: finalLedger,
    summary,
    userId: parsed.userId,
  });

  const companionPromise = await processCompletedSessionPromise(
    {
      completedAt: finalLedger.completedAt,
      durationMinutes:
        Math.max(summary.actualDuration, summary.effectiveDuration) / 60,
      sessionId: parsed.sessionId,
      sessionMode: summary.sessionMode,
      userId: parsed.userId,
    },
    finalLedger.timezone,
  );

  // LAYER 5: Story view model + analytics + query invalidation
  const storyViewModel = buildPostSessionStoryViewModel({
    companionMemory: companionMemories[0] ?? null,
    companionPromise:
      companionPromise.fulfilledPromise ??
      companionPromise.createdPromise ??
      companionPromise.missedPromise,
    degradedWarnings: degradedSystems,
    ledger: finalLedger,
    personalBest,
    summary,
  });

function setSyncState(
  store: ReturnType<typeof useSessionUIStore.getState>,
  ledgerId: string,
  degradedSystems: readonly string[],
  pendingSync: boolean,
): void {
  if (pendingSync) {
    store.setCompletionSyncState({
      ledgerId, message: "One session is saved offline. It will sync when you reconnect.",
      repairCtaLabel: null, status: "pending_sync", updatedAt: Date.now(),
    });
  } else if (degradedSystems.length > 0) {
    store.setCompletionSyncState({
      ledgerId, message: "Session completion synced, but some rewards need repair.",
      repairCtaLabel: "Repair now", status: "failed_sync", updatedAt: Date.now(),
    });
  } else {
    store.setCompletionSyncState({
      ledgerId, message: null, repairCtaLabel: null, status: "synced", updatedAt: Date.now(),
    });
  }
}

  setSyncState(sessionUIStore, finalLedger.ledgerId, degradedSystems, storyViewModel.pendingSync);

  debug.info("Session completion orchestrated for %s", parsed.sessionId);

  const keys = [QueryKeys.session, QueryKeys.streak, QueryKeys.achievements,
    ["user", parsed.userId], ["personal-bests"],
    ["companion-memories", parsed.userId], ["companion-promise", "home", parsed.userId]];
  for (const k of keys) {
    queryClient.invalidateQueries({ queryKey: k }).catch(() => undefined);
  }

  return storyViewModel;
}

export function initializeSessionCompletionOrchestrator(): void {
  if (initialized) return;

  initialized = true;
  setOrchestratorHandlesCompletion(true);

  eventBus.subscribe("session:completed", (rawEvent) => {
    const parsed = SessionCompletedEventSchema.safeParse(rawEvent);
    if (!parsed.success) return;

    orchestrateSessionCompletion(parsed.data).catch((error: unknown) => {
      Sentry.captureException(error, {
        tags: { feature: "session-completion-orchestrator" },
      });
    });
  });
}
