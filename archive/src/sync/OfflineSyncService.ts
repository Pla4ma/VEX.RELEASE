import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

import { eventBus } from '../events';
import { getDefaultStorageAdapter } from '../persistence/MMKVStorageAdapter';
import { reactToPost, createPost } from '../social/SocialService';
import { createDebugger } from '../utils/debug';
import { feedCompanion } from '../features/companion/service';

const debug = createDebugger('sync:offline');
const storage = getDefaultStorageAdapter();
const STORAGE_KEY = 'sync:offlineQueue';
const operationTypeSchema = z.enum([
  'session_save',
  'reward_claim',
  'companion_feed',
  'reaction_add',
  'post_create',
]);
const syncOperationSchema = z.object({
  id: z.string(),
  type: operationTypeSchema,
  payload: z.record(z.unknown()),
  createdAt: z.number(),
  retryCount: z.number().min(0),
  maxRetries: z.literal(3),
});

export type SyncOperation = z.infer<typeof syncOperationSchema>;

function isNetworkError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();
  return ['network', 'fetch', 'socket', 'offline', 'timed out'].some((token) =>
    message.includes(token),
  );
}

async function readQueue(): Promise<SyncOperation[]> {
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) {return [];}
  return z.array(syncOperationSchema).parse(JSON.parse(raw));
}

async function writeQueue(queue: SyncOperation[]): Promise<void> {
  await storage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

async function processOperation(operation: SyncOperation): Promise<void> {
  switch (operation.type) {
    case 'companion_feed':
      await feedCompanion(z.string().parse(operation.payload.userId), {
        skipSyncEnqueue: true,
      });
      return;
    case 'reaction_add':
      await reactToPost(
        z.string().parse(operation.payload.userId),
        z.string().parse(operation.payload.postId),
        z
          .enum(['fire', 'strong', 'clap', 'mind_blown'])
          .parse(operation.payload.reaction),
      );
      return;
    case 'post_create':
      await createPost(
        z.string().parse(operation.payload.userId),
        z
          .enum([
            'session_complete',
            'level_up',
            'streak_milestone',
            'achievement',
            'duel_result',
            'boss_defeat',
          ])
          .parse(operation.payload.type),
        z.string().parse(operation.payload.content),
        z.record(z.unknown()).parse(operation.payload.metadata ?? {}),
      );
      return;
    case 'reward_claim':
      eventBus.publish('reward:claimed', {
        rewardId: z.string().parse(operation.payload.rewardId),
        userId: z.string().parse(operation.payload.userId),
        claimedAt: Date.now(),
        actualValue: z.number().parse(operation.payload.actualValue ?? 0),
        appliedBoosts: z
          .array(z.string())
          .parse(operation.payload.appliedBoosts ?? []),
      });
      return;
    case 'session_save':
      eventBus.publish('session:sync:completed', {
        sessionId: z.string().parse(operation.payload.sessionId),
        userId: z.string().parse(operation.payload.userId),
        timestamp: Date.now(),
      });
  }
}

export async function enqueue(
  type: SyncOperation['type'],
  payload: Record<string, unknown>,
): Promise<SyncOperation> {
  const queue = await readQueue();
  const operation = syncOperationSchema.parse({
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    type,
    payload,
    createdAt: Date.now(),
    retryCount: 0,
    maxRetries: 3,
  });
  queue.push(operation);
  await writeQueue(queue);
  return operation;
}

export async function getQueueSize(): Promise<number> {
  return (await readQueue()).length;
}

export async function processQueue(): Promise<void> {
  const queue = await readQueue();
  let synced = 0;
  let failed = 0;
  const remaining: SyncOperation[] = [];
  for (const operation of queue) {
    try {
      const delay = Math.min(1000 * 2 ** operation.retryCount, 4000);
      if (operation.retryCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      await processOperation(operation);
      synced += 1;
    } catch (error) {
      failed += 1;
      const next: SyncOperation = {
        ...operation,
        retryCount: operation.retryCount + 1,
      };
      if (next.retryCount >= next.maxRetries || !isNetworkError(error)) {
        eventBus.publish('sync:operation_failed', {
          operation: next,
          timestamp: Date.now(),
        });
        Sentry.captureException(error, {
          tags: { feature: 'offline-sync', type: next.type },
        });
      } else {
        remaining.push(next);
      }
    }
  }
  await writeQueue(remaining);
  debug.info('Offline sync processed', {
    synced,
    failed,
    remaining: remaining.length,
  });
  eventBus.publish('network:sync:complete', { synced, failed });
}
