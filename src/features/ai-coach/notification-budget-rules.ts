import type {
  NotificationBudget,
  NotificationRequest,
} from "./notification-budget-schema";

export function checkPriorityRules(
  request: NotificationRequest,
  budget: NotificationBudget,
): { allowed: boolean; reason?: string } {
  if (
    request.priority === "STREAK_CRITICAL" ||
    request.priority === "PENDING_SYNC"
  ) {
    return { allowed: true };
  }

  const remainingBudget = budget.maxDaily - budget.sentCount;
  if (remainingBudget <= 0) {
    return {
      allowed: false,
      reason: "No remaining budget for this priority level",
    };
  }
  if (request.priority === "COACH_NEXT_ACTION" && remainingBudget === 1) {
    return { allowed: true };
  }
  if (request.priority === "DAILY_MISSION" && remainingBudget === 1) {
    return {
      allowed: false,
      reason: "Reserving budget for higher priority notifications",
    };
  }
  if (request.priority === "SQUAD_HELP" && remainingBudget <= 1) {
    return { allowed: false, reason: "Squad help is lowest priority" };
  }

  return { allowed: true };
}

export function isDuplicateNotification(
  request: NotificationRequest,
  budget: NotificationBudget,
): boolean {
  const recentNotifications = budget.notificationsSent.filter(
    (notification) => {
      const age = Date.now() - notification.sentAt;
      return age > 60 * 1000 && age < 4 * 60 * 60 * 1000;
    },
  );

  return recentNotifications.some(
    (notification) =>
      notification.type === request.type &&
      notification.priority === request.priority,
  );
}

export function isInQuietHours(budget: NotificationBudget): boolean {
  const now = new Date();
  const currentHour = Date.prototype.getHours.call(now);
  const quietStart = normalizeHour(budget.quietHoursStart);
  const quietEnd = normalizeHour(budget.quietHoursEnd);
  return currentHour >= quietStart || currentHour < quietEnd;
}

export function getNextActiveTime(budget: NotificationBudget): number {
  const now = new Date();
  const currentHour = Date.prototype.getHours.call(now);

  const quietStart = normalizeHour(budget.quietHoursStart);
  const quietEnd = normalizeHour(budget.quietHoursEnd);

  if (currentHour >= quietStart) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(quietEnd, 0, 0, 0);
    return tomorrow.getTime();
  }

  if (currentHour < quietEnd) {
    const today = new Date(now);
    today.setHours(quietEnd, 0, 0, 0);
    return today.getTime();
  }

  return now.getTime() + 60 * 60 * 1000;
}

export function isGenericLoginReminder(content: string): boolean {
  const genericPatterns = [
    /haven't seen you today/i,
    /come back and play/i,
    /we miss you/i,
    /login reminder/i,
    /daily login/i,
    /time for your session/i,
    /time for your daily session/i,
    /login now/i,
    /complete your mission/i,
  ];

  return genericPatterns.some((pattern) => pattern.test(content));
}

function normalizeHour(hour: number): number {
  return ((hour % 24) + 24) % 24;
}
