import { z } from 'zod';
import { eventBus } from '../../events/EventBus';
import * as repository from './repository';
import type { NotificationContext } from './service-types';
import {
  isQuietHours,
  getNextNotificationWindow,
  checkDailyNotificationLimit,
  recordNotificationSent,
} from './service-helpers';
import { evaluateNotificationRules } from './notification-rules';

const UserIdSchema = z.string().min(1);
const UnreadNotificationsCountSchema = z.number().int().nonnegative();

export async function getUnreadNotificationsCount(
  userId: string,
): Promise<number> {
  const validatedUserId = UserIdSchema.parse(userId);
  const count = await repository.fetchUnreadNotificationsCount(validatedUserId);
  return UnreadNotificationsCountSchema.parse(count);
}

export async function dispatchUrgencyNotification(
  context: NotificationContext,
  userTimezone: string = 'UTC',
  quietStart: number = 22,
  quietEnd: number = 8,
): Promise<{
  sent: boolean;
  reason?: string;
  deferred?: boolean;
  nextWindow?: Date;
}> {
  if (isQuietHours(userTimezone, quietStart, quietEnd)) {
    return {
      sent: false,
      reason: 'quiet_hours',
      deferred: true,
      nextWindow: getNextNotificationWindow(userTimezone, quietEnd),
    };
  }
  const limit = checkDailyNotificationLimit(context.userId);
  if (!limit.canSend) {
    return { sent: false, reason: 'daily_limit_reached' };
  }
  const evaluation = evaluateNotificationRules(context);
  if (!evaluation.shouldSend) {
    return { sent: false, reason: 'no_urgent_context' };
  }
  eventBus.publish('notification:send', {
    userId: context.userId,
    type: 'URGENCY',
    title: evaluation.notification?.title ?? 'VEX',
    body: evaluation.notification?.body ?? 'You have an update waiting.',
    priority: 'high',
  });
  recordNotificationSent(context.userId);
  return { sent: true };
}

const PushTokenInputSchema = z
  .object({
    userId: z.string().uuid(),
    token: z.string().min(1),
    platform: z.string().min(1),
  })
  .strict();

export async function registerPushToken(input: {
  userId: string;
  token: string;
  platform: string;
}): Promise<void> {
  const tokenInput = PushTokenInputSchema.parse(input);
  await repository.upsertPushToken(
    tokenInput.userId,
    tokenInput.token,
    tokenInput.platform,
  );
}

export async function getNotificationCenterItems(
  userId: string,
  cursor?: string,
): Promise<{ items: repository.NotificationCenterItem[]; nextCursor: string | null }> {
  const validatedUserId = UserIdSchema.parse(userId);
  return repository.fetchNotificationCenterItems(validatedUserId, cursor);
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  await repository.markNotificationRead(
    UserIdSchema.parse(userId),
    z.string().min(1).parse(notificationId),
  );
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await repository.markAllNotificationsRead(UserIdSchema.parse(userId));
}

export function subscribeToNotificationCenter(
  userId: string,
  onChange: () => void,
): () => void {
  return repository.subscribeToNotificationCenter(
    UserIdSchema.parse(userId),
    onChange,
  );
}

export type { NotificationCenterItem } from './schemas';
