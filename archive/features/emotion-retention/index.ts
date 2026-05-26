import * as Sentry from '@sentry/react-native';
import { eventBus } from '../../events';
import { getAvailabilityFor } from '../liveops-config/feature-access-store';

export function initializeEmotionRetention(): () => void {
  const availability = getAvailabilityFor('ai_coach_basic');
  if (!availability.canSubscribeToEvents) {
    return () => {};
  }

  return eventBus.subscribe('session:completed', (event) => {
    Sentry.addBreadcrumb({
      category: 'emotion-retention',
      data: { completedAt: event.timestamp, sessionId: event.sessionId },
      level: 'info', message: 'Session completion reached emotion retention',
    });
  });
}

export type { RetentionIntervention } from './EmotionRetentionEngine';
