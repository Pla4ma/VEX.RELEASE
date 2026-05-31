import { z } from 'zod';
import { NotificationChannelSchema, NotificationPrioritySchema } from './enums';

export const NotificationSettingsSchema = z
  .object({
    userId: z.string().uuid(),
    channels: z
      .object({
        push: z
          .object({
            enabled: z.boolean(),
            deviceTokens: z.array(z.string()),
            quietHoursStart: z.number().int().min(0).max(23).optional(),
            quietHoursEnd: z.number().int().min(0).max(23).optional(),
            timezone: z.string(),
          })
          .strict(),
        email: z
          .object({
            enabled: z.boolean(),
            email: z.string().email(),
            digestFrequency: z.enum(['immediate', 'daily', 'weekly', 'never']),
          })
          .strict(),
        inApp: z
          .object({
            enabled: z.boolean(),
            soundEnabled: z.boolean(),
            vibrationEnabled: z.boolean(),
          })
          .strict(),
      })
      .strict(),
    preferences: z.record(
      z
        .object({
          enabled: z.boolean(),
          channels: z.array(NotificationChannelSchema),
        })
        .strict(),
    ),
    customRules: z.array(
      z
        .object({
          id: z.string().uuid(),
          userId: z.string().uuid(),
          name: z.string().min(1).max(100),
          condition: z
            .object({
              type: z.enum(['time', 'location', 'activity', 'streak']),
              params: z.record(z.unknown()),
            })
            .strict(),
          action: z
            .object({
              enabled: z.boolean(),
              channels: z.array(NotificationChannelSchema),
              message: z.string().optional(),
            })
            .strict(),
          priority: NotificationPrioritySchema,
          isActive: z.boolean(),
        })
        .strict(),
    ),
  })
  .strict();

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;
