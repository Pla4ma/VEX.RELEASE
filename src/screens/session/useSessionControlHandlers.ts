import * as Sentry from '@sentry/react-native';
import type { useActiveSessionController } from './hooks/useActiveSessionController';
import type { useStudyQuizBreak } from './hooks/useStudyQuizBreak';

interface SessionControlHandlers {
  onClearControlFailure: () => void;
  onRetryControlFailure: () => void;
  onComplete: () => void;
  onEnd: () => void;
  onPauseResume: () => void;
  onToggleMultiplierInfo: () => void;
  onResume: () => void;
  onAbandon: () => void;
}

export function useSessionControlHandlers(
  actions: ReturnType<typeof useActiveSessionController>['actions'],
  showMultiplierInfo: boolean,
  _studyQuizBreak: ReturnType<typeof useStudyQuizBreak>,
): SessionControlHandlers {
  return {
    onClearControlFailure: actions.clearControlFailure,
    onRetryControlFailure: () => {
      actions.retryControlFailure().catch((error: unknown) => {
        Sentry.captureException(error, { tags: { feature: 'session-controls' } });
      });
    },
    onComplete: () => {
      actions.handleComplete().catch((error: unknown) => {
        Sentry.captureException(error, { tags: { feature: 'session-controls' } });
      });
    },
    onEnd: () => actions.setShowInterruption(true),
    onPauseResume: () => {
      actions.handlePauseResume().catch((error: unknown) => {
        Sentry.captureException(error, { tags: { feature: 'session-controls' } });
      });
    },
    onToggleMultiplierInfo: () =>
      actions.setShowMultiplierInfo(!showMultiplierInfo),
    onResume: () => actions.setShowInterruption(false),
    onAbandon: () => {
      actions.handleAbandon().catch((error: unknown) => {
        Sentry.captureException(error, { tags: { feature: 'session-controls' } });
      });
    },
  };
}
