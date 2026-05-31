import * as Sentry from '@sentry/react-native';
import { RescueModeEventSchema, type RescueModeEvent } from './events';

export function trackRescueModeEvent(event: RescueModeEvent): void {
  const parsed = RescueModeEventSchema.parse(event);
  Sentry.addBreadcrumb({
    category: 'rescue_mode',
    level: 'info',
    message: parsed.type,
    data: { reason: parsed.reason, userId: parsed.userId },
  });
}
