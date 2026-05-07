/**
 * AI Coach Notification Budget - Phase 7
 * 
 * Implements 2 notifications/day limit with priority rules,
 * quiet hours, and suppression of generic login reminders.
 */

import { z } from 'zod';

// ============================================================================
// Notification Budget Types
// ============================================================================

export const NotificationPrioritySchema = z.enum([
  'STREAK_CRITICAL',    // 1 - Highest priority
  'PENDING_SYNC',       // 2 - Data sync required
  'COACH_NEXT_ACTION',  // 3 - AI coach best action
  'DAILY_MISSION',      // 4 - Daily mission reminder
  'SQUAD_HELP',         // 5 - Squad assistance (if squads enabled)
]);

export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

export const NotificationBudgetSchema = z.object({
  userId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  sentCount: z.number().int().min(0).max(2),
  maxDaily: z.number().int().min(0).max(10),
  notificationsSent: z.array(z.object({
    id: z.string().uuid(),
    priority: NotificationPrioritySchema,
    sentAt: z.number().int().positive(),
    type: z.string(),
    content: z.string(),
  })).max(10),
  quietHoursStart: z.number().int().min(0).max(23).default(22),
  quietHoursEnd: z.number().int().min(0).max(23).default(7),
  optOut: z.boolean().default(false),
});

export type NotificationBudget = z.infer<typeof NotificationBudgetSchema>;

export const NotificationRequestSchema = z.object({
  userId: z.string().uuid(),
  priority: NotificationPrioritySchema,
  type: z.string(),
  content: z.string().max(500),
  scheduledFor: z.number().int().positive().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type NotificationRequest = z.infer<typeof NotificationRequestSchema>;

// ============================================================================
// Notification Budget Implementation
// ============================================================================

/**
 * Check if notification can be sent based on budget rules
 */
export async function canSendNotification(
  request: NotificationRequest,
  currentBudget: NotificationBudget
): Promise<{ allowed: boolean; reason?: string; rescheduleAt?: number }> {
  // Check user opt-out
  if (currentBudget.optOut) {
    return { allowed: false, reason: 'User has opted out of notifications' };
  }

  // Check quiet hours (10 PM to 7 AM local time)
  if (isInQuietHours(currentBudget)) {
    const rescheduleAt = getNextActiveTime(currentBudget);
    return { 
      allowed: false, 
      reason: 'Quiet hours in effect', 
      rescheduleAt 
    };
  }

  // Check daily budget limit
  if (currentBudget.sentCount >= currentBudget.maxDaily) {
    return { allowed: false, reason: 'Daily notification limit reached' };
  }

  // Check priority-based rules
  const priorityCheck = checkPriorityRules(request, currentBudget);
  if (!priorityCheck.allowed) {
    return priorityCheck;
  }

  // Check for duplicate suppression
  if (isDuplicateNotification(request, currentBudget)) {
    return { allowed: false, reason: 'Duplicate notification suppressed' };
  }

  return { allowed: true };
}

/**
 * Send notification and update budget
 */
export async function sendNotificationWithBudget(
  request: NotificationRequest,
  currentBudget: NotificationBudget
): Promise<{ success: boolean; updatedBudget: NotificationBudget; notificationId?: string }> {
  // Check if can send
  const canSend = await canSendNotification(request, currentBudget);
  if (!canSend.allowed) {
    return { success: false, updatedBudget: currentBudget };
  }

  // Create notification record
  const notificationId = generateUUID();
  const notification = {
    id: notificationId,
    priority: request.priority,
    sentAt: Date.now(),
    type: request.type,
    content: request.content,
  };

  // Update budget
  const updatedBudget: NotificationBudget = {
    ...currentBudget,
    sentCount: currentBudget.sentCount + 1,
    notificationsSent: [...currentBudget.notificationsSent, notification],
  };

  // In production, this would actually send the notification
  // await notificationService.send(request);

  return { 
    success: true, 
    updatedBudget, 
    notificationId 
  };
}

/**
 * Get or create notification budget for user
 */
export async function getOrCreateNotificationBudget(
  userId: string,
  preferences?: {
    quietHoursStart?: number;
    quietHoursEnd?: number;
    optOut?: boolean;
    maxDaily?: number;
  }
): Promise<NotificationBudget> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // In production, this would fetch from database
  // For now, return a new budget
  return NotificationBudgetSchema.parse({
    userId: ensureUUID(userId),
    date: today,
    sentCount: 0,
    maxDaily: preferences?.maxDaily || 2,
    notificationsSent: [],
    quietHoursStart: preferences?.quietHoursStart || 22,
    quietHoursEnd: preferences?.quietHoursEnd || 7,
    optOut: preferences?.optOut || false,
  });
}

/**
 * Reset daily budget (called at midnight)
 */
export function resetDailyBudget(budget: NotificationBudget): NotificationBudget {
  const today = new Date().toISOString().split('T')[0];
  
  if (budget.date === today) {
    return budget; // Already reset today
  }

  return {
    ...budget,
    date: today,
    sentCount: 0,
    notificationsSent: [],
  };
}

// ============================================================================
// Priority Rules Implementation
// ============================================================================

/**
 * Check priority-based notification rules
 */
function checkPriorityRules(
  request: NotificationRequest,
  budget: NotificationBudget
): { allowed: boolean; reason?: string } {
  // Priority 1: Streak critical - always allowed
  if (request.priority === 'STREAK_CRITICAL') {
    return { allowed: true };
  }

  // Priority 2: Pending sync - always allowed
  if (request.priority === 'PENDING_SYNC') {
    return { allowed: true };
  }

  // Priority 3-5: Only if budget allows and not during quiet hours
  const remainingBudget = budget.maxDaily - budget.sentCount;
  if (remainingBudget <= 0) {
    return { allowed: false, reason: 'No remaining budget for this priority level' };
  }

  // For lower priorities, ensure we have room for higher priority items
  if (request.priority === 'COACH_NEXT_ACTION' && remainingBudget === 1) {
    // Reserve one slot for potential streak critical or pending sync
    return { allowed: true }; // But this is the last coach notification for today
  }

  if (request.priority === 'DAILY_MISSION' && remainingBudget === 1) {
    return { allowed: false, reason: 'Reserving budget for higher priority notifications' };
  }

  if (request.priority === 'SQUAD_HELP' && remainingBudget <= 1) {
    return { allowed: false, reason: 'Squad help is lowest priority' };
  }

  return { allowed: true };
}

/**
 * Check if notification is a duplicate
 */
function isDuplicateNotification(
  request: NotificationRequest,
  budget: NotificationBudget
): boolean {
  const recentNotifications = budget.notificationsSent.filter(
    n => Date.now() - n.sentAt < (4 * 60 * 60 * 1000) // Last 4 hours
  );

  return recentNotifications.some(notification => 
    notification.type === request.type && 
    notification.priority === request.priority
  );
}

/**
 * Check if current time is in quiet hours
 */
function isInQuietHours(budget: NotificationBudget): boolean {
  const currentHour = new Date().getHours();
  
  if (budget.quietHoursStart <= budget.quietHoursEnd) {
    // Normal range (e.g., 22 to 7)
    return currentHour >= budget.quietHoursStart || currentHour < budget.quietHoursEnd;
  } else {
    // Overnight range (e.g., 22 to 7 next day)
    return currentHour >= budget.quietHoursStart || currentHour < budget.quietHoursEnd;
  }
}

/**
 * Get next active time outside quiet hours
 */
function getNextActiveTime(budget: NotificationBudget): number {
  const now = new Date();
  const currentHour = now.getHours();
  
  if (budget.quietHoursStart <= budget.quietHoursEnd) {
    // Normal range
    if (currentHour >= budget.quietHoursStart) {
      // In quiet hours, schedule for tomorrow morning
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(budget.quietHoursEnd, 0, 0, 0);
      return tomorrow.getTime();
    } else if (currentHour < budget.quietHoursEnd) {
      // In quiet hours early morning
      const today = new Date(now);
      today.setHours(budget.quietHoursEnd, 0, 0, 0);
      return today.getTime();
    }
  } else {
    // Overnight range
    if (currentHour >= budget.quietHoursStart) {
      // In quiet hours evening
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(budget.quietHoursEnd, 0, 0, 0);
      return tomorrow.getTime();
    } else if (currentHour < budget.quietHoursEnd) {
      // In quiet hours early morning
      const today = new Date(now);
      today.setHours(budget.quietHoursEnd, 0, 0, 0);
      return today.getTime();
    }
  }

  return now.getTime() + (60 * 60 * 1000); // Default: 1 hour from now
}

// ============================================================================
// Coach-Specific Notification Functions
// ============================================================================

/**
 * Send coach notification with budget enforcement
 */
export async function sendCoachNotification(
  userId: string,
  type: 'STREAK_RISK' | 'SESSION_SUGGESTION' | 'MILESTONE_HYPE' | 'COMEBACK_SUPPORT',
  content: string,
  priority: 'STREAK_CRITICAL' | 'COACH_NEXT_ACTION' = 'COACH_NEXT_ACTION'
): Promise<{ success: boolean; reason?: string }> {
  const budget = await getOrCreateNotificationBudget(userId);
  
  const request: NotificationRequest = {
    userId,
    priority,
    type: `coach_${type.toLowerCase()}`,
    content,
  };

  // Suppress generic login reminders
  if (isGenericLoginReminder(content)) {
    return { success: false, reason: 'Generic login reminder suppressed' };
  }

  const result = await sendNotificationWithBudget(request, budget);
  
  if (!result.success) {
    return { success: false, reason: 'Budget limit reached or rules violated' };
  }

  // In production, save updated budget to database
  // await saveNotificationBudget(result.updatedBudget);

  return { success: true };
}

/**
 * Check if content is a generic login reminder
 */
function isGenericLoginReminder(content: string): boolean {
  const genericPatterns = [
    /haven't seen you today/i,
    /come back and play/i,
    /we miss you/i,
    /login reminder/i,
    /daily login/i,
    /time for your session/i,
  ];

  return genericPatterns.some(pattern => pattern.test(content));
}

/**
 * Get notification budget status for user
 */
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
  
  return {
    sent: budget.sentCount,
    maxDaily: budget.maxDaily,
    remaining: budget.maxDaily - budget.sentCount,
    inQuietHours: isInQuietHours(budget),
    nextActiveTime: isInQuietHours(budget) ? getNextActiveTime(budget) : undefined,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a valid UUID for testing
 */
function generateMockUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Ensure userId is a valid UUID
 */
function ensureUUID(userId: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId) ? userId : generateMockUUID();
}

/**
 * Create mock notification budget for testing
 */
export function createMockNotificationBudget(
  userId: string,
  overrides: Partial<NotificationBudget> = {}
): NotificationBudget {
  const today = new Date().toISOString().split('T')[0];
  
  return NotificationBudgetSchema.parse({
    userId: ensureUUID(userId),
    date: today,
    sentCount: 0,
    maxDaily: 2,
    notificationsSent: [],
    quietHoursStart: 22,
    quietHoursEnd: 7,
    optOut: false,
    ...overrides,
  });
}

/**
 * Create mock notification request for testing
 */
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