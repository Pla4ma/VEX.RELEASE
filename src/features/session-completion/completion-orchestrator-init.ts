import * as Sentry from '@sentry/react-native';

import { eventBus } from '../../events/EventBus';
import { createDebugger } from '../../utils/debug';

let isSessionCompletedSubscribed = false;
let _unsubscribeSessionCompleted: (() => void) | null = null;
const debug = createDebugger('session-completion:init');

export function initializeSessionCompletionOrchestrator(): void {
  if (isSessionCompletedSubscribed) {
    return;
  }

  isSessionCompletedSubscribed = true;
  _unsubscribeSessionCompleted = eventBus.subscribe('session:completed', (event) => {
    void import('./completion-orchestrator')
      .then((module) =>
        module.orchestrateSessionCompletion({
          sessionId: event.sessionId,
          summary: event.summary,
          timestamp: event.timestamp,
          userId: event.userId,
        }),
      )
      .catch((error: unknown) => {
        debug.warn('Session completion orchestration failed');
        Sentry.captureException(error, {
          tags: {
            feature: 'session-completion',
            operation: 'orchestrate-session-completed-event',
          },
        });
      });
  });
}
