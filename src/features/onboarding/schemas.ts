/**
 * Onboarding Schemas
 *
 * Zod schemas for validation. Types are inferred from schemas.
 * @phase 2
 */

import { z } from 'zod';
import { LaneSchema } from '../lane-engine/schemas';

/**
 * Focus goal enum
 */
export const FocusGoalSchema = z.enum([
  'WORK',
  'STUDY',
  'CREATIVE',
  'PERSONAL',
]);

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
  'MOTIVATION_STYLE',
  'FIRST_SESSION_CTA',
]);

/**
 * Coach persona type (chosen during onboarding or defaulted)
 */
export const CoachPersonaSchema = z.enum([
  'cheerleader',
  'mentor',
  'drill-sergeant',
]);

/**
 * Companion element type for onboarding (chosen during onboarding or defaulted)
 */
export const OnboardingElementSchema = z.enum([
  'FLAME',
  'WAVE',
  'TERRA',
  'ZEPHYR',
  'VOID',
  'LUMINA',
]);

/**
 * Motivation profile types derived from onboarding choices
 */
export const MotivationProfileTypeSchema = z.enum([
  'calm',
  'friendly',
  'game_like',
  'coach_led',
  'competitive',
  'intense',
  'study_focused',
  'student',
  'creator',
  'worker',
]);

/**
 * Motivation profile — derived from goal + persona + element choices
 */
export const MotivationProfileSchema = z.object({
  primary: MotivationProfileTypeSchema,
  secondary: z.array(MotivationProfileTypeSchema),
});

/**
 * Onboarding state schema (for Zustand/MMKV persistence)
 */
export const OnboardingStateSchema = z.object({
  isOnboarded: z.boolean(),
  currentStep: z.number().int().min(0).max(5),
  goal: FocusGoalSchema.nullable(),
  focusDuration: FocusDurationSchema.nullable(),
  displayName: z.string().min(1).nullable(),
  startedAt: z.number().nullable(),
  completedAt: z.number().nullable(),
  completedForUserId: z.string().min(1).nullable(),
  persona: CoachPersonaSchema.nullable(),
  element: OnboardingElementSchema.nullable(),
  motivationProfile: MotivationProfileSchema.nullable(),
  explicitMotivationStyle: MotivationProfileTypeSchema.nullable(),
  profileStepsCompleted: z.boolean(),
  firstSessionStarted: z.boolean(),
  firstSessionCompleted: z.boolean(),
  homePreviewEntered: z.boolean(),
  chosenLane: LaneSchema.nullable(),
});

/**
 * Goal option schema
 */
export const GoalOptionSchema = z.object({
  key: FocusGoalSchema,
  label: z.string().min(1),
  emoji: z.string(),
  description: z.string().min(1),
});

/**
 * Duration option schema
 */
export const DurationOptionSchema = z.object({
  value: FocusDurationSchema,
  label: z.string().min(1),
  emoji: z.string(),
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
  })
  .strict();

export type OnboardingProgress = z.infer<typeof OnboardingProgressSchema>;

// Export inferred types
export type FocusGoal = z.infer<typeof FocusGoalSchema>;
export type FocusDuration = z.infer<typeof FocusDurationSchema>;
export type OnboardingStep = z.infer<typeof OnboardingStepSchema>;
export type OnboardingState = z.infer<typeof OnboardingStateSchema>;
export type GoalOption = z.infer<typeof GoalOptionSchema>;
export type DurationOption = z.infer<typeof DurationOptionSchema>;
export type TooltipState = z.infer<typeof TooltipStateSchema>;
export type CoachPersona = z.infer<typeof CoachPersonaSchema>;
export type OnboardingElement = z.infer<typeof OnboardingElementSchema>;
export type MotivationProfileType = z.infer<typeof MotivationProfileTypeSchema>;
export type MotivationProfile = z.infer<typeof MotivationProfileSchema>;

// Type alias for backward compatibility
export type OnboardingGoal = FocusGoal;
