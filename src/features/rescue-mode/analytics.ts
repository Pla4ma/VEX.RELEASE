import { addBreadcrumb } from '../../config/sentry';
import { RescueModeEventSchema, type RescueModeEvent } from './events';

export function trackRescueModeEvent(event: RescueModeEvent): void {
  const parsed = RescueModeEventSchema.parse(event);
  addBreadcrumb(parsed.type, 'rescue_mode', {
    reason: parsed.reason,
    userId: parsed.userId,
  });
}
