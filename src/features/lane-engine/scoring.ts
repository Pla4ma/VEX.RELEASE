import type {
  MotivationStyle,
  PrimaryGoal,
} from '../personalization/core-schemas';
import type { Lane, LaneEvidence } from './types';

export type LaneScores = Record<Lane, number>;

export function createScores(): LaneScores {
  return { student: 0, game_like: 0, deep_creative: 0, minimal_normal: 0 };
}

export function addGoalScore(
  scores: LaneScores,
  goal: PrimaryGoal | null | undefined,
): void {
  if (goal === 'study' || goal === 'learning') {
    scores.student += 0.55;
    scores.deep_creative += 0.1;
  } else if (goal === 'creative') {
    scores.deep_creative += 0.55;
    scores.minimal_normal += 0.05;
  } else if (goal === 'work' || goal === 'focus') {
    scores.student += 0.1;
    scores.deep_creative += 0.25;
    scores.minimal_normal += 0.25;
  } else if (goal === 'personal') {
    scores.game_like += 0.05;
    scores.deep_creative += 0.1;
    scores.minimal_normal += 0.35;
  }
}

export function addStyleScore(
  scores: LaneScores,
  style: MotivationStyle | null | undefined,
): void {
  if (style === 'study_focused') {
    scores.student += 0.6;
    scores.deep_creative += 0.15;
  } else if (style === 'game_like' || style === 'intense') {
    scores.game_like += 0.6;
  } else if (style === 'calm') {
    scores.game_like -= 0.2;
    scores.deep_creative += 0.05;
    scores.minimal_normal += 0.5;
  } else if (style === 'coach_led' || style === 'friendly') {
    scores.student += 0.15;
    scores.game_like += 0.05;
    scores.deep_creative += 0.15;
    scores.minimal_normal += 0.2;
  }
}

export function makeEvidence(
  source: LaneEvidence['source'],
  value: string,
  weight: number,
  observedAt: number,
): LaneEvidence {
  return { source, value, weight, observedAt };
}
