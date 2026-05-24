/**
 * Onboarding Types
 *
 * Domain types for the onboarding flow.
 * @phase 2
 */

// Re-export CompanionElement from companion feature
export type { CompanionElement } from '../companion/types';

/**
 * Onboarding step identifier
 */
export type OnboardingStep =
  | 'WELCOME'
  | 'GOAL_SETTING'
  | 'FOCUS_TIME'
  | 'NAME_SETUP'
  | 'FIRST_SESSION_CTA';

/**
 * User focus goal category
 */
export type FocusGoal = 'WORK' | 'STUDY' | 'CREATIVE' | 'PERSONAL';

/**
 * Focus duration preference
 */
export type FocusDuration = 15 | 25 | 45 | 60;

/**
 * Onboarding state
 */
export interface OnboardingState {
  isOnboarded: boolean;
  currentStep: number; // 0-4
  goal: FocusGoal | null;
  focusDuration: FocusDuration | null;
  displayName: string | null;
  startedAt: number | null;
  completedAt: number | null;
}

/**
 * Onboarding progress
 */
export interface OnboardingProgress {
  step: OnboardingStep;
  stepNumber: number;
  totalSteps: number;
  percentComplete: number;
  canSkip: boolean;
}

/**
 * Goal option for UI
 */
export interface GoalOption {
  key: FocusGoal;
  label: string;
  emoji: string;
  description: string;
}

/**
 * Duration option for UI
 */
export interface DurationOption {
  value: FocusDuration;
  label: string;
  emoji: string;
}

/**
 * Tooltip sequence state
 */
export interface TooltipState {
  currentTooltip: number; // 0-2
  hasShownStreakTooltip: boolean;
  hasShownBossTooltip: boolean;
  hasShownChallengeTooltip: boolean;
}
