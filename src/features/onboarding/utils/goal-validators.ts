import { createDebugger } from '../../../utils/debug';
import type { FocusGoal } from '../types';

const debug = createDebugger('onboarding:validation');

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

const ValidGoals = ['WORK', 'STUDY', 'CREATIVE', 'PERSONAL'] as const;

export const GoalValidators = {
  validate: (goal: unknown): ValidationResult<FocusGoal> => {
    const result: ValidationResult<FocusGoal> = {
      success: false,
      errors: [],
      warnings: [],
    };
    if (
      typeof goal !== 'string' ||
      !(ValidGoals as readonly string[]).includes(goal)
    ) {
      result.errors.push({
        field: 'goal',
        message: 'Please select a valid focus goal',
        code: 'INVALID_GOAL',
      });
      return result;
    }
    result.data = goal as FocusGoal;
    result.success = true;
    debug.info('Goal validated', { goal });
    return result;
  },

  getSuggestions: (partialGoal: string): FocusGoal[] => {
    const matches: FocusGoal[] = [];
    const partial = partialGoal.toLowerCase();
    if ('work'.includes(partial) || partial.includes('work'))
      {matches.push('WORK');}
    if ('study'.includes(partial) || partial.includes('study'))
      {matches.push('STUDY');}
    if ('creative'.includes(partial) || partial.includes('creative'))
      {matches.push('CREATIVE');}
    if ('personal'.includes(partial) || partial.includes('personal'))
      {matches.push('PERSONAL');}
    return matches;
  },
};
