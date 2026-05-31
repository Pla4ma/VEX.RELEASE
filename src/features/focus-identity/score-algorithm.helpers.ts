import type { FocusScoreFactorKey, FocusScoreUpdateInput } from './types';
import { MAX_FOCUS_SCORE, MIN_FOCUS_SCORE } from './schemas';

export const FACTOR_WEIGHTS = {
  consistency: 35,
  streakStability: 25,
  sessionQuality: 20,
  intentionalDifficulty: 7,
  contractCompletion: 8,
  recency: 5,
} as const;

export const FACTOR_LABELS: Record<FocusScoreFactorKey, string> = {
  consistency: 'Consistency',
  streakStability: 'Streak stability',
  sessionQuality: 'Session quality',
  intentionalDifficulty: 'Intentional difficulty',
  contractCompletion: 'Contract completion',
  recency: 'Recency',
};

export function clampScore(score: number): number {
  return Math.max(MIN_FOCUS_SCORE, Math.min(MAX_FOCUS_SCORE, score));
}

export function getBand(score: number): 'Legendary' | 'Elite' | 'Exceptional' | 'Strong' | 'Good' | 'Fair' | 'Building' {
  if (score >= 800) {return 'Legendary';}
  if (score >= 740) {return 'Elite';}
  if (score >= 670) {return 'Exceptional';}
  if (score >= 580) {return 'Strong';}
  if (score >= 500) {return 'Good';}
  if (score >= 420) {return 'Fair';}
  return 'Building';
}

export function getFactorExplanation(key: FocusScoreFactorKey, score: number): string {
  const label = FACTOR_LABELS[key];
  if (score >= 80) {return `${label} is a clear strength right now.`;}
  if (score >= 60) {return `${label} is helping your score stay stable.`;}
  if (score >= 40) {return `${label} is neutral and can improve with consistency.`;}
  return `${label} is dragging momentum and needs focused attention.`;
}

export function getGradeAdjustment(input: FocusScoreUpdateInput): number {
  if (input.eventType === 'session:abandoned') {return -12;}
  const byGrade: Record<NonNullable<FocusScoreUpdateInput['grade']>, number> = {
    S: 14, A: 9, B: 4, C: -2, D: -8,
  };
  return input.grade ? byGrade[input.grade] : 0;
}

export function getModeAdjustment(input: FocusScoreUpdateInput): number {
  const byMode: Record<
    NonNullable<FocusScoreUpdateInput['sessionMode']>,
    number
  > = { deep_work: 3, standard: 1, starter: 2, recovery: 0 };
  if (!input.sessionMode) {return 0;}
  if (input.sessionMode === 'recovery' && input.grade === 'S') {return 1;}
  return byMode[input.sessionMode];
}

export function getXpMultiplier(input: FocusScoreUpdateInput): number {
  if (input.eventType === 'session:abandoned') {return 0.5;}
  const byGrade: Record<NonNullable<FocusScoreUpdateInput['grade']>, number> = {
    S: 1.8, A: 1.4, B: 1.1, C: 0.9, D: 0.75,
  };
  const gradeMultiplier = input.grade ? byGrade[input.grade] : 1;
  if (input.sessionMode === 'recovery') {return Math.min(1.05, gradeMultiplier);}
  return gradeMultiplier;
}
