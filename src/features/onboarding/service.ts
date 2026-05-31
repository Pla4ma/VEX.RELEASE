import { useOnboardingStore } from './store';
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
    emoji: '💼',
    description: 'Meetings, emails, deep work',
  }),
  GoalOptionSchema.parse({
    key: 'STUDY',
    label: 'Study',
    emoji: '📚',
    description: 'Learning, reading, exams',
  }),
  GoalOptionSchema.parse({
    key: 'CREATIVE',
    label: 'Creative',
    emoji: '🎨',
    description: 'Design, writing, art',
  }),
  GoalOptionSchema.parse({
    key: 'PERSONAL',
    label: 'Personal',
    emoji: '🌱',
    description: 'Goals, habits, growth',
  }),
];
export const DURATION_OPTIONS = [
  DurationOptionSchema.parse({ value: 10, label: '10 min', emoji: '🌱' }),
  DurationOptionSchema.parse({ value: 15, label: '15 min', emoji: '⚡' }),
  DurationOptionSchema.parse({ value: 25, label: '25 min', emoji: '🍅' }),
  DurationOptionSchema.parse({ value: 45, label: '45 min', emoji: '⏱️' }),
  DurationOptionSchema.parse({ value: 60, label: '60+ min', emoji: '🚀' }),
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
  useOnboardingStore.getState().setGoal(goal);
}
export function saveFocusDuration(duration: FocusDuration): void {
  useOnboardingStore.getState().setFocusDuration(duration);
}
export function saveDisplayName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return false;
  }
  useOnboardingStore.getState().setDisplayName(trimmed);
  return true;
}
export function goToNextStep(): void {
  useOnboardingStore.getState().nextStep();
}
export function goToPreviousStep(): void {
  useOnboardingStore.getState().previousStep();
}
export function skipOnboarding(): void {
  useOnboardingStore.getState().skipOnboarding();
}
export function completeOnboarding(): void {
  useOnboardingStore.getState().completeOnboarding();
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
  useOnboardingStore.getState().resetOnboarding();
}
export function getFirstSessionConfig(): {
  duration: number;
  category: FocusGoal | null;
  isOnboardingSession: true;
} {
  const state = useOnboardingStore.getState();
  const durationMinutes = state.focusDuration ?? 10;
  return {
    duration: durationMinutes * 60,
    category: state.goal,
    isOnboardingSession: true,
  };
}
export function isOnboardingStalled(): boolean {
  const state = useOnboardingStore.getState();
  if (!state.startedAt) {
    return false;
  }
  const elapsed = Date.now() - state.startedAt;
  return elapsed > 5 * 60 * 1000;
}
export function getEstimatedTimeRemaining(stepNumber: number): number {
  const remainingSteps = 4 - stepNumber;
  return remainingSteps * 15;
}
