import type { NotificationPayload } from './session-notification-types';

export class NotificationScheduler {
  private scheduledNotifications: Map<string, ReturnType<typeof setTimeout>> = new Map();

  schedule(
    id: string,
    payload: NotificationPayload,
    timestamp: number,
    onDispatch: (payload: NotificationPayload) => void,
  ): void {
    const delay = timestamp - Date.now();
    if (delay <= 0) {
      onDispatch(payload);
      return;
    }
    const timeoutId = setTimeout(() => {
      onDispatch(payload);
      this.scheduledNotifications.delete(id);
    }, delay);
    const existing = this.scheduledNotifications.get(id);
    if (existing) {clearTimeout(existing);}
    this.scheduledNotifications.set(id, timeoutId);
  }

  cancelByPrefixes(prefixes: string[]): void {
    for (const [key, timeoutId] of this.scheduledNotifications) {
      if (prefixes.some((p) => key.startsWith(p))) {
        clearTimeout(timeoutId);
        this.scheduledNotifications.delete(key);
      }
    }
  }

  clearAll(): void {
    for (const [, timeoutId] of this.scheduledNotifications) {
      clearTimeout(timeoutId);
    }
    this.scheduledNotifications.clear();
  }
}
