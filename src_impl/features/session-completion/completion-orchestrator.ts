import * as Sentry from '@sentry/react-native';
import { z } from 'zod';
import { eventBus } from '../../events';
import { FocusIdentityService } from '../focus-identity/FocusIdentityEngine';
import { getConnectionState } from '../../lib/repository/base';
import { enqueue } from '../../lib/offline/queue';
import { getProgressionService } from '../../progression/ProgressionService';
import { getRewardService } from '../../rewards/RewardService';
import { SessionSummarySchema } from '../../session/types';
import { getStreakService } from '../../streaks/StreakService';
import { useSessionUIStore } from '../../store/session-state';
import { createDebugger } from '../../utils/debug';
import { buildCompletionLedger } from './ledger-service';
import { createCompletionLedger, getCompletionLedgerByIdempotencyKey } from './repository';
import { buildPostSessionStoryViewModel } from './story-view-model-service';

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

const processedIdempotencyKeys = new Set<string>();
let initialized = false;

export async function orchestrateSessionCompletion(
  event: SessionCompletedEvent,
): Promise<void> {
  const parsed = SessionCompletedEventSchema.parse(event);
  const summary = SessionSummarySchema.parse(parsed.summary);
  const isOnline = getConnectionState() !== 'offline';
  const ledger = buildCompletionLedger({
    completedAt: parsed.timestamp ?? Date.now(),
    offlineSyncStatus: isOnline ? 'synced' : 'pending_sync',
    sessionId: parsed.sessionId,
    summary,
    userId: parsed.userId,
  });
  const key = ledger.idempotencyKey;

  if (processedIdempotencyKeys.has(key)) {
    return;
  }
  const existing = await getCompletionLedgerByIdempotencyKey(key);
  if (existing) {
    processedIdempotencyKeys.add(key);
    useSessionUIStore.getState().setCompletionSyncState({
      ledgerId: existing.ledgerId,
      message: null,
      repairCtaLabel: null,
      status: 'synced',
      updatedAt: Date.now(),
    });
    return;
  }

  let persisted = ledger;
  if (isOnline) {
    try {
      persisted = await createCompletionLedger(ledger);
    } catch (error) {
      Sentry.captureException(error, { tags: { feature: 'session-completion-ledger' } });
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

  const degradedSystems: string[] = [];
  const sessionUIStore = useSessionUIStore.getState();
  const run = async (label: string, fn: () => Promise<void>): Promise<void> => {
    try {
      await fn();
    } catch (error) {
      degradedSystems.push(label);
      Sentry.captureException(error, { tags: { feature: 'session-completion', subsystem: label } });
    }
  };

  await run('progression', async () => {
    await getProgressionService(parsed.userId).addXP(persisted.xpDelta, 'SESSION_COMPLETE', {
      sessionId: parsed.sessionId,
    });
  });
  await run('streak', async () => {
    await getStreakService(parsed.userId).recordSession();
  });
  await run('rewards', async () => {
    await getRewardService(parsed.userId).grantReward(
      'CURRENCY',
      'SESSION_COMPLETE',
      { baseAmount: Math.max(1, Math.floor(persisted.xpDelta / 10)) },
      { exactAmount: Math.max(1, Math.floor(persisted.xpDelta / 10)), sessionId: parsed.sessionId },
    );
  });
  await run('focus-identity', async () => {
    const service = new FocusIdentityService(parsed.userId);
    await service.updateScore('SESSION_COMPLETE', {
      grade: persisted.grade,
      streakLength: persisted.streakResult.newDays,
    });
  });

  const storyViewModel = buildPostSessionStoryViewModel({
    degradedWarnings: degradedSystems,
    ledger: persisted,
    summary,
  });

  if (storyViewModel.pendingSync) {
    sessionUIStore.setCompletionSyncState({
      ledgerId: persisted.ledgerId,
      message: 'One session is saved offline. It will sync when you reconnect.',
      repairCtaLabel: null,
      status: 'pending_sync',
      updatedAt: Date.now(),
    });
  } else if (degradedSystems.length > 0) {
    sessionUIStore.setCompletionSyncState({
      ledgerId: persisted.ledgerId,
      message: 'Session completion synced, but some rewards need repair.',
      repairCtaLabel: 'Repair now',
      status: 'failed_sync',
      updatedAt: Date.now(),
    });
  } else {
    sessionUIStore.setCompletionSyncState({
      ledgerId: persisted.ledgerId,
      message: null,
      repairCtaLabel: null,
      status: 'synced',
      updatedAt: Date.now(),
    });
  }

  processedIdempotencyKeys.add(key);
  debug.info('Session completion orchestrated for %s', parsed.sessionId);
}

export function initializeSessionCompletionOrchestrator(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  eventBus.subscribe('session:completed', (rawEvent) => {
    const parsed = SessionCompletedEventSchema.safeParse(rawEvent);
    if (!parsed.success) {
      return;
    }
    void orchestrateSessionCompletion(parsed.data);
  });
}
