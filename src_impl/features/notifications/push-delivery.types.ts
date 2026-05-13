export interface PushNotificationPayload {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    priority?: NotificationPriority;
    badge?: number;
    sound?: string | boolean;
    vibrate?: boolean;
}

export interface ScheduledNotification {
    identifier: string;
    trigger: Notifications.NotificationTriggerInput;
    payload: PushNotificationPayload;
}

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';
