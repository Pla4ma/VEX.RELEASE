/**
 * Companion Mood Calculation
 *
 * Pure functions for determining companion mood from session state
 * and generating mood-appropriate messages.
 */

import type { CompanionMood } from './types';

export function calculateMood(
  progress: number,
  energy: number,
  purity: number,
): CompanionMood {
  if (purity < 30 && energy < 20) {
    return 'DANGER';
  }
  if (energy < 30) {
    return 'STRUGGLING';
  }
  if (progress > 95 && energy > 80 && purity > 90) {
    return 'ECSTATIC';
  }
  if (progress > 70 && energy > 60) {
    return 'DETERMINED';
  }
  if (progress > 30 && energy > 50 && purity > 70) {
    return 'FOCUSED';
  }
  if (progress > 10 && energy > 30) {
    return 'CONTENT';
  }
  return 'SLEEPY';
}

export function getMoodMessage(mood: CompanionMood): string {
  return {
    SLEEPY: 'Your companion stirs...',
    CONTENT: 'Your companion is at peace.',
    FOCUSED: 'Your companion focuses with you.',
    DETERMINED: 'Your companion pushes forward!',
    ECSTATIC: 'Your companion radiates pure energy!',
    STRUGGLING: 'Your companion needs your focus...',
    DANGER: 'Your companion is fading! Stay focused!',
  }[mood];
}
