import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import * as service from "./service";
import { type SettingCategory } from "./types";


export function initializeSettingsEventHandlers(): () => void {
  // Listen for settings changes
  const changeUnsubscribe = eventBus.subscribe('settings:change', (event: SettingsChangeEvent) => {
    handleSettingChange(event);
  });

  // Listen for settings reset
  const resetUnsubscribe = eventBus.subscribe('settings:reset', (event) => {
    handleSettingsReset(event as SettingsResetEvent);
  });

  // Return cleanup function
  return () => {
    changeUnsubscribe();
    resetUnsubscribe();
  };
}

export function emitSettingChange(key: string, value: unknown, previousValue?: unknown): void {
  eventBus.publish('settings:change', {
    key,
    value,
    previousValue,
  });
}

export function emitSettingsReset(category?: SettingCategory): void {
  eventBus.publish('settings:reset', {
    category,
  });
}

export function trackSettingsAnalytics(action: 'change' | 'reset' | 'export' | 'import' | 'sync', metadata?: Record<string, unknown>): void {
  Sentry.addBreadcrumb({
    category: 'settings_analytics',
    message: `Settings action: ${action}`,
    level: 'info',
    data: metadata,
  });
}