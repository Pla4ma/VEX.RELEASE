import * as Sentry from '@sentry/react-native';
import { NotificationPolicyEventSchema, type NotificationPolicyEvent } from './events';

export function trackNotificationPolicyEvent(event: NotificationPolicyEvent): void {
  const parsed = NotificationPolicyEventSchema.parse(event);
  Sentry.addBreadcrumb({
    category: 'notification_policy',
    level: 'info',
    message: parsed.type,
    data: { nudgeType: parsed.nudgeType, userId: parsed.userId },
  });
}
