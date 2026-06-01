import * as Sentry from '@sentry/react-native';
import {
  NotificationPolicyEventSchema,
  NudgeSignalEventSchema,
  type NotificationPolicyEvent,
  type NudgeSignalEvent,
} from './events';

export function trackNotificationPolicyEvent(
  event: NotificationPolicyEvent,
): void {
  const parsed = NotificationPolicyEventSchema.parse(event);
  Sentry.addBreadcrumb({
    category: 'notification_policy',
    level: 'info',
    message: parsed.type,
    data: {
      nudgeType: parsed.nudgeType,
      userId: parsed.userId,
      signal: parsed.signal ?? null,
    },
  });
}

export function trackNudgeSignal(event: NudgeSignalEvent): void {
  const parsed = NudgeSignalEventSchema.parse(event);
  Sentry.addBreadcrumb({
    category: 'nudge_signal',
    level: 'info',
    message: `nudge_${parsed.signal}`,
    data: {
      nudgeType: parsed.nudgeType,
      userId: parsed.userId,
      signal: parsed.signal,
      lane: parsed.lane,
    },
  });

  if (parsed.signal === 'dismissed' || parsed.signal === 'ignored') {
    Sentry.captureMessage(
      `Nudge ${parsed.signal} — may trigger category pause`,
      {
        level: 'info',
        tags: {
          feature: 'nudge-budget',
          signal: parsed.signal,
          lane: parsed.lane,
        },
      },
    );
  }
}
