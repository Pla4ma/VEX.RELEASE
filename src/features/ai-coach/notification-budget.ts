import {
  NotificationBudgetSchema,
  type NotificationBudget,
  type NotificationRequest,
} from "./notification-budget-schema";
import {
  checkPriorityRules,
  getNextActiveTime,
  isDuplicateNotification,
  isInQuietHours,
} from "./notification-budget-rules";
import {
  ensureUUID,
  generateUUID,
  getStoredNotificationBudget,
  storeNotificationBudget,
  todayKey,
} from "./notification-budget-utils";

export function maxDailyForLane(lane?: string): number {
  // Clean lane gets 1/day; all others (or undefined) get 2/day.
  if (lane === "minimal_normal") return 1;
  return 2;
}

export {
  NotificationBudgetSchema,
  NotificationPrioritySchema,
  NotificationRequestSchema,
  type NotificationBudget,
  type NotificationPriority,
  type NotificationRequest,
} from "./notification-budget-schema";
export {
  createMockNotificationBudget,
  createMockNotificationRequest,
  clearBudgetStore,
} from "./notification-budget-utils";

export async function canSendNotification(
  request: NotificationRequest,
  currentBudget: NotificationBudget,
): Promise<{ allowed: boolean; reason?: string; rescheduleAt?: number }> {
  if (currentBudget.optOut) {
    return { allowed: false, reason: "User has opted out of notifications" };
  }
  if (
    request.priority === "STREAK_CRITICAL" ||
    request.priority === "PENDING_SYNC"
  ) {
    if (request.respectDailyLimit) {
      if (currentBudget.sentCount >= currentBudget.maxDaily) {
        return { allowed: false, reason: "Daily notification limit reached" };
      }
    }
    return { allowed: true };
  }
  if (isInQuietHours(currentBudget)) {
    return {
      allowed: false,
      reason: "Quiet hours in effect",
      rescheduleAt: getNextActiveTime(currentBudget),
    };
  }
  if (currentBudget.sentCount >= currentBudget.maxDaily) {
    return { allowed: false, reason: "Daily notification limit reached" };
  }

  const priorityCheck = checkPriorityRules(request, currentBudget);
  if (!priorityCheck.allowed) {
    return priorityCheck;
  }
  if (isDuplicateNotification(request, currentBudget)) {
    return { allowed: false, reason: "Duplicate notification suppressed" };
  }

  return { allowed: true };
}

export async function sendNotificationWithBudget(
  request: NotificationRequest,
  currentBudget: NotificationBudget,
): Promise<{
  success: boolean;
  updatedBudget: NotificationBudget;
  notificationId?: string;
}> {
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
    lane?: string;
  },
): Promise<NotificationBudget> {
  const storedBudget = getStoredNotificationBudget(userId);
  const resolvedMaxDaily =
    preferences?.maxDaily ??
    (preferences?.lane ? maxDailyForLane(preferences.lane) : undefined);

  if (storedBudget) {
    if (!preferences) return storedBudget;
    // Merge preferences into stored budget while preserving sent count and date
    return NotificationBudgetSchema.parse({
      ...storedBudget,
      maxDaily: resolvedMaxDaily ?? storedBudget.maxDaily,
      quietHoursStart:
        preferences.quietHoursStart ?? storedBudget.quietHoursStart,
      quietHoursEnd: preferences.quietHoursEnd ?? storedBudget.quietHoursEnd,
      optOut: preferences.optOut ?? storedBudget.optOut,
      lane: preferences.lane ?? storedBudget.lane,
    });
  }

  return NotificationBudgetSchema.parse({
    userId: ensureUUID(userId),
    date: todayKey(),
    sentCount: 0,
    maxDaily: resolvedMaxDaily ?? preferences?.maxDaily ?? 2,
    notificationsSent: [],
    quietHoursStart: preferences?.quietHoursStart || 22,
    quietHoursEnd: preferences?.quietHoursEnd || 7,
    optOut: preferences?.optOut || false,
    lane: preferences?.lane,
  });
}

export function resetDailyBudget(
  budget: NotificationBudget,
): NotificationBudget {
  const today = todayKey();
  if (budget.date === today) {
    return budget;
  }
  return { ...budget, date: today, sentCount: 0, notificationsSent: [] };
}
