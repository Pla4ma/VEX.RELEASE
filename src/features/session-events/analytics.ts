import * as Sentry from '@sentry/react-native';

import type { MidSessionEvent } from './schemas';

export function trackMidSessionEvent(event: MidSessionEvent): void {
  Sentry.addBreadcrumb({
    category: 'session-events',
    message: event.type,
    level: event.toastType === 'warning' ? 'warning' : 'info',
  });
}
