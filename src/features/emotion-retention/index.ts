import * as Sentry from '@sentry/react-native';

import { eventBus } from '../../events';

export function initializeEmotionRetention(): () => void {
  return eventBus.subscribe('session:completed', (event) => {
    Sentry.addBreadcrumb({
      category: 'emotion-retention',
      data: {
        completedAt: event.timestamp,
        sessionId: event.sessionId,
      },
      level: 'info',
      message: 'Session completion reached emotion retention',
    });
  });
}

export type { RetentionIntervention } from './EmotionRetentionEngine';
