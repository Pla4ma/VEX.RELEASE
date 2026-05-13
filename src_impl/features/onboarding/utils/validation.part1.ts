import { z } from "zod";
import { createDebugger } from "../../../utils/debug";
import type { FocusGoal, FocusDuration } from "../schemas";


export const OnboardingGoalSchema = z.enum(ValidGoals, {
  errorMap: () => ({ message: 'Please select a valid focus goal' }),
});

export const OnboardingDurationSchema = z.number().refine((val): val is FocusDuration => ValidDurations.includes(val as FocusDuration), {
  message: 'Please select a valid focus duration (10, 15, 25, 45, or 60 minutes)',
});

export const OnboardingNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(30, 'Name must be 30 characters or less')
  .regex(/^[a-zA-Z0-9\s_-]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores')
  .transform((val) => val.trim());

export const OnboardingStepSchema = z.enum(['WELCOME', 'GOAL_SETTING', 'FOCUS_TIME', 'NAME_SETUP', 'FIRST_SESSION_CTA']);

export const OnboardingStateSchema = z.object({
  isOnboarded: z.boolean(),
  currentStep: z.number().min(0).max(4),
  goal: OnboardingGoalSchema.nullable(),
  focusDuration: OnboardingDurationSchema.nullable(),
  displayName: OnboardingNameSchema.nullable(),
  startedAt: z.number().nullable(),
  completedAt: z.number().nullable(),
});

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
        field: 'goal',
        message: parsed.error.errors[0]?.message || 'Invalid goal selected',
        code: 'INVALID_GOAL',
      });
      return result;
    }

    result.data = parsed.data;
    result.success = true;

    debug.info('Goal validated', { goal: parsed.data });
    return result;
  },

  getSuggestions: (partialGoal: string): FocusGoal[] => {
    const matches: FocusGoal[] = [];
    const partial = partialGoal.toLowerCase();

    if ('work'.includes(partial) || partial.includes('work')) {
      matches.push('WORK');
    }
    if ('study'.includes(partial) || partial.includes('study')) {
      matches.push('STUDY');
    }
    if ('creative'.includes(partial) || partial.includes('creative')) {
      matches.push('CREATIVE');
    }
    if ('personal'.includes(partial) || partial.includes('personal')) {
      matches.push('PERSONAL');
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
    if (typeof duration !== 'number' || isNaN(duration)) {
      result.errors.push({
        field: 'duration',
        message: 'Duration must be a valid number',
        code: 'INVALID_DURATION_TYPE',
      });
      return result;
    }

    // Check if it's one of the allowed values
    if (!ValidDurations.includes(duration as FocusDuration)) {
      // Find closest valid duration
      const closest = ValidDurations.reduce((prev, curr) => (Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev));

      result.errors.push({
        field: 'duration',
        message: `Invalid duration. Did you mean ${closest} minutes?`,
        code: 'INVALID_DURATION_VALUE',
      });

      result.suggestions = ValidDurations.map((d) => `${d} minutes`);
      return result;
    }

    result.data = duration as FocusDuration;
    result.success = true;

    // Add warnings for extreme durations
    if (duration === 15) {
      result.warnings.push({
        field: 'duration',
        message: '15-minute sessions are great for starting out, but consider longer sessions for deep work',
        code: 'SHORT_DURATION_WARNING',
      });
    } else if (duration === 60) {
      result.warnings.push({
        field: 'duration',
        message: '60-minute sessions require strong focus stamina. Consider starting with 25 or 45 minutes.',
        code: 'LONG_DURATION_WARNING',
      });
    }

    debug.info('Duration validated', { duration });
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

    if (typeof name !== 'string') {
      result.errors.push({
        field: 'name',
        message: 'Name must be a string',
        code: 'INVALID_NAME_TYPE',
      });
      return result;
    }

    const trimmed = name.trim();

    if (trimmed.length === 0) {
      result.errors.push({
        field: 'name',
        message: 'Name is required',
        code: 'NAME_REQUIRED',
      });
      return result;
    }

    if (trimmed.length < 2) {
      result.errors.push({
        field: 'name',
        message: 'Name must be at least 2 characters',
        code: 'NAME_TOO_SHORT',
      });
      return result;
    }

    if (trimmed.length > 30) {
      result.errors.push({
        field: 'name',
        message: 'Name must be 30 characters or less',
        code: 'NAME_TOO_LONG',
      });
      return result;
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9\s_-]+$/.test(trimmed)) {
      result.errors.push({
        field: 'name',
        message: 'Name can only contain letters, numbers, spaces, hyphens, and underscores',
        code: 'NAME_INVALID_CHARACTERS',
      });
      return result;
    }

    result.data = trimmed;
    result.success = true;

    // Warnings
    if (trimmed.length < 4) {
      result.warnings.push({
        field: 'name',
        message: 'Consider using a longer name for better personalization',
        code: 'NAME_VERY_SHORT',
      });
    }

    // Check for common test names
    const testNames = ['test', 'user', 'name', 'abc', '123'];
    if (testNames.some((tn) => trimmed.toLowerCase().includes(tn))) {
      result.warnings.push({
        field: 'name',
        message: 'This looks like a test name. Consider using your real name for a better experience.',
        code: 'NAME_LIKE_TEST_DATA',
      });
    }

    debug.info('Name validated', { name: trimmed });
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