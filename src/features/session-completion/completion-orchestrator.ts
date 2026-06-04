import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

import { getConnectionState } from '../../lib/repository/base';
import { enqueue } from '../../lib/offline/queue';
import { SessionSummarySchema } from '../../session/types';
import { createDebugger } from '../../utils/debug';
import { invalidateCompletionQueries } from './completion-query-invalidation';
import { setCompletionSyncState } from './completion-sync-state';
import { applyCompletionSubsystems } from './completion-subsystems';
import { buildCompletionLedger } from './ledger-service';
import { resolveCompletionPersonalBest } from './personal-best-integration';
import { applyCompletionSideEffects } from './completion-side-effects';
import { integrateCompletionPersonalization } from './completion-personalization-integration';
import type { CompletionPersonalizationResult } from './schemas';
import {
  createCompletionLedger,
  getCompletionLedgerByIdempotencyKey,
} from './repository';
import { buildPostSessionStoryViewModel } from './story-view-model-service';
import type { PostSessionStoryViewModel } from './story-view-model-service';
import {
  createSessionRecord,
  countCompletedSessions,
} from '../session-history/repository';
import {
  beginKeyProcessing,
  markKeyProcessed,
  releaseKeyProcessing,
} from './idempotency';
import { getFocusProfile } from '../focus-profile/service';
import { resolveInitialLane } from '../lane-engine/service';

export { initializeSessionCompletionOrchestrator } from './completion-orchestrator-init';

const debug = createDebugger('session-completion:orchestrator');

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
      return buildPostSessionStoryViewModel({
        degradedWarnings: existing.degradedSystems,
        ledger: existing,
        summary,
      });
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
          Sentry.captureException(err, {
            tags: { feature: 'session-record-creation' },
          });
        });
      } catch (error) {
        Sentry.captureException(error, {
          tags: { feature: 'session-completion-ledger' },
        });
        enqueue({
          feature: 'sessions',
          idempotencyKey: ledger.idempotencyKey,
          operation: 'CREATE',
          payload: { ledger },
        });
        persisted = { ...ledger, offlineSyncStatus: 'pending_sync' };
      }
    } else {
      enqueue({
        feature: 'sessions',
        idempotencyKey: ledger.idempotencyKey,
        operation: 'CREATE',
        payload: { ledger },
      });
    }

    // LAYER 3: XP / streak / progression / rewards — required for user payoff
    const subsystemResult = await applyCompletionSubsystems({
      ledger: persisted,
      summary,
    });
    const finalLedger = subsystemResult.ledger;
    const degradedSystems = subsystemResult.degradedSystems;
    setCompletionSyncState(
      finalLedger.ledgerId,
      degradedSystems,
      finalLedger.offlineSyncStatus === 'pending_sync',
    );
    const personalBest = await resolveCompletionPersonalBest(
      parsed.userId,
      finalLedger,
      summary,
    );

    // LAYER 3.5: Personalization
    let personalizationResult: CompletionPersonalizationResult | null = null;
    try {
      const sessionCount = await countCompletedSessions(parsed.userId).catch(
        () => 0,
      );
      const focusProfile = await getFocusProfile(parsed.userId).catch(
        () => null,
      );
      const laneProfile =
        focusProfile?.laneProfile ||
        resolveInitialLane({ observedAt: Date.now() });
      personalizationResult = await integrateCompletionPersonalization({
        deletedMemoryIds: [],
        hiddenFeatureKeys: [
          'shop',
          'inventory',
          'battle_pass',
          'premium_currency',
          'wagers',
        ],
        isComeback: summary.sessionMode === 'RECOVERY',
        isPersonalBest: personalBest.isPersonalBest,
        laneProfile,
        ledger: finalLedger,
        sessionCount,
        summary,
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'completion-personalization' },
      });
    }

    const storyViewModel = await applyCompletionSideEffects({
      degradedSystems,
      finalLedger,
      isPersonalBest: personalBest.isPersonalBest,
      personalizationResult,
      sessionId: parsed.sessionId,
      summary,
      userId: parsed.userId,
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
