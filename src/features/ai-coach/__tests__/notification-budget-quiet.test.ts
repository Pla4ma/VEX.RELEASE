import { beforeEach, describe, expect, it } from '@jest/globals';
import {
  canSendNotification,
  clearBudgetStore,
  createMockNotificationBudget,
  createMockNotificationRequest,
  resetDailyBudget,
} from '../notification/notification-budget';

function mockCurrentHour(hour: number): void {
  const date = new Date('2026-05-07T00:00:00.000Z');
  date.setHours(hour, 0, 0, 0);
  jest.useFakeTimers();
  jest.setSystemTime(date);
}

describe('Notification budget quiet hours and suppression', () => {
  beforeEach(() => {
    jest.useRealTimers();
    clearBudgetStore();
  });

  it('blocks during quiet hours and allows outside quiet hours', async () => {
    const budget = createMockNotificationBudget('user-123', {
      quietHoursStart: 22,
      quietHoursEnd: 7,
    });

    mockCurrentHour(23);
    await expect(
      canSendNotification(createMockNotificationRequest('user-123'), budget),
    ).resolves.toMatchObject({
      allowed: false,
      reason: 'Quiet hours in effect',
    });

    mockCurrentHour(9);
    await expect(
      canSendNotification(createMockNotificationRequest('user-123'), budget),
    ).resolves.toMatchObject({ allowed: true });
  });

  it('handles overnight quiet hours and next active time', async () => {
    mockCurrentHour(2);
    const result = await canSendNotification(
      createMockNotificationRequest('user-123'),
      createMockNotificationBudget('user-123', {
        quietHoursStart: 23,
        quietHoursEnd: 6,
      }),
    );

    expect(result.allowed).toBe(false);
    expect(result.rescheduleAt).toBeGreaterThan(Date.now());
  });

  it('blocks exactly at quiet hours start boundary and reschedules after now', async () => {
    const budget = createMockNotificationBudget('user-123', {
      quietHoursStart: 22,
      quietHoursEnd: 7,
    });

    const boundaryDate = new Date('2026-05-07T22:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(boundaryDate);

    const result = await canSendNotification(
      createMockNotificationRequest('user-123'),
      budget,
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Quiet hours in effect');
    expect((result.rescheduleAt ?? 0)).toBeGreaterThan(boundaryDate.getTime());
  });

  it('respects opt-out for every priority', async () => {
    const budget = createMockNotificationBudget('user-123', { optOut: true });
    await expect(
      canSendNotification(createMockNotificationRequest('user-123'), budget),
    ).resolves.toMatchObject({
      allowed: false,
      reason: 'User has opted out of notifications',
    });
    await expect(
      canSendNotification(
        createMockNotificationRequest('user-123', {
          priority: 'STREAK_CRITICAL',
        }),
        budget,
      ),
    ).resolves.toMatchObject({ allowed: false });
  });

  it('suppresses duplicates inside four hours and allows them later', async () => {
    mockCurrentHour(10);
    const recent = createMockNotificationBudget('user-123', {
      notificationsSent: [
        {
          id: 'notif-1',
          priority: 'COACH_NEXT_ACTION',
          sentAt: Date.now() - 2 * 60 * 60 * 1000,
          type: 'coach_session_suggestion',
          content: 'Try a 25-minute session today.',
        },
      ],
    });

    await expect(
      canSendNotification(
        createMockNotificationRequest('user-123', {
          type: 'coach_session_suggestion',
          priority: 'COACH_NEXT_ACTION',
        }),
        recent,
      ),
    ).resolves.toMatchObject({
      allowed: false,
      reason: 'Duplicate notification suppressed',
    });

    const old = createMockNotificationBudget('user-123', {
      notificationsSent: [
        {
          id: 'notif-1',
          priority: 'COACH_NEXT_ACTION',
          sentAt: Date.now() - 5 * 60 * 60 * 1000,
          type: 'coach_session_suggestion',
          content: 'Try a 25-minute session today.',
        },
      ],
    });
    await expect(
      canSendNotification(createMockNotificationRequest('user-123'), old),
    ).resolves.toMatchObject({ allowed: true });
  });

  it('resets stale daily budgets only', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(
      resetDailyBudget(
        createMockNotificationBudget('user-123', {
          date: yesterday.toISOString().split('T')[0],
          sentCount: 2,
          notificationsSent: [
            {
              id: 'notif-1',
              priority: 'COACH_NEXT_ACTION',
              sentAt: Date.now(),
              type: 'x',
              content: 'x',
            },
          ],
        }),
      ),
    ).toMatchObject({ sentCount: 0, notificationsSent: [] });

    expect(
      resetDailyBudget(
        createMockNotificationBudget('user-123', {
          date: new Date().toISOString().split('T')[0],
          sentCount: 1,
        }),
      ).sentCount,
    ).toBe(1);
  });
});
