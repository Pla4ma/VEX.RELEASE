import { createDebugger } from '../utils/debug';

import { deepLinkToNotificationAction } from './notification-deep-link';
import { isValidNotificationAction, routeNotificationAction } from './notification-navigator';

export type {
  NotificationAction,
  NotificationActionType,
  NotificationRouteResult,
} from './notification-routing-types';

const debug = createDebugger('navigation:notifications');

export { deepLinkToNotificationAction, isValidNotificationAction };

export function routeNotificationActionSafe(
  ...args: Parameters<typeof routeNotificationAction>
) {
  try {
    return routeNotificationAction(...args);
  } catch (error) {
    debug.error(
      'Failed to route notification action',
      error instanceof Error ? error : undefined,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export { routeNotificationActionSafe as routeNotificationAction };
