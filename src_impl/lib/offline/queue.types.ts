export interface ConflictResolution {
    strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual';
    resolvedData?: Record<string, unknown>;
}

export type OfflineQueueEntry = z.infer<typeof OfflineQueueEntrySchema>;
export type OfflineQueueEntryInput = Omit<OfflineQueueEntry, 'id' | 'createdAt' | 'retryCount' | 'maxRetries' | 'priority'> & {
      retryCount?: number;
      maxRetries?: number;
      priority?: 'high' | 'normal' | 'low';
    };
export type QueueProcessor = (entry: OfflineQueueEntry) => Promise<void>;
