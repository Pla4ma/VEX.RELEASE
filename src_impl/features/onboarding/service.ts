/**
 * Onboarding Service
 *
 * Business logic and orchestration for onboarding flow.
 * Dependencies: user profile updates, session creation
 * @phase 2
 */

import { useOnboardingStore } from "./store";
import { type FocusGoal, type FocusDuration, GoalOptionSchema, DurationOptionSchema } from "./schemas";

// ============================================================================
// Goal Options
// ============================================================================

export const GOAL_OPTIONS = [
  GoalOptionSchema.parse({
    key: "WORK",
    label: "Work",
    emoji: "💼",
    description: "Meetings, emails, deep work",
  }),
  GoalOptionSchema.parse({
    key: "STUDY",
    label: "Study",
    emoji: "📚",
    description: "Learning, reading, exams",
  }),
  GoalOptionSchema.parse({
    key: "CREATIVE",
    label: "Creative",
    emoji: "🎨",
    description: "Design, writing, art",
  }),
  GoalOptionSchema.parse({
    key: "PERSONAL",
    label: "Personal",
    emoji: "🌱",
    description: "Goals, habits, growth",
  }),
];

// ============================================================================
// Duration Options
// ============================================================================

export const DURATION_OPTIONS = [
  DurationOptionSchema.parse({
    value: 10,
    label: "10 min",
    emoji: "🌱",
  }),
  DurationOptionSchema.parse({
    value: 15,
    label: "15 min",
    emoji: "⚡",
  }),
  DurationOptionSchema.parse({
    value: 25,
    label: "25 min",
    emoji: "🍅",
  }),
  DurationOptionSchema.parse({
    value: 45,
    label: "45 min",
    emoji: "⏱️",
  }),
  DurationOptionSchema.parse({
    value: 60,
    label: "60+ min",
    emoji: "🚀",
  }),
];

// ============================================================================
// Step Navigation
// ============================================================================

const STEP_ORDER = ["WELCOME", "GOAL_SETTING", "FOCUS_TIME", "NAME_SETUP", "FIRST_SESSION_CTA"] as const;

/**
 * Get current step name from step number
 */
export function getStepName(stepNumber: number): (typeof STEP_ORDER)[number] {
  return STEP_ORDER[stepNumber] ?? "WELCOME";
}

/**
 * Check if user can go back from current step
 */
export function canGoBack(stepNumber: number): boolean {
  return stepNumber > 0;
}

/**
 * Check if user can skip from current step
 */
export function canSkip(stepNumber: number): boolean {
  return stepNumber >= 1; // Can skip from Goal Setting onward
}

// ============================================================================
// Onboarding Actions
// ============================================================================

/**
 * Save user goal preference
 */
export function saveGoal(goal: FocusGoal): void {
  useOnboardingStore.getState().setGoal(goal);
}

/**
 * Save focus duration preference
 */
export function saveFocusDuration(duration: FocusDuration): void {
  useOnboardingStore.getState().setFocusDuration(duration);
}

/**
 * Save display name
 */
export function saveDisplayName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return false;
  }
  useOnboardingStore.getState().setDisplayName(trimmed);
  return true;
}

/**
 * Advance to next step
 */
export function goToNextStep(): void {
  useOnboardingStore.getState().nextStep();
}

/**
 * Go back to previous step
 */
export function goToPreviousStep(): void {
  useOnboardingStore.getState().previousStep();
}

/**
 * Skip onboarding (mark as complete)
 */
export function skipOnboarding(): void {
  useOnboardingStore.getState().skipOnboarding();
}

/**
 * Complete onboarding (legacy - store only)
 */
export function completeOnboarding(): void {
  useOnboardingStore.getState().completeOnboarding();
}

// ============================================================================
// Phase 3: First Session Gate Service
// ============================================================================

export class OnboardingError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "OnboardingError";
  }
}

/**
 * Complete onboarding with first session requirement
 * HARD REQUIREMENT: Cannot complete without first session
 */
export async function completeOnboardingWithGate(userId: string): Promise<void> {
  const { onboardingRepository } = await import("./repository");
  const state = await onboardingRepository.getProgress(userId);

  // HARD REQUIREMENT: Cannot complete without first session
  if (!state || !state.steps.firstSessionCompleted) {
    throw new OnboardingError("ONBOARDING_INCOMPLETE", "Complete your first session to finish onboarding");
  }

  await onboardingRepository.saveProgress(userId, {
    ...state,
    status: "COMPLETED",
  });
}

/**
 * Reset onboarding (for testing)
 */
export function resetOnboarding(): void {
  useOnboardingStore.getState().resetOnboarding();
}

// ============================================================================
// First Session Configuration
// ============================================================================

/**
 * Get session configuration for first session
 */
export function getFirstSessionConfig(): {
  duration: number; // seconds
  category: FocusGoal | null;
  isOnboardingSession: true;
} {
  const state = useOnboardingStore.getState();
  const durationMinutes = state.focusDuration ?? 10; // Default 10 min starter session

  return {
    duration: durationMinutes * 60,
    category: state.goal,
    isOnboardingSession: true,
  };
}

// ============================================================================
// Timing
// ============================================================================

/**
 * Check if onboarding is taking too long (> 5 minutes)
 */
export function isOnboardingStalled(): boolean {
  const state = useOnboardingStore.getState();
  if (!state.startedAt) {
    return false;
  }

  const elapsed = Date.now() - state.startedAt;
  return elapsed > 5 * 60 * 1000; // 5 minutes
}

/**
 * Get estimated time to complete remaining steps
 */
export function getEstimatedTimeRemaining(stepNumber: number): number {
  const remainingSteps = 4 - stepNumber;
  // Each step takes ~15 seconds on average
  return remainingSteps * 15;
}
