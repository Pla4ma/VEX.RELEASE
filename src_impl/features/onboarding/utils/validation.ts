/**
 * Onboarding Validation Utilities
 *
 * Comprehensive validation for onboarding flow.
 * Ensures data integrity and provides actionable feedback.
 *
 * @phase 2 - Deepening: Validation layer
 */

import { z } from "zod";
import { createDebugger } from "../../../utils/debug";
import type { FocusGoal, FocusDuration } from "../types";

const debug = createDebugger("onboarding:validation");

// ============================================================================
// Schemas
// ============================================================================

const ValidGoals = ["WORK", "STUDY", "CREATIVE", "PERSONAL"] as const;
const ValidDurations = [15, 25, 45, 60] as const;

export const OnboardingGoalSchema = z.enum(ValidGoals, {
  errorMap: () => ({ message: "Please select a valid focus goal" }),
});

export const OnboardingDurationSchema = z.number().refine((val): val is FocusDuration => ValidDurations.includes(val as FocusDuration), {
  message: "Please select a valid focus duration (15, 25, 45, or 60 minutes)",
});

export const OnboardingNameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(30, "Name must be 30 characters or less")
  .regex(/^[a-zA-Z0-9\s_-]+$/, "Name can only contain letters, numbers, spaces, hyphens, and underscores")
  .transform((val) => val.trim());

export const OnboardingStepSchema = z.enum(["WELCOME", "GOAL_SETTING", "FOCUS_TIME", "NAME_SETUP", "FIRST_SESSION_CTA"]);

export const OnboardingStateSchema = z.object({
  isOnboarded: z.boolean(),
  currentStep: z.number().min(0).max(4),
  goal: OnboardingGoalSchema.nullable(),
  focusDuration: OnboardingDurationSchema.nullable(),
  displayName: OnboardingNameSchema.nullable(),
  startedAt: z.number().nullable(),
  completedAt: z.number().nullable(),
});

// ============================================================================
// Validation Result Types
// ============================================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// Field Validators
// ============================================================================

export const GoalValidators = {
  validate: (goal: unknown): ValidationResult<FocusGoal> => {
    const result: ValidationResult<FocusGoal> = {
      success: false,
      errors: [],
      warnings: [],
    };

    const parsed = OnboardingGoalSchema.safeParse(goal);

    if (!parsed.success) {
      result.errors.push({
        field: "goal",
        message: parsed.error.errors[0]?.message || "Invalid goal selected",
        code: "INVALID_GOAL",
      });
      return result;
    }

    result.data = parsed.data;
    result.success = true;

    debug.info("Goal validated", { goal: parsed.data });
    return result;
  },

  getSuggestions: (partialGoal: string): FocusGoal[] => {
    const matches: FocusGoal[] = [];
    const partial = partialGoal.toLowerCase();

    if ("work".includes(partial) || partial.includes("work")) {
      matches.push("WORK");
    }
    if ("study".includes(partial) || partial.includes("study")) {
      matches.push("STUDY");
    }
    if ("creative".includes(partial) || partial.includes("creative")) {
      matches.push("CREATIVE");
    }
    if ("personal".includes(partial) || partial.includes("personal")) {
      matches.push("PERSONAL");
    }

    return matches;
  },
};

export const DurationValidators = {
  validate: (duration: unknown): ValidationResult<FocusDuration> => {
    const result: ValidationResult<FocusDuration> = {
      success: false,
      errors: [],
      warnings: [],
    };

    // Check if it's a valid number
    if (typeof duration !== "number" || isNaN(duration)) {
      result.errors.push({
        field: "duration",
        message: "Duration must be a valid number",
        code: "INVALID_DURATION_TYPE",
      });
      return result;
    }

    // Check if it's one of the allowed values
    if (!ValidDurations.includes(duration as FocusDuration)) {
      // Find closest valid duration
      const closest = ValidDurations.reduce((prev, curr) => (Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev));

      result.errors.push({
        field: "duration",
        message: `Invalid duration. Did you mean ${closest} minutes?`,
        code: "INVALID_DURATION_VALUE",
      });

      result.suggestions = ValidDurations.map((d) => `${d} minutes`);
      return result;
    }

    result.data = duration as FocusDuration;
    result.success = true;

    // Add warnings for extreme durations
    if (duration === 15) {
      result.warnings.push({
        field: "duration",
        message: "15-minute sessions are great for starting out, but consider longer sessions for deep work",
        code: "SHORT_DURATION_WARNING",
      });
    } else if (duration === 60) {
      result.warnings.push({
        field: "duration",
        message: "60-minute sessions require strong focus stamina. Consider starting with 25 or 45 minutes.",
        code: "LONG_DURATION_WARNING",
      });
    }

    debug.info("Duration validated", { duration });
    return result;
  },

  recommendForGoal: (goal: FocusGoal): FocusDuration[] => {
    const recommendations: Record<FocusGoal, FocusDuration[]> = {
      WORK: [25, 45, 60],
      STUDY: [25, 45, 15],
      CREATIVE: [45, 60, 25],
      PERSONAL: [25, 15, 45],
    };
    return recommendations[goal];
  },
};

export const NameValidators = {
  validate: (name: unknown): ValidationResult<string> => {
    const result: ValidationResult<string> = {
      success: false,
      errors: [],
      warnings: [],
    };

    if (typeof name !== "string") {
      result.errors.push({
        field: "name",
        message: "Name must be a string",
        code: "INVALID_NAME_TYPE",
      });
      return result;
    }

    const trimmed = name.trim();

    if (trimmed.length === 0) {
      result.errors.push({
        field: "name",
        message: "Name is required",
        code: "NAME_REQUIRED",
      });
      return result;
    }

    if (trimmed.length < 2) {
      result.errors.push({
        field: "name",
        message: "Name must be at least 2 characters",
        code: "NAME_TOO_SHORT",
      });
      return result;
    }

    if (trimmed.length > 30) {
      result.errors.push({
        field: "name",
        message: "Name must be 30 characters or less",
        code: "NAME_TOO_LONG",
      });
      return result;
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9\s_-]+$/.test(trimmed)) {
      result.errors.push({
        field: "name",
        message: "Name can only contain letters, numbers, spaces, hyphens, and underscores",
        code: "NAME_INVALID_CHARACTERS",
      });
      return result;
    }

    result.data = trimmed;
    result.success = true;

    // Warnings
    if (trimmed.length < 4) {
      result.warnings.push({
        field: "name",
        message: "Consider using a longer name for better personalization",
        code: "NAME_VERY_SHORT",
      });
    }

    // Check for common test names
    const testNames = ["test", "user", "name", "abc", "123"];
    if (testNames.some((tn) => trimmed.toLowerCase().includes(tn))) {
      result.warnings.push({
        field: "name",
        message: "This looks like a test name. Consider using your real name for a better experience.",
        code: "NAME_LIKE_TEST_DATA",
      });
    }

    debug.info("Name validated", { name: trimmed });
    return result;
  },

  generateSuggestions: (baseName: string): string[] => {
    const suggestions: string[] = [];

    if (baseName.length < 3) {
      suggestions.push(`${baseName}Pro`, `${baseName}Focus`, `Focus${baseName}`);
    }

    if (!/[A-Z]/.test(baseName)) {
      suggestions.push(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }

    return suggestions.slice(0, 3);
  },
};

// ============================================================================
// Step Validation
// ============================================================================

export function validateOnboardingStep(step: string, data: Record<string, unknown>): ValidationResult<void> {
  const result: ValidationResult<void> = {
    success: true,
    errors: [],
    warnings: [],
  };

  switch (step) {
    case "WELCOME":
      // No validation needed for welcome
      break;

    case "GOAL_SETTING":
      const goalResult = GoalValidators.validate(data.goal);
      if (!goalResult.success) {
        result.success = false;
        result.errors.push(...goalResult.errors);
      }
      break;

    case "FOCUS_TIME":
      const durationResult = DurationValidators.validate(data.focusDuration);
      if (!durationResult.success) {
        result.success = false;
        result.errors.push(...durationResult.errors);
      }

      // Cross-field validation: recommend duration based on goal
      if (data.goal && durationResult.success) {
        const recommended = DurationValidators.recommendForGoal(data.goal as FocusGoal);
        if (!recommended.includes(durationResult.data!)) {
          result.warnings.push({
            field: "focusDuration",
            message: `For ${data.goal} goals, we recommend ${recommended.slice(0, 2).join(" or ")} minute sessions`,
            code: "DURATION_NOT_RECOMMENDED_FOR_GOAL",
          });
        }
      }
      break;

    case "NAME_SETUP":
      const nameResult = NameValidators.validate(data.displayName);
      if (!nameResult.success) {
        result.success = false;
        result.errors.push(...nameResult.errors);
      }
      break;

    case "FIRST_SESSION_CTA":
      // Check all previous data is present
      const requiredFields = ["goal", "focusDuration", "displayName"];
      for (const field of requiredFields) {
        if (!data[field]) {
          result.warnings.push({
            field,
            message: `${field} is missing from onboarding data`,
            code: "MISSING_ONBOARDING_DATA",
          });
        }
      }
      break;

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

// ============================================================================
// Cross-Step Validation
// ============================================================================

export function validateCompleteOnboarding(state: Record<string, unknown>): ValidationResult<{
  goal: FocusGoal;
  focusDuration: FocusDuration;
  displayName: string;
}> {
  const result: ValidationResult<{
    goal: FocusGoal;
    focusDuration: FocusDuration;
    displayName: string;
  }> = {
    success: false,
    errors: [],
    warnings: [],
  };

  // Validate each field
  const goalResult = GoalValidators.validate(state.goal);
  const durationResult = DurationValidators.validate(state.focusDuration);
  const nameResult = NameValidators.validate(state.displayName);

  if (!goalResult.success) {
    result.errors.push(...goalResult.errors);
  }
  if (!durationResult.success) {
    result.errors.push(...durationResult.errors);
  }
  if (!nameResult.success) {
    result.errors.push(...nameResult.errors);
  }

  // Check for consistency
  if (goalResult.success && durationResult.success) {
    const recommended = DurationValidators.recommendForGoal(goalResult.data!);
    if (!recommended.includes(durationResult.data!)) {
      result.warnings.push({
        field: "consistency",
        message: `Your chosen duration may not be optimal for ${goalResult.data} goals`,
        code: "GOAL_DURATION_MISMATCH",
      });
    }
  }

  // Check completion timing
  const startedAt = state.startedAt as number | null;
  const completedAt = state.completedAt as number | null;

  if (startedAt && completedAt) {
    const duration = completedAt - startedAt;

    if (duration < 5000) {
      result.warnings.push({
        field: "timing",
        message: "Onboarding completed very quickly. Make sure you understood all the options.",
        code: "RAPID_COMPLETION",
      });
    }

    if (duration > 30 * 60 * 1000) {
      result.warnings.push({
        field: "timing",
        message: "Onboarding took over 30 minutes. You can always change these settings later.",
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

// ============================================================================
// Branching Logic
// ============================================================================

export function getNextRecommendedStep(currentStep: string, state: Record<string, unknown>): { step: string; reason: string } | null {
  switch (currentStep) {
    case "WELCOME":
      return { step: "GOAL_SETTING", reason: "First, let us understand your focus goals" };

    case "GOAL_SETTING":
      if (!state.goal) {
        return null; // Can't proceed without goal
      }
      return { step: "FOCUS_TIME", reason: "Now let us set your preferred focus duration" };

    case "FOCUS_TIME":
      if (!state.focusDuration) {
        return null; // Can't proceed without duration
      }
      // Skip name setup if they chose to skip
      if (state.skipName) {
        return { step: "FIRST_SESSION_CTA", reason: "Ready to start your first session!" };
      }
      return { step: "NAME_SETUP", reason: "Personalize your experience with a display name" };

    case "NAME_SETUP":
      return { step: "FIRST_SESSION_CTA", reason: "You are all set! Start your first focus session" };

    case "FIRST_SESSION_CTA":
      return null; // End of onboarding

    default:
      return null;
  }
}

export function canSkipStep(step: string, state: Record<string, unknown>): { canSkip: boolean; reason: string } {
  switch (step) {
    case "WELCOME":
      return { canSkip: true, reason: "You can skip the welcome, but we recommend viewing it" };

    case "GOAL_SETTING":
      return { canSkip: false, reason: "A focus goal is required to personalize your experience" };

    case "FOCUS_TIME":
      return { canSkip: false, reason: "Focus duration is required for session setup" };

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

// ============================================================================
// Export
// ============================================================================

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
