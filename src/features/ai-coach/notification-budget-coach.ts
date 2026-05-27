import type {
  NotificationBudget,
  NotificationRequest,
} from "./notification-budget-schema";
import {
  isGenericLoginReminder,
  isInQuietHours,
  getNextActiveTime,
} from "./notification-budget-rules";
import {
  getOrCreateNotificationBudget,
  sendNotificationWithBudget,
} from "./notification-budget";

export async function sendCoachNotification(
  userId: string,
  type:
    | "STREAK_RISK"
    | "SESSION_SUGGESTION"
    | "MILESTONE_HYPE"
    | "COMEBACK_SUPPORT",
  content: string,
  priority: "STREAK_CRITICAL" | "COACH_NEXT_ACTION" = "COACH_NEXT_ACTION",
  lane?: string,
): Promise<{ success: boolean; reason?: string }> {
  if (isGenericLoginReminder(content)) {
    return { success: false, reason: "Generic login reminder suppressed" };
  }

  const budget = await getOrCreateNotificationBudget(userId, { lane });
  const result = await sendNotificationWithBudget(
    {
      userId,
      priority,
      type: `coach_${type.toLowerCase()}`,
      content,
      respectDailyLimit: false,
    },
    budget,
  );

  return result.success
    ? { success: true }
    : { success: false, reason: "Budget limit reached or rules violated" };
}

export async function getNotificationBudgetStatus(
  userId: string,
  lane?: string,
): Promise<{
  sent: number;
  maxDaily: number;
  remaining: number;
  inQuietHours: boolean;
  nextActiveTime?: number;
}> {
  const budget = await getOrCreateNotificationBudget(userId, { lane });
  const inQuietHours = isInQuietHours(budget);

  return {
    sent: budget.sentCount,
    maxDaily: budget.maxDaily,
    remaining: budget.maxDaily - budget.sentCount,
    inQuietHours,
    nextActiveTime: inQuietHours ? getNextActiveTime(budget) : undefined,
  };
}
