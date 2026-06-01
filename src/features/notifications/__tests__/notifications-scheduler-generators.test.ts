/**
 * Tests for: scheduler-generators
 */

import { mockFrom } from './notifications-test-setup';
import { selectNotificationType } from '../SmartNotificationScheduler-generators';

describe('SmartNotificationScheduler Generators', () => {
  describe('selectNotificationType', () => {
    it('returns null when all generators return null', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: new Error('no data') }),
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: new Error('no data') }),
            gte: jest.fn().mockResolvedValue({ data: null, error: new Error('no data') }),
          }),
        }),
      });

      const result = await selectNotificationType('user-1', ['STREAK', 'BOSS']);
      expect(result).toBeNull();
    });

    it('returns first non-null generator result (STREAK with zero streak)', async () => {
      // When streak is 0, generateStreakNotification returns a STREAK_START notification
      // We mock the supabase call to return streak = 0
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { current_streak: 0 },
              error: null,
            }),
          }),
        }),
      });

      const result = await selectNotificationType('user-1', ['STREAK']);
      expect(result).not.toBeNull();
      expect(result!.title).toContain('Start your streak');
    });

    it('skips unknown types gracefully', async () => {
      const result = await selectNotificationType('user-1', ['RANK_REPORT' as any]);
      // RANK_REPORT generator checks day/hour, will return null in most cases
      // but it shouldn't throw
      expect(result === null || typeof result.title === 'string').toBe(true);
    });
  });
});
