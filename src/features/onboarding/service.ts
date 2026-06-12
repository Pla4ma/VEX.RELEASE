import { useOnboardingStore } from './store';

/** Get onboarding state without React hook (safe for service layer). */
function getOnboardingState(): ReturnType<typeof useOnboardingStore.getState> {
  return useOnboardingStore.getState();
}
import {
  type FocusGoal,
  type FocusDuration,
  GoalOptionSchema,
  DurationOptionSchema,
} from './schemas';
export const GOAL_OPTIONS = [
  GoalOptionSchema.parse({
    key: 'WORK',
    label: 'Work',
    emoji: '',
    description: 'Meetings, emails, deep work',
  }),
  GoalOptionSchema.parse({
    key: 'STUDY',
    label: 'Study',
    emoji: '',
    description: 'Learning, reading, exams',
  }),
  GoalOptionSchema.parse({
    key: 'CREATIVE',
    label: 'Creative',
    emoji: '',
    description: 'Design, writing, art',
  }),
  GoalOptionSchema.parse({
    key: 'PERSONAL',
    label: 'Personal',
    emoji: '',
    description: 'Goals, habits, growth',
  }),
];
export const DURATION_OPTIONS = [
  DurationOptionSchema.parse({ value: 10, label: '10 min', emoji: '' }),
  DurationOptionSchema.parse({ value: 15, label: '15 min', emoji: '' }),
  DurationOptionSchema.parse({ value: 25, label: '25 min', emoji: '' }),
  DurationOptionSchema.parse({ value: 45, label: '45 min', emoji: '' }),
  DurationOptionSchema.parse({ value: 60, label: '60+ min', emoji: '' }),
];
const STEP_ORDER = [
  'WELCOME',
  'GOAL_SETTING',
  'FOCUS_TIME',
  'NAME_SETUP',
  'FIRST_SESSION_CTA',
] as const;
export function getStepName(stepNumber: number): (typeof STEP_ORDER)[number] {
  return STEP_ORDER[stepNumber] ?? 'WELCOME';
}
export function canGoBack(stepNumber: number): boolean {
  return stepNumber > 0;
}
export function canSkip(stepNumber: number): boolean {
  return stepNumber >= 1;
}
export function saveGoal(goal: FocusGoal): void {
  getOnboardingState().setGoal(goal);
}
export function saveFocusDuration(duration: FocusDuration): void {
  getOnboardingState().setFocusDuration(duration);
}
export function saveDisplayName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return false;
  }
  getOnboardingState().setDisplayName(trimmed);
  return true;
}
export function goToNextStep(): void {
  getOnboardingState().nextStep();
}
export function goToPreviousStep(): void {
  getOnboardingState().previousStep();
}
export function skipOnboarding(): void {
  getOnboardingState().skipOnboarding();
}
export function completeOnboarding(userId?: string | null): void {
  getOnboardingState().completeOnboarding(userId);
}
export class OnboardingError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'OnboardingError';
  }
}
export async function completeOnboardingWithGate(
  userId: string,
): Promise<void> {
  const { onboardingRepository } = await import('./repository');
  const state = await onboardingRepository.getProgress(userId);
  if (!state || !state.steps.firstSessionCompleted) {
    throw new OnboardingError(
      'ONBOARDING_INCOMPLETE',
      'Complete your first session to finish onboarding',
    );
  }
  await onboardingRepository.saveProgress(userId, {
    ...state,
    status: 'COMPLETED',
  });
}
export function resetOnboarding(): void {
  getOnboardingState().resetOnboarding();
}
const DEFAULT_FOCUS_DURATION_MINUTES = 10;
const ONBOARDING_TOTAL_STEPS = 4;
const SECONDS_PER_ONBOARDING_STEP = 15;
const ONBOARDING_STALL_TIMEOUT_MS = 5 * 60 * 1000;

export function getFirstSessionConfig(): {
  duration: number;
  category: FocusGoal | null;
  isOnboardingSession: true;
} {
  const state = getOnboardingState();
  const durationMinutes = state.focusDuration ?? DEFAULT_FOCUS_DURATION_MINUTES;
  return {
    duration: durationMinutes * 60,
    category: state.goal,
    isOnboardingSession: true,
  };
}
export function isOnboardingStalled(): boolean {
  const state = getOnboardingState();
  if (!state.startedAt) {
    return false;
  }
  const elapsed = Date.now() - state.startedAt;
  return elapsed > ONBOARDING_STALL_TIMEOUT_MS;
}
export function getEstimatedTimeRemaining(stepNumber: number): number {
  const remainingSteps = ONBOARDING_TOTAL_STEPS - stepNumber;
  return remainingSteps * SECONDS_PER_ONBOARDING_STEP;
}
