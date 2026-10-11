import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

import { getConnectionState } from '../../lib/repository/base';
import { enqueue } from '../../lib/offline/queue';
import { SessionSummarySchema, type SessionSummary } from '../../session/types/schemas';
import { createDebugger } from '../../utils/debug';
import { queryClient, QueryKeys } from '../../api/QueryProvider';
import { useSessionUIStore } from '../../store/session-state';
import { applyCompletionSubsystems } from './completion-subsystems';
import { buildCompletionLedger } from './ledger-service';
import { applyPersonalizationAndSideEffects } from './completion-personalization-step';
import type { PostSessionStoryViewModel } from './post-session-story-view-model';
import {
  getCompletionLedgerByIdempotencyKey,
  persistCompletionLedger,
} from './repository';
import { retainCompletionOutcome } from './completion-outcome-service';
import { recordCompletedSession } from './session-history-service';
import {
  beginKeyProcessing,
  markKeyProcessed,
  releaseKeyProcessing,
} from './idempotency';

export { initializeSessionCompletionOrchestrator } from './completion-orchestrator-init';

const debug = createDebugger('session-completion:orchestrator');

function invalidateCompletionQueries(userId: string): void {
  void queryClient.invalidateQueries({ queryKey: [...QueryKeys.session, userId] });
  void queryClient.invalidateQueries({ queryKey: [...QueryKeys.streak, userId] });
  void queryClient.invalidateQueries({ queryKey: [...QueryKeys.achievements, userId] });
}

function setCompletionSyncState(
  ledgerId: string,
  degradedSystems: string[],
  isSyncing: boolean,
): void {
  const hasDegradedSystems = degradedSystems.length > 0;
  useSessionUIStore.getState().setCompletionSyncState({
    ledgerId,
    message: hasDegradedSystems
      ? 'Session saved. Some rewards need a repair pass.'
      : isSyncing
        ? 'Session saved locally. VEX is syncing it now.'
        : null,
    repairCtaLabel: hasDegradedSystems ? 'Repair sync' : null,
    status: hasDegradedSystems
      ? 'failed_sync'
      : isSyncing
        ? 'pending_sync'
        : 'synced',
    updatedAt: Date.now(),
  });
}

const SessionCompletedEventSchema = z
  .object({
    sessionId: z.string().uuid(),
    summary: z.unknown(),
    timestamp: z.number().optional(),
    userId: z.string().min(1),
  })
  .strict();

type SessionCompletedEvent = z.infer<typeof SessionCompletedEventSchema>;

export async function orchestrateSessionCompletion(
  event: SessionCompletedEvent,
): Promise<PostSessionStoryViewModel | null> {
  let parsed: SessionCompletedEvent;
  let summary: SessionSummary;
  try {
    parsed = SessionCompletedEventSchema.parse(event);
    summary = SessionSummarySchema.parse(parsed.summary);
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: 'session-completion-orchestrator-parse' } });
    // If parsing fails, abort processing
    return null;
  }
  const isOnline = getConnectionState() === 'online';

  // LAYER 1: Local completion receipt — always succeeds
  const ledger = buildCompletionLedger({
    completedAt: parsed.timestamp ?? Date.now(),
    degradedSystems: ['session-history', 'focus-identity', 'streak', 'progression', 'rewards'],
    offlineSyncStatus: isOnline ? 'synced' : 'pending_sync',
    sessionId: parsed.sessionId,
    summary,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
    userId: parsed.userId,
  });
  const key = ledger.idempotencyKey;

  // LAYER 1b: Idempotency guard
  if (!beginKeyProcessing(key)) {return null;}

  try {
    let existing = null;
    if (isOnline) {
      try {
        existing = await getCompletionLedgerByIdempotencyKey(key);
      } catch (error: unknown) {
        Sentry.captureException(error, { tags: { feature: 'session-completion-lookup' } });
      }
    }
    if (existing) {
      markKeyProcessed(key);
      setCompletionSyncState(existing.ledgerId, existing.degradedSystems, existing.offlineSyncStatus !== 'synced');
      return null;
    }

    // LAYER 2: Persist session — Supabase primary, offline queue fallback
    let persisted = ledger;
    if (isOnline) {
      try {
        persisted = await persistCompletionLedger(ledger);
        if (persisted.ledgerId !== ledger.ledgerId) {
          markKeyProcessed(key);
          setCompletionSyncState(persisted.ledgerId, persisted.degradedSystems, persisted.offlineSyncStatus !== 'synced');
          return null;
        }
        try {
          await recordCompletedSession(ledger);
          persisted = { ...persisted, degradedSystems: persisted.degradedSystems.filter((name) => name !== 'session-history') };
        } catch (error: unknown) {
          Sentry.captureException(error, {
            tags: { feature: 'session-record-creation' },
          });
          persisted = {
            ...persisted,
            degradedSystems: [...new Set([...persisted.degradedSystems, 'session-history'])],
          };
          enqueue({ feature: 'sessions', idempotencyKey: key, operation: 'CREATE',
            payload: { ledger: persisted }, priority: 'high', maxRetries: 10 });
        }
      } catch (error: unknown) {
        Sentry.captureException(error, { tags: { feature: 'session-completion-ledger' } });
        enqueue({ feature: 'sessions', idempotencyKey: key, operation: 'CREATE', payload: { ledger } });
        persisted = { ...ledger, offlineSyncStatus: 'pending_sync' };
      }
    } else {
      enqueue({ feature: 'sessions', idempotencyKey: ledger.idempotencyKey, operation: 'CREATE', payload: { ledger } });
    }

    // LAYER 3: XP / streak / progression / rewards
    const subsystemResult = await applyCompletionSubsystems({ ledger: persisted, summary });
    const finalLedger = await retainCompletionOutcome(subsystemResult.ledger, isOnline);

    // LAYER 3.5 + 4: Personalization and side effects
    const storyViewModel = await applyPersonalizationAndSideEffects({
      userId: parsed.userId,
      finalLedger,
      summary,
      degradedSystems: subsystemResult.degradedSystems,
    });

    debug.info('Session completion orchestrated for %s', parsed.sessionId);
    invalidateCompletionQueries(parsed.userId);
    markKeyProcessed(key);
    setCompletionSyncState(finalLedger.ledgerId, subsystemResult.degradedSystems, finalLedger.offlineSyncStatus !== 'synced');
    return storyViewModel;
  } catch (error) {
    releaseKeyProcessing(key);
    throw error;
  }
}
