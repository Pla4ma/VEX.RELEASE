import {
  NotificationBudgetSchema,
  type NotificationBudget,
  type NotificationRequest,
} from './notification-budget-schema';
import {
  checkPriorityRules,
  getNextActiveTime,
  isDuplicateNotification,
  isGenericLoginReminder,
  isInQuietHours,
} from './notification-budget-rules';
import {
  ensureUUID,
  generateUUID,
  getStoredNotificationBudget,
  storeNotificationBudget,
  todayKey,
} from './notification-budget-utils';

export {
  NotificationBudgetSchema,
  NotificationPrioritySchema,
  NotificationRequestSchema,
  type NotificationBudget,
  type NotificationPriority,
  type NotificationRequest,
} from './notification-budget-schema';
export {
  createMockNotificationBudget,
  createMockNotificationRequest,
} from './notification-budget-utils';

export async function canSendNotification(
  request: NotificationRequest,
  currentBudget: NotificationBudget
): Promise<{ allowed: boolean; reason?: string; rescheduleAt?: number }> {
  if (currentBudget.optOut) {
    return { allowed: false, reason: 'User has opted out of notifications' };
  }
  if (request.priority === 'STREAK_CRITICAL' || request.priority === 'PENDING_SYNC') {
    return { allowed: true };
  }
  if (isInQuietHours(currentBudget)) {
    return {
      allowed: false,
      reason: 'Quiet hours in effect',
      rescheduleAt: getNextActiveTime(currentBudget),
    };
  }
  if (currentBudget.sentCount >= currentBudget.maxDaily) {
    return { allowed: false, reason: 'Daily notification limit reached' };
  }

  const priorityCheck = checkPriorityRules(request, currentBudget);
  if (!priorityCheck.allowed) {
    return priorityCheck;
  }
  if (isDuplicateNotification(request, currentBudget)) {
    return { allowed: false, reason: 'Duplicate notification suppressed' };
  }

  return { allowed: true };
}

export async function sendNotificationWithBudget(
  request: NotificationRequest,
  currentBudget: NotificationBudget
): Promise<{ success: boolean; updatedBudget: NotificationBudget; notificationId?: string }> {
  const canSend = await canSendNotification(request, currentBudget);
  if (!canSend.allowed) {
    return { success: false, updatedBudget: currentBudget };
  }

  const notificationId = generateUUID();
  const updatedBudget = {
    ...currentBudget,
    sentCount: currentBudget.sentCount + 1,
    notificationsSent: [
      ...currentBudget.notificationsSent,
      {
        id: notificationId,
        priority: request.priority,
        sentAt: Date.now(),
        type: request.type,
        content: request.content,
      },
    ],
  };
  storeNotificationBudget(updatedBudget);

  return {
    success: true,
    notificationId,
    updatedBudget,
  };
}

export async function getOrCreateNotificationBudget(
  userId: string,
  preferences?: {
    quietHoursStart?: number;
    quietHoursEnd?: number;
    optOut?: boolean;
    maxDaily?: number;
  }
): Promise<NotificationBudget> {
  const storedBudget = getStoredNotificationBudget(userId);
  if (storedBudget && !preferences) {
    return storedBudget;
  }

  return NotificationBudgetSchema.parse({
    userId: ensureUUID(userId),
    date: todayKey(),
    sentCount: 0,
    maxDaily: preferences?.maxDaily || 2,
    notificationsSent: [],
    quietHoursStart: preferences?.quietHoursStart || 22,
    quietHoursEnd: preferences?.quietHoursEnd || 7,
    optOut: preferences?.optOut || false,
  });
}

export function resetDailyBudget(budget: NotificationBudget): NotificationBudget {
  const today = todayKey();
  if (budget.date === today) {
    return budget;
  }
  return { ...budget, date: today, sentCount: 0, notificationsSent: [] };
}

export async function sendCoachNotification(
  userId: string,
  type: 'STREAK_RISK' | 'SESSION_SUGGESTION' | 'MILESTONE_HYPE' | 'COMEBACK_SUPPORT',
  content: string,
  priority: 'STREAK_CRITICAL' | 'COACH_NEXT_ACTION' = 'COACH_NEXT_ACTION'
): Promise<{ success: boolean; reason?: string }> {
  if (isGenericLoginReminder(content)) {
    return { success: false, reason: 'Generic login reminder suppressed' };
  }

  const budget = await getOrCreateNotificationBudget(userId, { maxDaily: 2 });
  const result = await sendNotificationWithBudget({
    userId,
    priority,
    type: `coach_${type.toLowerCase()}`,
    content,
  }, budget);

  return result.success
    ? { success: true }
    : { success: false, reason: 'Budget limit reached or rules violated' };
}

export async function getNotificationBudgetStatus(
  userId: string
): Promise<{
  sent: number;
  maxDaily: number;
  remaining: number;
  inQuietHours: boolean;
  nextActiveTime?: number;
}> {
  const budget = await getOrCreateNotificationBudget(userId);
  const inQuietHours = isInQuietHours(budget);

  return {
    sent: budget.sentCount,
    maxDaily: budget.maxDaily,
    remaining: budget.maxDaily - budget.sentCount,
    inQuietHours,
    nextActiveTime: inQuietHours ? getNextActiveTime(budget) : undefined,
  };
}
