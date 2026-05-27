import { z } from "zod";

export const NotificationPrioritySchema = z.enum([
  "STREAK_CRITICAL",
  "PENDING_SYNC",
  "COACH_NEXT_ACTION",
  "DAILY_MISSION",
  "SQUAD_HELP",
]);

export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

export const NotificationBudgetSchema = z.object({
  userId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sentCount: z.number().int().min(0).max(2),
  maxDaily: z.number().int().min(0).max(10),
  notificationsSent: z
    .array(
      z.object({
        id: z.string().min(1),
        priority: NotificationPrioritySchema,
        sentAt: z.number().int().positive(),
        type: z.string(),
        content: z.string(),
      }),
    )
    .max(10),
  quietHoursStart: z.number().int().default(22),
  quietHoursEnd: z.number().int().default(7),
  optOut: z.boolean().default(false),
  lane: z.string().min(1).optional(),
});

export type NotificationBudget = z.infer<typeof NotificationBudgetSchema>;

export const NotificationRequestSchema = z.object({
  userId: z.string().uuid(),
  priority: NotificationPrioritySchema,
  type: z.string(),
  content: z.string().max(500),
  scheduledFor: z.number().int().positive().optional(),
  metadata: z.record(z.unknown()).optional(),
  respectDailyLimit: z.boolean().default(false),
});

export type NotificationRequest = z.infer<typeof NotificationRequestSchema>;
