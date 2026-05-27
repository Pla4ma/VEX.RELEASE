import { eventBus } from "../../events";

type TrackFunction = (eventName: string, properties: Record<string, unknown>) => void;

export function subscribeErrorEventListeners(
  track: TrackFunction,
): void {
  eventBus.subscribe("session:failed", (data) => {
    if (!data) {
      return;
    }
    track("session_error", {
      sessionId: data.sessionId,
      userId: data.userId,
      error: data.error,
      canRecover: data.canRecover,
    });
  });

  eventBus.subscribe("session:sync:failed", (data) => {
    if (!data) {
      return;
    }
    track("sync_failure", {
      sessionId: data.sessionId,
      userId: data.userId,
      error: data.error,
      willRetry: data.willRetry,
    });
  });
}
