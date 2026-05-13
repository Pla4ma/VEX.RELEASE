import { z } from "zod";
import { createDebugger } from "../../../utils/debug";
import type { FocusGoal, FocusDuration } from "../schemas";


export function getNextRecommendedStep(currentStep: string, state: Record<string, unknown>): { step: string; reason: string } | null {
  switch (currentStep) {
    case 'WELCOME':
      return { step: 'GOAL_SETTING', reason: 'First, let us understand your focus goals' };

    case 'GOAL_SETTING':
      if (!state.goal) {
        return null; // Can't proceed without goal
      }
      return { step: 'FOCUS_TIME', reason: 'Now let us set your preferred focus duration' };

    case 'FOCUS_TIME':
      if (!state.focusDuration) {
        return null; // Can't proceed without duration
      }
      // Skip name setup if they chose to skip
      if (state.skipName) {
        return { step: 'FIRST_SESSION_CTA', reason: 'Ready to start your first session!' };
      }
      return { step: 'NAME_SETUP', reason: 'Personalize your experience with a display name' };

    case 'NAME_SETUP':
      return { step: 'FIRST_SESSION_CTA', reason: 'You are all set! Start your first focus session' };

    case 'FIRST_SESSION_CTA':
      return null; // End of onboarding

    default:
      return null;
  }
}

export function canSkipStep(step: string, state: Record<string, unknown>): { canSkip: boolean; reason: string } {
  switch (step) {
    case 'WELCOME':
      return { canSkip: true, reason: 'You can skip the welcome, but we recommend viewing it' };

    case 'GOAL_SETTING':
      return { canSkip: false, reason: 'A focus goal is required to personalize your experience' };

    case 'FOCUS_TIME':
      return { canSkip: false, reason: 'Focus duration is required for session setup' };

    case 'NAME_SETUP':
      return {
        canSkip: true,
        reason: 'You can skip this and we will use a default name',
      };

    case 'FIRST_SESSION_CTA':
      return {
        canSkip: true,
        reason: 'You can skip and explore the app first',
      };

    default:
      return { canSkip: false, reason: 'Unknown step' };
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