/**
 * Settings Events
 * Event handlers and subscriptions for settings changes
 */

import { eventBus } from '../../events';
import * as Sentry from '@sentry/react-native';
import * as service from './service';
import { type SettingCategory } from './types';

// Settings event types
interface SettingsChangeEvent {
  key: string;
  value: unknown;
  previousValue?: unknown;
}

interface SettingsResetEvent {
  category?: SettingCategory;
}

/**
 * Initialize settings event handlers
 */
export function initializeSettingsEventHandlers(): () => void {
  // Listen for settings changes
  const changeUnsubscribe = eventBus.subscribe(
    'settings:change',
    (event: SettingsChangeEvent) => {
      handleSettingChange(event);
    }
  );

  // Listen for settings reset
  const resetUnsubscribe = eventBus.subscribe(
    'settings:reset',
    (event) => {
      handleSettingsReset(event as SettingsResetEvent);
    }
  );

  // Return cleanup function
  return () => {
    changeUnsubscribe();
    resetUnsubscribe();
  };
}

/**
 * Handle a setting change event
 */
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

  // Apply side effects based on setting key
  applySettingSideEffects(event.key, event.value);
}

/**
 * Handle settings reset event
 */
function handleSettingsReset(event: SettingsResetEvent): void {
  Sentry.addBreadcrumb({
    category: 'settings',
    message: `Settings reset: ${event.category || 'all'}`,
    level: 'warning',
  });
}

/**
 * Apply side effects when certain settings change
 */
function applySettingSideEffects(key: string, value: unknown): void {
  // Appearance settings
  if (key.startsWith('appearance.')) {
    applyAppearanceSideEffect(key, value);
  }

  // Notification settings
  if (key.startsWith('notifications.')) {
    applyNotificationSideEffect(key, value);
  }

  // Coach settings
  if (key.startsWith('coach.')) {
    applyCoachSideEffect(key, value);
  }

  // Privacy settings
  if (key.startsWith('privacy.')) {
    applyPrivacySideEffect(key, value);
  }
}

/**
 * Apply appearance-related side effects
 */
function applyAppearanceSideEffect(key: string, value: unknown): void {
  switch (key) {
    case 'appearance.theme':
      // Theme change - could trigger re-render or native module call
      Sentry.addBreadcrumb({
        category: 'settings',
        message: `Theme changed to: ${value}`,
        level: 'info',
      });
      break;

    case 'appearance.fontScale':
      // Font scale change
      if (typeof value === 'number') {
        // Could apply to React Native's accessibility settings
        Sentry.addBreadcrumb({
          category: 'settings',
          message: `Font scale changed to: ${value}`,
          level: 'info',
        });
      }
      break;

    case 'appearance.reduceMotion':
      // Motion preference change
      Sentry.addBreadcrumb({
        category: 'settings',
        message: `Reduce motion: ${value}`,
        level: 'info',
      });
      break;
  }
}

/**
 * Apply notification-related side effects
 */
function applyNotificationSideEffect(key: string, value: unknown): void {
  switch (key) {
    case 'notifications.push.enabled':
      if (value === true) {
        // Could register for push notifications
        Sentry.addBreadcrumb({
          category: 'settings',
          message: 'Push notifications enabled',
          level: 'info',
        });
      } else {
        // Could unregister from push notifications
        Sentry.addBreadcrumb({
          category: 'settings',
          message: 'Push notifications disabled',
          level: 'info',
        });
      }
      break;

    case 'notifications.push.quietHoursStart':
    case 'notifications.push.quietHoursEnd':
      // Quiet hours change
      Sentry.addBreadcrumb({
        category: 'settings',
        message: `Quiet hours updated: ${key}`,
        level: 'info',
      });
      break;
  }
}

/**
 * Apply coach-related side effects
 */
function applyCoachSideEffect(key: string, value: unknown): void {
  switch (key) {
    case 'coach.enabled':
      if (value === true) {
        Sentry.addBreadcrumb({
          category: 'settings',
          message: 'Coach enabled',
          level: 'info',
        });
      } else {
        Sentry.addBreadcrumb({
          category: 'settings',
          message: 'Coach disabled',
          level: 'info',
        });
      }
      break;

    case 'coach.personality':
      Sentry.addBreadcrumb({
        category: 'settings',
        message: `Coach personality changed to: ${value}`,
        level: 'info',
      });
      break;

    case 'coach.quietHours.enabled':
    case 'coach.quietHours.start':
    case 'coach.quietHours.end':
      Sentry.addBreadcrumb({
        category: 'settings',
        message: 'Coach quiet hours updated',
        level: 'info',
      });
      break;
  }
}

/**
 * Apply privacy-related side effects
 */
function applyPrivacySideEffect(key: string, value: unknown): void {
  switch (key) {
    case 'privacy.analyticsOptOut':
      if (value === true) {
        // Disable analytics tracking
        Sentry.addBreadcrumb({
          category: 'settings',
          message: 'Analytics opted out',
          level: 'warning',
        });
      } else {
        Sentry.addBreadcrumb({
          category: 'settings',
          message: 'Analytics opted in',
          level: 'info',
        });
      }
      break;

    case 'privacy.allowDataAnalysis':
      Sentry.addBreadcrumb({
        category: 'settings',
        message: `Data analysis: ${value ? 'enabled' : 'disabled'}`,
        level: 'info',
      });
      break;

    case 'privacy.profileVisibility':
      Sentry.addBreadcrumb({
        category: 'settings',
        message: `Profile visibility: ${value}`,
        level: 'info',
      });
      break;
  }
}

/**
 * Emit a settings change event
 */
export function emitSettingChange(
  key: string,
  value: unknown,
  previousValue?: unknown
): void {
  eventBus.publish('settings:change', {
    key,
    value,
    previousValue,
  });
}

/**
 * Emit a settings reset event
 */
export function emitSettingsReset(category?: SettingCategory): void {
  eventBus.publish('settings:reset', {
    category,
  });
}

/**
 * Track settings analytics
 */
export function trackSettingsAnalytics(
  action: 'change' | 'reset' | 'export' | 'import' | 'sync',
  metadata?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    category: 'settings_analytics',
    message: `Settings action: ${action}`,
    level: 'info',
    data: metadata,
  });
}
