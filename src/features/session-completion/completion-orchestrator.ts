import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

import { getConnectionState } from '../../lib/repository/base';
import { enqueue } from '../../lib/offline/queue';
import { SessionSummarySchema } from '../../session/types';
import { createDebugger } from '../../utils/debug';
import { queryClient, QueryKeys } from '../../api/QueryProvider';
import { useSessionUIStore } from '../../store/session-state';
import { applyCompletionSubsystems } from './completion-subsystems';
import { buildCompletionLedger } from './ledger-service';
import { applyPersonalizationAndSideEffects } from './completion-personalization-step';
import type { PostSessionStoryViewModel } from './service';
import {
  createCompletionLedger,
  getCompletionLedgerByIdempotencyKey,
  SessionCompletionRepositoryError,
} from './repository';
import {
  createSessionRecord,
} from '../session-history/repository';
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
  const parsed = SessionCompletedEventSchema.parse(event);
  const summary = SessionSummarySchema.parse(parsed.summary);
  const isOnline = getConnectionState() !== 'offline';

  // LAYER 1: Local completion receipt — always succeeds
  const ledger = buildCompletionLedger({
    completedAt: parsed.timestamp ?? Date.now(),
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
    const existing = await getCompletionLedgerByIdempotencyKey(key);
    if (existing) {
      markKeyProcessed(key);
      setCompletionSyncState(existing.ledgerId, [], false);
      return null;
    }

    // LAYER 2: Persist session — Supabase primary, offline queue fallback
    let persisted = ledger;
    if (isOnline) {
      try {
        persisted = await createCompletionLedger(ledger);
        createSessionRecord({
          sessionId: ledger.sessionId,
          userId: ledger.userId,
          status: 'COMPLETED',
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
          Sentry.captureException(err, { tags: { feature: 'session-record-creation' } });
        });
      } catch (error: unknown) {
        const repoErr =
          error instanceof SessionCompletionRepositoryError ? error : null;
        const cause = repoErr?.cause;
        const causeCode =
          cause != null && typeof cause === 'object' && 'code' in cause &&
          typeof (cause as { code?: unknown }).code === 'string'
            ? (cause as { code: string }).code : null;
        const isDuplicate = causeCode === '23505' || causeCode === '409';

        if (isDuplicate) {
          debug.info('Duplicate idempotency key %s — already synced', key);
          persisted = { ...ledger, offlineSyncStatus: 'synced' };
        } else {
          Sentry.captureException(error, { tags: { feature: 'session-completion-ledger' } });
          enqueue({ feature: 'sessions', idempotencyKey: ledger.idempotencyKey, operation: 'CREATE', payload: { ledger } });
          persisted = { ...ledger, offlineSyncStatus: 'pending_sync' };
        }
      }
    } else {
      enqueue({ feature: 'sessions', idempotencyKey: ledger.idempotencyKey, operation: 'CREATE', payload: { ledger } });
    }

    // LAYER 3: XP / streak / progression / rewards
    const subsystemResult = await applyCompletionSubsystems({ ledger: persisted, summary });
    const finalLedger = subsystemResult.ledger;

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
    return storyViewModel;
  } catch (error) {
    releaseKeyProcessing(key);
    throw error;
  }
}
