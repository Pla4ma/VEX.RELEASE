import type { OfflineQueueEntry } from '../../lib/offline/queue';

type Processor = (entry: OfflineQueueEntry) => Promise<void>;
let processor: Processor | null = null;

export function registerSessionCompletionProcessors(nextProcessor: Processor): void {
  processor = nextProcessor;
}

export async function processSessionCompletionOfflineEntry(
  entry: OfflineQueueEntry,
): Promise<void> {
  if (processor) {
    await processor(entry);
  }
}
