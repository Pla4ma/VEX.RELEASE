import {
  createRuntimeMMKV,
  type RuntimeMMKV,
} from '../../../persistence/mmkv-runtime';
import { getMmkvEncryptionKeySync } from '../../../persistence/mmkv-key';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('coach:offline');

let _offlineStorage: RuntimeMMKV | null = null;
function getOfflineStorage(): RuntimeMMKV {
  if (!_offlineStorage) {
    _offlineStorage = createRuntimeMMKV({ id: 'coach-offline-queue', encryptionKey: getMmkvEncryptionKeySync() });
  }
  return _offlineStorage;
}
const QUEUE_KEY = 'coach_mutation_queue';
export const MAX_QUEUE_SIZE = 50;

export interface QueuedMutation {
  id: string;
  type:
    | 'MARK_READ'
    | 'DISMISS'
    | 'TAKE_ACTION'
    | 'SELECT_PERSONA'
    | 'ACCEPT_RECOMMENDATION';
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

export interface UseOfflineCoachResult {
  isProcessing: boolean;
  pendingCount: number;
  queueMutation: (
    mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>,
  ) => void;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
}

export interface UseOptimisticCoachActionResult {
  execute: (
    action: () => Promise<void>,
    optimisticUpdate: () => void,
    rollback: () => void,
  ) => void;
  isPending: boolean;
}

export async function processMutation(
  mutation: QueuedMutation,
  userId: string,
): Promise<void> {
  const [service, repository] = await Promise.all([
    import('../service/service'),
    import('../repository'),
  ]);

  switch (mutation.type) {
    case 'MARK_READ':
      await service.markMessageAction({
        messageId: mutation.payload.messageId as string,
        action: 'MARK_READ',
        metadata: { processedOffline: true },
      });
      break;
    case 'DISMISS':
      await service.markMessageAction({
        messageId: mutation.payload.messageId as string,
        action: 'DISMISS',
        metadata: { processedOffline: true },
      });
      break;
    case 'TAKE_ACTION':
      await service.markMessageAction({
        messageId: mutation.payload.messageId as string,
        action: mutation.payload.action as string,
        metadata: { processedOffline: true },
      });
      break;
    case 'SELECT_PERSONA':
      await service.updateCoachPreferences({
        userId,
        personaId: mutation.payload.personaId as string,
      });
      break;
    case 'ACCEPT_RECOMMENDATION':
      await repository.updateRecommendationStatus(
        mutation.payload.recommendationId as string,
        'ACCEPTED',
      );
      break;
    default:
      debug.warn('[OfflineCoach] Unknown mutation type:', mutation.type);
  }
}

export function getQueue(): QueuedMutation[] {
  const data = getOfflineStorage().getString(QUEUE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveQueue(queue: QueuedMutation[]): void {
  getOfflineStorage().set(QUEUE_KEY, JSON.stringify(queue));
}
