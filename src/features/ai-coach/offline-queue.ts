import { MMKV } from 'react-native-mmkv';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('coach:offline');

const offlineStorage = new MMKV({ id: 'coach-offline-queue' });
const QUEUE_KEY = 'coach_mutation_queue';
export const MAX_QUEUE_SIZE = 50;
const MAX_RETRY_ATTEMPTS = 3;

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
  const service = await import('./services/service');
  const repository = await import('./repository');

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
  const data = offlineStorage.getString(QUEUE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveQueue(queue: QueuedMutation[]): void {
  offlineStorage.set(QUEUE_KEY, JSON.stringify(queue));
}
