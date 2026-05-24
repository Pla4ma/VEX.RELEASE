import { beforeEach, describe, expect, it, vi } from '@jest/globals';
import {
  canSendNotification,
  createMockNotificationBudget,
  createMockNotificationRequest,
  sendNotificationWithBudget,
  type NotificationBudget,
  type NotificationRequest,
} from '../notification-budget';

describe('Notification budget rules', () => {
  let mockBudget: NotificationBudget;
  let mockRequest: NotificationRequest;

  beforeEach(() => {
    jest.useRealTimers();
    mockBudget = createMockNotificationBudget('user-123');
    mockRequest = createMockNotificationRequest('user-123');
  });

  it('allows notifications under limit and blocks when limit is reached', async () => {
    await expect(canSendNotification(mockRequest, mockBudget))
      .resolves.toMatchObject({ allowed: true });

    await expect(canSendNotification(mockRequest, createMockNotificationBudget('user-123', {
      sentCount: 2,
      maxDaily: 2,
    }))).resolves.toMatchObject({
      allowed: false,
      reason: 'Daily notification limit reached',
    });
  });

  it('tracks sent notifications and preserves budget for blocked sends', async () => {
    const sent = await sendNotificationWithBudget(mockRequest, mockBudget);
    expect(sent.success).toBe(true);
    expect(sent.updatedBudget.sentCount).toBe(1);

    const blocked = await sendNotificationWithBudget(mockRequest, createMockNotificationBudget('user-123', {
      sentCount: 2,
      maxDaily: 2,
    }));
    expect(blocked.success).toBe(false);
    expect(blocked.updatedBudget.sentCount).toBe(2);
  });

  it('applies priority rules', async () => {
    const fullBudget = createMockNotificationBudget('user-123', { sentCount: 2, maxDaily: 2 });
    await expect(canSendNotification(createMockNotificationRequest('user-123', {
      priority: 'STREAK_CRITICAL',
    }), fullBudget)).resolves.toMatchObject({ allowed: true });
    await expect(canSendNotification(createMockNotificationRequest('user-123', {
      priority: 'PENDING_SYNC',
    }), fullBudget)).resolves.toMatchObject({ allowed: true });
    await expect(canSendNotification(createMockNotificationRequest('user-123', {
      priority: 'DAILY_MISSION',
    }), createMockNotificationBudget('user-123', { sentCount: 1, maxDaily: 2 })))
      .resolves.toMatchObject({ reason: 'Reserving budget for higher priority notifications' });
    await expect(canSendNotification(createMockNotificationRequest('user-123', {
      priority: 'SQUAD_HELP',
    }), createMockNotificationBudget('user-123', { sentCount: 1, maxDaily: 2 })))
      .resolves.toMatchObject({ reason: 'Squad help is lowest priority' });
  });
});
