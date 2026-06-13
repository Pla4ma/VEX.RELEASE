import { addBreadcrumb } from '../../config/sentry';
import { TodaySystemEventSchema, type TodaySystemEvent } from './events';

export function trackTodaySystemEvent(event: TodaySystemEvent): void {
  const parsed = TodaySystemEventSchema.parse(event);
  addBreadcrumb(parsed.type, 'today_system', {
    section: parsed.section,
    userId: parsed.userId,
  });
}
