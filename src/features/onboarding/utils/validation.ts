import { z } from "zod";
import { createDebugger } from "../../../utils/debug";
import type { FocusGoal, FocusDuration } from "../types";
import type { ValidationResult } from "./goal-validators";

const debug = createDebugger("onboarding:validation");

const ValidGoals = ["WORK", "STUDY", "CREATIVE", "PERSONAL"] as const;
const ValidDurations = [15, 25, 45, 60] as const;

export const OnboardingGoalSchema = z.enum(ValidGoals, {
  errorMap: () => ({ message: "Please select a valid focus goal" }),
});

export const OnboardingDurationSchema = z
  .number()
  .refine(
    (val): val is FocusDuration =>
      ValidDurations.includes(val as FocusDuration),
    {
      message:
        "Please select a valid focus duration (15, 25, 45, or 60 minutes)",
    },
  );

export const OnboardingNameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(30, "Name must be 30 characters or less")
  .regex(
    /^[a-zA-Z0-9\s_-]+$/,
    "Name can only contain letters, numbers, spaces, hyphens, and underscores",
  )
  .transform((val) => val.trim());

export const OnboardingStepSchema = z.enum([
  "WELCOME",
  "GOAL_SETTING",
  "FOCUS_TIME",
  "NAME_SETUP",
  "FIRST_SESSION_CTA",
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

export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from "./goal-validators";

export { GoalValidators } from "./goal-validators";
export { DurationValidators } from "./duration-validators";
export { NameValidators } from "./name-validators";

import { GoalValidators } from "./goal-validators";
import { DurationValidators } from "./duration-validators";
import { NameValidators } from "./name-validators";

export function validateOnboardingStep(
  step: string,
  data: Record<string, unknown>,
): ValidationResult<void> {
  const result: ValidationResult<void> = {
    success: true,
    errors: [],
    warnings: [],
  };
  switch (step) {
    case "WELCOME":
      break;
    case "GOAL_SETTING": {
      const goalResult = GoalValidators.validate(data.goal);
      if (!goalResult.success) {
        result.success = false;
        result.errors.push(...goalResult.errors);
      }
      break;
    }
    case "FOCUS_TIME": {
      const durationResult = DurationValidators.validate(data.focusDuration);
      if (!durationResult.success) {
        result.success = false;
        result.errors.push(...durationResult.errors);
      }
      if (data.goal && durationResult.success) {
        const recommended = DurationValidators.recommendForGoal(
          data.goal as FocusGoal,
        );
        if (!recommended.includes(durationResult.data!)) {
          result.warnings.push({
            field: "focusDuration",
            message: `For ${String(data.goal)} goals, we recommend ${recommended.slice(0, 2).join(" or ")} minute sessions`,
            code: "DURATION_NOT_RECOMMENDED_FOR_GOAL",
          });
        }
      }
      break;
    }
    case "NAME_SETUP": {
      const nameResult = NameValidators.validate(data.displayName);
      if (!nameResult.success) {
        result.success = false;
        result.errors.push(...nameResult.errors);
      }
      break;
    }
    case "FIRST_SESSION_CTA": {
      const requiredFields = ["goal", "focusDuration", "displayName"];
      for (const field of requiredFields) {
        if (!data[field])
          result.warnings.push({
            field,
            message: `${field} is missing from onboarding data`,
            code: "MISSING_ONBOARDING_DATA",
          });
      }
      break;
    }
    default:
      result.errors.push({
        field: "step",
        message: `Unknown onboarding step: ${step}`,
        code: "UNKNOWN_STEP",
      });
      result.success = false;
  }
  return result;
}

export function validateCompleteOnboarding(
  state: Record<string, unknown>,
): ValidationResult<{
  goal: FocusGoal;
  focusDuration: FocusDuration;
  displayName: string;
}> {
  const result: ValidationResult<{
    goal: FocusGoal;
    focusDuration: FocusDuration;
    displayName: string;
  }> = { success: false, errors: [], warnings: [] };
  const goalResult = GoalValidators.validate(state.goal);
  const durationResult = DurationValidators.validate(state.focusDuration);
  const nameResult = NameValidators.validate(state.displayName);
  if (!goalResult.success) result.errors.push(...goalResult.errors);
  if (!durationResult.success) result.errors.push(...durationResult.errors);
  if (!nameResult.success) result.errors.push(...nameResult.errors);
  if (goalResult.success && durationResult.success) {
    const recommended = DurationValidators.recommendForGoal(goalResult.data!);
    if (!recommended.includes(durationResult.data!)) {
      result.warnings.push({
        field: "consistency",
        message: `Your chosen duration may not be optimal for ${String(goalResult.data)} goals`,
        code: "GOAL_DURATION_MISMATCH",
      });
    }
  }
  const startedAt = state.startedAt as number | null;
  const completedAt = state.completedAt as number | null;
  if (startedAt && completedAt) {
    const duration = completedAt - startedAt;
    if (duration < 5000) {
      result.warnings.push({
        field: "timing",
        message:
          "Onboarding completed very quickly. Make sure you understood all the options.",
        code: "RAPID_COMPLETION",
      });
    }
    if (duration > 30 * 60 * 1000) {
      result.warnings.push({
        field: "timing",
        message:
          "Onboarding took over 30 minutes. You can always change these settings later.",
        code: "SLOW_COMPLETION",
      });
    }
  }
  if (result.errors.length === 0) {
    result.success = true;
    result.data = {
      goal: goalResult.data!,
      focusDuration: durationResult.data!,
      displayName: nameResult.data!,
    };
  }
  debug.info("Complete onboarding validation", {
    success: result.success,
    errors: result.errors.length,
    warnings: result.warnings.length,
  });
  return result;
}

export function getNextRecommendedStep(
  currentStep: string,
  state: Record<string, unknown>,
): { step: string; reason: string } | null {
  switch (currentStep) {
    case "WELCOME":
      return {
        step: "GOAL_SETTING",
        reason: "First, let us understand your focus goals",
      };
    case "GOAL_SETTING":
      return !state.goal
        ? null
        : {
            step: "FOCUS_TIME",
            reason: "Now let us set your preferred focus duration",
          };
    case "FOCUS_TIME":
      return !state.focusDuration
        ? null
        : state.skipName
          ? {
              step: "FIRST_SESSION_CTA",
              reason: "Ready to start your first session!",
            }
          : {
              step: "NAME_SETUP",
              reason: "Personalize your experience with a display name",
            };
    case "NAME_SETUP":
      return {
        step: "FIRST_SESSION_CTA",
        reason: "You are all set! Start your first focus session",
      };
    case "FIRST_SESSION_CTA":
      return null;
    default:
      return null;
  }
}

export function canSkipStep(
  step: string,
  _state: Record<string, unknown>,
): { canSkip: boolean; reason: string } {
  switch (step) {
    case "WELCOME":
      return {
        canSkip: true,
        reason: "You can skip the welcome, but we recommend viewing it",
      };
    case "GOAL_SETTING":
      return {
        canSkip: false,
        reason: "A focus goal is required to personalize your experience",
      };
    case "FOCUS_TIME":
      return {
        canSkip: false,
        reason: "Focus duration is required for session setup",
      };
    case "NAME_SETUP":
      return {
        canSkip: true,
        reason: "You can skip this and we will use a default name",
      };
    case "FIRST_SESSION_CTA":
      return {
        canSkip: true,
        reason: "You can skip and explore the app first",
      };
    default:
      return { canSkip: false, reason: "Unknown step" };
  }
}

export const OnboardingValidation = {
  Goal: GoalValidators,
  Duration: DurationValidators,
  Name: NameValidators,
  validateStep: validateOnboardingStep,
  validateComplete: validateCompleteOnboarding,
  getNextRecommendedStep,
  canSkipStep,
};

export default OnboardingValidation;
