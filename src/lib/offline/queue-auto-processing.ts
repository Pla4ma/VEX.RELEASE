import type { ConnectionState } from '../repository/retry';

export interface QueueAutoProcessorDependencies {
  getConnectionState: () => ConnectionState;
  hasEntries: () => boolean;
  processQueue: () => Promise<void>;
  subscribeToConnectionChanges: (callback: (state: ConnectionState) => void) => () => void;
}

export function createQueueAutoProcessor(
  dependencies: QueueAutoProcessorDependencies,
): { start: (intervalMs?: number) => void; stop: () => void } {
  let intervalId: ReturnType<typeof setInterval> | undefined;
  let unsubscribe: (() => void) | undefined;
  let enabled = false;

  const processIfOnline = (): void => {
    if (dependencies.getConnectionState() === 'online' && dependencies.hasEntries()) {
      void dependencies.processQueue();
    }
  };

  return {
    start(intervalMs = 5000): void {
      if (enabled) {return;}
      enabled = true;
      processIfOnline();
      unsubscribe = dependencies.subscribeToConnectionChanges((state) => {
        if (state === 'online') {processIfOnline();}
      });
      intervalId = setInterval(processIfOnline, intervalMs);
    },
    stop(): void {
      enabled = false;
      unsubscribe?.();
      unsubscribe = undefined;
      clearInterval(intervalId);
      intervalId = undefined;
    },
  };
}
