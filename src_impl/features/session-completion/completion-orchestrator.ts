import * as Sentry from "@sentry/react-native";
import { z } from "zod";
import { eventBus } from "../../events";
import { queryClient, QueryKeys } from "../../api/QueryProvider";
import { getConnectionState } from "../../lib/repository/base";
import { enqueue } from "../../lib/offline/queue";
import { SessionSummarySchema } from "../../session/types";
import { useSessionUIStore } from "../../store/session-state";
import { createDebugger } from "../../utils/debug";
import { recordCompletionCompanionMemories } from "./companion-memory-integration";
import { applyCompletionSubsystems } from "./completion-subsystems";
import { buildCompletionLedger } from "./ledger-service";
import { resolveCompletionPersonalBest } from "./personal-best-integration";
import {
  createCompletionLedger,
  getCompletionLedgerByIdempotencyKey,
} from "./repository";
import {
  buildPostSessionStoryViewModel,
  type PostSessionStoryViewModel,
} from "./story-view-model-service";

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

const processedIdempotencyKeys = new Set<string>();
let initialized = false;

export async function orchestrateSessionCompletion(
  event: SessionCompletedEvent,
): Promise<PostSessionStoryViewModel | null> {
  const parsed = SessionCompletedEventSchema.parse(event);
  const summary = SessionSummarySchema.parse(parsed.summary);
  const isOnline = getConnectionState() !== "offline";
  const ledger = buildCompletionLedger({
    completedAt: parsed.timestamp ?? Date.now(),
    offlineSyncStatus: isOnline ? "synced" : "pending_sync",
    sessionId: parsed.sessionId,
    summary,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    userId: parsed.userId,
  });
  const key = ledger.idempotencyKey;

  if (processedIdempotencyKeys.has(key)) {
    return null;
  }
  const existing = await getCompletionLedgerByIdempotencyKey(key);
  if (existing) {
    processedIdempotencyKeys.add(key);
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
  processedIdempotencyKeys.add(key);

  let persisted = ledger;
  if (isOnline) {
    try {
      persisted = await createCompletionLedger(ledger);
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
  const companionMemories = await recordCompletionCompanionMemories({
    isPersonalBest: personalBest.isPersonalBest,
    ledger: finalLedger,
    summary,
    userId: parsed.userId,
  });

  const storyViewModel = buildPostSessionStoryViewModel({
    companionMemory: companionMemories[0] ?? null,
    degradedWarnings: degradedSystems,
    ledger: finalLedger,
    personalBest,
    summary,
  });

  if (storyViewModel.pendingSync) {
    sessionUIStore.setCompletionSyncState({
      ledgerId: finalLedger.ledgerId,
      message: "One session is saved offline. It will sync when you reconnect.",
      repairCtaLabel: null,
      status: "pending_sync",
      updatedAt: Date.now(),
    });
  } else if (degradedSystems.length > 0) {
    sessionUIStore.setCompletionSyncState({
      ledgerId: finalLedger.ledgerId,
      message: "Session completion synced, but some rewards need repair.",
      repairCtaLabel: "Repair now",
      status: "failed_sync",
      updatedAt: Date.now(),
    });
  } else {
    sessionUIStore.setCompletionSyncState({
      ledgerId: finalLedger.ledgerId,
      message: null,
      repairCtaLabel: null,
      status: "synced",
      updatedAt: Date.now(),
    });
  }

  debug.info("Session completion orchestrated for %s", parsed.sessionId);

  // Invalidate relevant queries to update UI
  queryClient
    .invalidateQueries({ queryKey: QueryKeys.session })
    .catch(() => undefined);
  queryClient
    .invalidateQueries({ queryKey: QueryKeys.streak })
    .catch(() => undefined);
  queryClient
    .invalidateQueries({ queryKey: QueryKeys.achievements })
    .catch(() => undefined);
  queryClient
    .invalidateQueries({ queryKey: ["wallet", parsed.userId] })
    .catch(() => undefined);
  queryClient
    .invalidateQueries({ queryKey: ["transactions", parsed.userId] })
    .catch(() => undefined);
  queryClient
    .invalidateQueries({ queryKey: ["user", parsed.userId] })
    .catch(() => undefined);
  queryClient
    .invalidateQueries({ queryKey: ["personal-bests"] })
    .catch(() => undefined);
  queryClient
    .invalidateQueries({ queryKey: ["companion-memories", parsed.userId] })
    .catch(() => undefined);

  return storyViewModel;
}

export function initializeSessionCompletionOrchestrator(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  eventBus.subscribe("session:completed", (rawEvent) => {
    const parsed = SessionCompletedEventSchema.safeParse(rawEvent);
    if (!parsed.success) {
      return;
    }
    orchestrateSessionCompletion(parsed.data).catch((error: unknown) => {
      Sentry.captureException(error, {
        tags: { feature: "session-completion-orchestrator" },
      });
    });
  });
}
