import {
  NotificationSentEvent,
  NotificationDeliveredEvent,
  NotificationReadEvent,
  NotificationClickedEvent,
  NotificationEventType,
} from './types';

export function validateNotificationEvent(
  event: NotificationEventType,
): boolean {
  if (!event.id || !event.userId || !event.timestamp) {
    return false;
  }
  if (!event.type || !event.data || !event.metadata) {
    return false;
  }
  switch (event.type) {
    case 'notification_sent':
      return validateNotificationSentEvent(event as NotificationSentEvent);
    case 'notification_delivered':
      return validateNotificationDeliveredEvent(
        event as NotificationDeliveredEvent,
      );
    case 'notification_read':
      return validateNotificationReadEvent(event as NotificationReadEvent);
    case 'notification_clicked':
      return validateNotificationClickedEvent(
        event as NotificationClickedEvent,
      );
    default:
      return true;
  }
}
function validateNotificationSentEvent(event: NotificationSentEvent): boolean {
  const { data } = event;
  return !!(
    data.notificationId &&
    data.type &&
    data.category &&
    data.priority &&
    data.channels &&
    data.template &&
    data.personalization
  );
}
function validateNotificationDeliveredEvent(
  event: NotificationDeliveredEvent,
): boolean {
  const { data } = event;
  return !!(
    data.notificationId &&
    data.channel &&
    data.deliveryTime &&
    typeof data.latency === 'number' &&
    data.provider
  );
}
function validateNotificationReadEvent(event: NotificationReadEvent): boolean {
  const { data } = event;
  return !!(
    data.notificationId &&
    data.readAt &&
    typeof data.readTimeframe === 'number' &&
    data.readMethod &&
    data.readContext
  );
}
function validateNotificationClickedEvent(
  event: NotificationClickedEvent,
): boolean {
  const { data } = event;
  return !!(
    data.notificationId &&
    data.clickedAt &&
    typeof data.clickTimeframe === 'number' &&
    data.action &&
    data.clickContext
  );
}
export function serializeNotificationEvent(
  event: NotificationEventType,
): string {
  return JSON.stringify({ ...event, timestamp: event.timestamp.toISOString() });
}
export function deserializeNotificationEvent(
  data: string,
): NotificationEventType {
  const parsed = JSON.parse(data);
  return { ...parsed, timestamp: new Date(parsed.timestamp) };
}
