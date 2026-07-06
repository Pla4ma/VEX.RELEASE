import { z } from 'zod';
import { MotivationProfileSchema } from './schemas';

export const OnboardingProgressSchema = z
  .object({
    userId: z.string().uuid(),
    status: z.enum(['IN_PROGRESS', 'FIRST_SESSION_IN_PROGRESS', 'COMPLETED']),

    steps: z.object({
      profileStarted: z.boolean(),
      goalSelected: z.boolean(),
      firstSessionStarted: z.boolean(),
      firstSessionCompleted: z.boolean(),
      rewardSeen: z.boolean(),
    }),

    firstSession: z.object({
      sessionId: z.string().uuid().optional(),
      startedAt: z.number().optional(),
      completedAt: z.number().optional(),
    }),

    permissions: z.object({
      notificationAsked: z.boolean(),
      notificationGranted: z.boolean(),
    }),

    goal: z.string().optional(),
    focusDuration: z.number().int().optional(),
    displayName: z.string().optional(),
    persona: z.string().optional(),
    element: z.string().optional(),
    motivationProfile: MotivationProfileSchema.optional(),
    chosenLane: z.string().optional(),
  })
  .strict();

export type OnboardingProgress = z.infer<typeof OnboardingProgressSchema>;
