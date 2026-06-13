import type { DeepLinkPath } from './deep-link-types';
import type { NotificationAction } from './notification-routing-types';

export function deepLinkToNotificationAction(
  path: DeepLinkPath,
  params: Record<string, string>,
): NotificationAction {
  switch (path) {
    case 'session':
      return { type: 'start_session', payload: { presetId: params.presetId } };
    case 'boss':
      return { type: 'view_boss' };
    case 'profile':
      return { type: 'view_profile', payload: { userId: params.userId } };
    case 'study':
      return {
        type: 'start_session',
        payload: { presetMode: 'STUDY', source: 'content-study' },
      };
    case 'settings':
      return { type: 'view_progress' };
    case 'coach':
      return { type: 'open_coach' };
    default:
      return { type: 'custom', payload: { screen: path, params } };
  }
}
