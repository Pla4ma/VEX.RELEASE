import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { getSessionOrchestrator } from './SessionOrchestrator';
import { cancelPendingBroadcastCleanups } from '../services/realtimeSubscriptions';
import { createDebugger } from '../utils/debug';
import { captureSilentFailure } from '../utils/silent-failure';

const debug = createDebugger('session:appstate');

/**
 * MEM-004: Handle app state changes during active sessions.
 * Tracks background/foreground transitions and logs long background durations.
 * The session timer handles its own pause/resume via AppState awareness.
 */
export function useSessionAppState(): void {
  const backgroundTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        try {
          if (nextAppState === 'background') {
            backgroundTimeRef.current = Date.now();
            cancelPendingBroadcastCleanups();
            debug.info('[SessionAppState] App backgrounded, noting timestamp');
          } else if (nextAppState === 'active') {
            const bgDuration =
              backgroundTimeRef.current != null
                ? Date.now() - backgroundTimeRef.current
                : 0;
            backgroundTimeRef.current = null;
            debug.info(
              `[SessionAppState] App foregrounded after ${bgDuration}ms background`,
            );

            // If backgrounded for > 5 minutes, log a Sentry breadcrumb
            if (bgDuration > 5 * 60 * 1000) {
              try {
                const orchestrator = getSessionOrchestrator();
                captureSilentFailure(
                  new Error(
                    `Session backgrounded for ${(bgDuration / 60000).toFixed(1)} minutes (session: ${orchestrator.session?.id ?? 'unknown'})`,
                  ),
                  {
                    feature: 'session',
                    operation: 'app-state-background',
                    type: 'data',
                  },
                );
              } catch {
                captureSilentFailure(
                  new Error(
                    `App backgrounded for ${(bgDuration / 60000).toFixed(1)} minutes`,
                  ),
                  {
                    feature: 'session',
                    operation: 'app-state-background',
                    type: 'data',
                  },
                );
              }
            }
          }
        } catch (error) {
          debug.error(
            '[SessionAppState] Error handling app state change:',
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);
}
