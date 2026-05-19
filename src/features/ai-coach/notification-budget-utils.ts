import {
  NotificationBudgetSchema,
  NotificationRequestSchema,
  type NotificationBudget,
  type NotificationRequest,
} from './notification-budget-schema';

const budgetStore = new Map<string, NotificationBudget>();

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : 8 + (r % 4);
    return v.toString(16);
  });
}

export function ensureUUID(userId: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(userId)) {
    return userId;
  }
  const hex = Array.from(userId)
    .map((char) => (char.charCodeAt(0) % 16).toString(16))
    .join('')
    .padEnd(32, '0')
    .slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function todayKey(): string {
  return new Date().toISOString().split('T')[0] ?? 'unknown';
}

export function createMockNotificationBudget(
  userId: string,
  overrides: Partial<NotificationBudget> = {}
): NotificationBudget {
  const budget = NotificationBudgetSchema.parse({
    userId: ensureUUID(userId),
    date: todayKey(),
    sentCount: 0,
    maxDaily: 2,
    notificationsSent: [],
    quietHoursStart: 22,
    quietHoursEnd: 7,
    optOut: false,
    ...overrides,
  });
  budgetStore.set(budget.userId, budget);
  (globalThis as Record<string, unknown>).budget = budget;
  return budget;
}

export function createMockNotificationRequest(
  userId: string,
  overrides: Partial<NotificationRequest> = {}
): NotificationRequest {
  return NotificationRequestSchema.parse({
    userId: ensureUUID(userId),
    priority: 'COACH_NEXT_ACTION',
    type: 'coach_session_suggestion',
    content: 'Try a 25-minute session today.',
    ...overrides,
  });
}

export function getStoredNotificationBudget(userId: string): NotificationBudget | null {
  return budgetStore.get(ensureUUID(userId)) ?? null;
}

export function storeNotificationBudget(budget: NotificationBudget): void {
  budgetStore.set(budget.userId, budget);
}
