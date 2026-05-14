import * as Sentry from '@sentry/react-native';

export function trackAccountDeletionStarted(userId: string): void {
  Sentry.addBreadcrumb({ category: 'account-deletion', message: 'Account deletion started', level: 'info', data: { userId } });
}

export function trackAccountDeletionCompleted(userId: string): void {
  Sentry.addBreadcrumb({ category: 'account-deletion', message: 'Account deletion completed', level: 'info', data: { userId } });
}

export function captureAccountDeletionError(error: unknown, operation: string): void {
  Sentry.captureException(error, { tags: { feature: 'account-deletion', operation } });
}
