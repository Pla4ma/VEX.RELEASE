import { z } from 'zod';
import type { FocusDuration } from '../types';

const ValidGoals = ['WORK', 'STUDY', 'CREATIVE', 'PERSONAL'] as const;
const ValidDurations = [15, 25, 45, 60] as const;

export const OnboardingGoalSchema = z.enum(ValidGoals, {
  errorMap: () => ({ message: 'Please select a valid focus goal' }),
});

export const OnboardingDurationSchema = z
  .number()
  .refine(
    (val): val is FocusDuration =>
      ValidDurations.includes(val as FocusDuration),
    {
      message:
        'Please select a valid focus duration (15, 25, 45, or 60 minutes)',
    },
  );

export const OnboardingNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(30, 'Name must be 30 characters or less')
  .regex(
    /^[a-zA-Z0-9\s_-]+$/,
    'Name can only contain letters, numbers, spaces, hyphens, and underscores',
  )
  .transform((val) => val.trim());

export const OnboardingStepSchema = z.enum([
  'WELCOME',
  'GOAL_SETTING',
  'FOCUS_TIME',
  'NAME_SETUP',
  'FIRST_SESSION_CTA',
]);

export const OnboardingStateSchema = z.object({
  isOnboarded: z.boolean(),
  currentStep: z.number().min(0).max(4),
  goal: OnboardingGoalSchema.nullable(),
  focusDuration: OnboardingDurationSchema.nullable(),
  displayName: OnboardingNameSchema.nullable(),
  startedAt: z.number().nullable(),
  completedAt: z.number().nullable(),
});
