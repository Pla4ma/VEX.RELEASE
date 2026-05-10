/**
 * Onboarding Schemas
 *
 * Zod schemas for validation. Types are inferred from schemas.
 * @phase 2
 */

import { z } from 'zod';

/**
 * Focus goal enum
 */
export const FocusGoalSchema = z.enum(['WORK', 'STUDY', 'CREATIVE', 'PERSONAL']);

/**
 * Focus duration enum (in minutes)
 */
export const FocusDurationSchema = z.union([
  z.literal(10),
  z.literal(15),
  z.literal(25),
  z.literal(45),
  z.literal(60),
]);

/**
 * Onboarding step enum
 */
export const OnboardingStepSchema = z.enum([
  'WELCOME',
  'GOAL_SETTING',
  'FOCUS_TIME',
  'NAME_SETUP',
  'FIRST_SESSION_CTA',
]);

/**
 * Onboarding state schema (for Zustand/MMKV persistence)
 */
export const OnboardingStateSchema = z.object({
  isOnboarded: z.boolean(),
  currentStep: z.number().int().min(0).max(4),
  goal: FocusGoalSchema.nullable(),
  focusDuration: FocusDurationSchema.nullable(),
  displayName: z.string().min(1).nullable(),
  startedAt: z.number().nullable(),
  completedAt: z.number().nullable(),
});

/**
 * Goal option schema
 */
export const GoalOptionSchema = z.object({
  key: FocusGoalSchema,
  label: z.string().min(1),
  emoji: z.string().min(1),
  description: z.string().min(1),
});

/**
 * Duration option schema
 */
export const DurationOptionSchema = z.object({
  value: FocusDurationSchema,
  label: z.string().min(1),
  emoji: z.string().min(1),
});

/**
 * Tooltip state schema
 */
export const TooltipStateSchema = z.object({
  currentTooltip: z.number().int().min(0).max(2),
  hasShownStreakTooltip: z.boolean(),
  hasShownBossTooltip: z.boolean(),
  hasShownChallengeTooltip: z.boolean(),
});

// ============================================================================
// Onboarding State Machine Schema (Phase 3)
// ============================================================================

export const OnboardingProgressSchema = z.object({
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
}).strict();

export type OnboardingProgress = z.infer<typeof OnboardingProgressSchema>;

// Export inferred types
export type FocusGoal = z.infer<typeof FocusGoalSchema>;
export type FocusDuration = z.infer<typeof FocusDurationSchema>;
export type OnboardingStep = z.infer<typeof OnboardingStepSchema>;
export type OnboardingState = z.infer<typeof OnboardingStateSchema>;
export type GoalOption = z.infer<typeof GoalOptionSchema>;
export type DurationOption = z.infer<typeof DurationOptionSchema>;
export type TooltipState = z.infer<typeof TooltipStateSchema>;

// Type alias for backward compatibility
export type OnboardingGoal = FocusGoal;

/**
 * Onboarding goals constant for UI
 */
export const ONBOARDING_GOALS: Array<{ id: FocusGoal; label: string; description: string }> = [
  { id: 'WORK', label: 'Work', description: 'Focus on professional tasks' },
  { id: 'STUDY', label: 'Study', description: 'Learn and absorb new information' },
  { id: 'CREATIVE', label: 'Creative', description: 'Create, design, or build something' },
  { id: 'PERSONAL', label: 'Personal', description: 'Personal growth and organization' },
];
