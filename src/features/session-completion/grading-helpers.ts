import type { SessionCompletionGrade } from './schemas';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function scoreToGrade(score: number): SessionCompletionGrade {
  if (score >= 95) {
    return 'S';
  }
  if (score >= 85) {
    return 'A';
  }
  if (score >= 72) {
    return 'B';
  }
  if (score >= 55) {
    return 'C';
  }
  return 'D';
}

export function gradeToLabel(grade: SessionCompletionGrade): string {
  const labels: Record<SessionCompletionGrade, string> = {
    S: 'Signal perfect',
    A: 'Strong focus',
    B: 'Solid work',
    C: 'Recovered',
    D: 'Needs reset',
  };
  return labels[grade];
}

export function gradeToXpMultiplier(grade: SessionCompletionGrade): number {
  const multipliers: Record<SessionCompletionGrade, number> = {
    S: 1.6,
    A: 1.3,
    B: 1,
    C: 0.75,
    D: 0.45,
  };
  return multipliers[grade];
}

export function gradeToFocusDelta(
  grade: SessionCompletionGrade,
  strictMode: boolean,
): number {
  const base: Record<SessionCompletionGrade, number> = {
    S: 10,
    A: 7,
    B: 3,
    C: 0,
    D: -5,
  };
  return base[grade] + (strictMode && grade !== 'D' ? 1 : 0);
}
