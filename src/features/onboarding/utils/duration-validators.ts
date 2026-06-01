import { createDebugger } from '../../../utils/debug';
import type { FocusDuration, FocusGoal } from '../types';
import type { ValidationResult } from './goal-validators';

const debug = createDebugger('onboarding:validation');
const ValidDurations = [15, 25, 45, 60] as const;

export const DurationValidators = {
  validate: (duration: unknown): ValidationResult<FocusDuration> => {
    const result: ValidationResult<FocusDuration> = {
      success: false,
      errors: [],
      warnings: [],
    };
    if (typeof duration !== 'number' || isNaN(duration)) {
      result.errors.push({
        field: 'duration',
        message: 'Duration must be a valid number',
        code: 'INVALID_DURATION_TYPE',
      });
      return result;
    }
    if (!ValidDurations.includes(duration as FocusDuration)) {
      const closest = ValidDurations.reduce((prev, curr) =>
        Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev,
      );
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
    if (duration === 15) {
      result.warnings.push({
        field: 'duration',
        message:
          '15-minute sessions are great for starting out, but consider longer sessions for deep work',
        code: 'SHORT_DURATION_WARNING',
      });
    } else if (duration === 60) {
      result.warnings.push({
        field: 'duration',
        message:
          '60-minute sessions require strong focus stamina. Consider starting with 25 or 45 minutes.',
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
