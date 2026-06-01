import { eventBus } from '../../events';
import * as Sentry from '@sentry/react-native';
import { type SettingCategory } from './types';
import { applySettingSideEffects } from './settings-side-effects';

interface SettingsChangeEvent {
  key: string;
  value: unknown;
  previousValue?: unknown;
}
interface SettingsResetEvent {
  category?: SettingCategory;
}
export function initializeSettingsEventHandlers(): () => void {
  const changeUnsubscribe = eventBus.subscribe(
    'settings:change',
    (event: SettingsChangeEvent) => {
      handleSettingChange(event);
    },
  );
  const resetUnsubscribe = eventBus.subscribe('settings:reset', (event) => {
    handleSettingsReset(event as SettingsResetEvent);
  });
  return () => {
    changeUnsubscribe();
    resetUnsubscribe();
  };
}
function handleSettingChange(event: SettingsChangeEvent): void {
  Sentry.addBreadcrumb({
    category: 'settings',
    message: `Setting changed: ${event.key}`,
    level: 'info',
    data: {
      key: event.key,
      hasPreviousValue: event.previousValue !== undefined,
    },
  });
  applySettingSideEffects(event.key, event.value);
}
function handleSettingsReset(event: SettingsResetEvent): void {
  Sentry.addBreadcrumb({
    category: 'settings',
    message: `Settings reset: ${event.category || 'all'}`,
    level: 'warning',
  });
}
export function emitSettingChange(
  key: string,
  value: unknown,
  previousValue?: unknown,
): void {
  eventBus.publish('settings:change', { key, value, previousValue });
}
export function emitSettingsReset(category?: SettingCategory): void {
  eventBus.publish('settings:reset', { category });
}
export function trackSettingsAnalytics(
  action: 'change' | 'reset' | 'export' | 'import' | 'sync',
  metadata?: Record<string, unknown>,
): void {
  Sentry.addBreadcrumb({
    category: 'settings_analytics',
    message: `Settings action: ${action}`,
    level: 'info',
    data: metadata,
  });
}
