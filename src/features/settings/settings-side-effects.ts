import * as Sentry from '@sentry/react-native';

export function applySettingSideEffects(key: string, value: unknown): void {
  if (key.startsWith('appearance.')) {
    applyAppearanceSideEffect(key, value);
  }
  if (key.startsWith('notifications.')) {
    applyNotificationSideEffect(key, value);
  }
  if (key.startsWith('coach.')) {
    applyCoachSideEffect(key, value);
  }
  if (key.startsWith('privacy.')) {
    applyPrivacySideEffect(key, value);
  }
}
function applyAppearanceSideEffect(key: string, value: unknown): void {
  switch (key) {
    case 'appearance.theme':
      Sentry.addBreadcrumb({
        category: 'settings',
        message: `Theme changed to: ${value}`,
        level: 'info',
      });
      break;
    case 'appearance.fontScale':
      if (typeof value === 'number') {
        Sentry.addBreadcrumb({
          category: 'settings',
          message: `Font scale changed to: ${value}`,
          level: 'info',
        });
      }
      break;
    case 'appearance.reduceMotion':
      Sentry.addBreadcrumb({
        category: 'settings',
        message: `Reduce motion: ${value}`,
        level: 'info',
      });
      break;
  }
}
function applyNotificationSideEffect(key: string, value: unknown): void {
  switch (key) {
    case 'notifications.push.enabled':
      if (value === true) {
        Sentry.addBreadcrumb({
          category: 'settings',
          message: 'Push notifications enabled',
          level: 'info',
        });
      } else {
        Sentry.addBreadcrumb({
          category: 'settings',
          message: 'Push notifications disabled',
          level: 'info',
        });
      }
      break;
    case 'notifications.push.quietHoursStart':
    case 'notifications.push.quietHoursEnd':
      Sentry.addBreadcrumb({
        category: 'settings',
        message: `Quiet hours updated: ${key}`,
        level: 'info',
      });
      break;
  }
}
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
function applyPrivacySideEffect(key: string, value: unknown): void {
  switch (key) {
    case 'privacy.analyticsOptOut':
      if (value === true) {
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
