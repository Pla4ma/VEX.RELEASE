import { isPublicV1Hidden } from '../liveops-config/public-v1-feature-map';
import type { NotificationContentType } from './SmartNotificationScheduler';

const HIDDEN_V1_CONTENT_TYPES: ReadonlyArray<NotificationContentType> = ['RANK_REPORT'];

export function filterV1ContentTypes(
  types: NotificationContentType[],
): NotificationContentType[] {
  return types.filter((t) => !HIDDEN_V1_CONTENT_TYPES.includes(t));
}

export function getV1DefaultContentTypes(): NotificationContentType[] {
  return filterV1ContentTypes(['STREAK', 'BOSS', 'POSITIVE']);
}

export function isV1HiddenContentType(type: NotificationContentType): boolean {
  return HIDDEN_V1_CONTENT_TYPES.includes(type);
}

export const V1_FILTER_COMMENT = 'Public v1: use filterV1ContentTypes() when scheduling. Pre-route protection is in useNotificationNavigation.ts.';
