/**
 * Onboarding Configuration
 *
 * Goal/duration options, first-session config, and timing utilities.
 */

import { useOnboardingStore } from './store';
import { GoalOptionSchema, DurationOptionSchema } from './schemas';
import type { FocusGoal } from './schemas';

// ============================================================================
// Goal Options
// ============================================================================

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

// ============================================================================
// Duration Options
// ============================================================================

export const DURATION_OPTIONS = [
  DurationOptionSchema.parse({
    value: 10,
    label: '10 min',
    emoji: '🌱',
  }),
  DurationOptionSchema.parse({
    value: 15,
    label: '15 min',
    emoji: '⚡',
  }),
  DurationOptionSchema.parse({
    value: 25,
    label: '25 min',
    emoji: '🍅',
  }),
  DurationOptionSchema.parse({
    value: 45,
    label: '45 min',
    emoji: '⏱️',
  }),
  DurationOptionSchema.parse({
    value: 60,
    label: '60+ min',
    emoji: '🚀',
  }),
];

// ============================================================================
// First Session Configuration
// ============================================================================

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

// ============================================================================
// Timing
// ============================================================================

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
