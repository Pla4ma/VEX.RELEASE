import { ARCHIVED } from '../final-release-classification';
import { buildFeatureAccess } from '../feature-access';
import { isNotificationTypeFilterable } from '../../../screens/notifications/NotificationScreenConfig';
import type { NotificationType } from '../../../screens/notifications/NotificationScreenConfig';

describe('Classification — archived features cannot notify', () => {
  it('no archived entry has notificationAllowed=true', () => {
    for (const entry of ARCHIVED) {
      expect(entry.notificationAllowed).toBe(false);
    }
  });

  it('SQUAD and RIVAL notification types blocked (archived in classification)', () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 0 });
    expect(isNotificationTypeFilterable('SQUAD' as NotificationType, features)).toBe(false);
    expect(isNotificationTypeFilterable('RIVAL' as NotificationType, features)).toBe(false);
  });

  it('archived noti types blocked at all session counts', () => {
    for (const sessions of [0, 10, 999]) {
      const { features } = buildFeatureAccess({ totalCompletedSessions: sessions });
      expect(isNotificationTypeFilterable('SQUAD' as NotificationType, features)).toBe(false);
      expect(isNotificationTypeFilterable('RIVAL' as NotificationType, features)).toBe(false);
    }
  });

  it('active notification types still available', () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 20 });
    expect(isNotificationTypeFilterable('ACHIEVEMENT' as NotificationType, features)).toBe(true);
    expect(isNotificationTypeFilterable('STREAK_RISK' as NotificationType, features)).toBe(true);
  });
});
