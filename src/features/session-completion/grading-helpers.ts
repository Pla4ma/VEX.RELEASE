import type { SessionCompletionGrade } from "./schemas";

export const FACTOR_WEIGHTS = {
  backgroundTime: 10,
  completionRatio: 30,
  effectiveFocusTime: 20,
  interruptionCount: 15,
  pauseCount: 15,
  sessionMode: 5,
  strictMode: 5,
} as const;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function scoreToGrade(score: number): SessionCompletionGrade {
  if (score >= 93) {
    return "S";
  }
  if (score >= 84) {
    return "A";
  }
  if (score >= 72) {
    return "B";
  }
  if (score >= 60) {
    return "C";
  }
  return "D";
}

export function gradeToLabel(grade: SessionCompletionGrade): string {
  const labels: Record<SessionCompletionGrade, string> = {
    A: "Excellent focus run",
    B: "Solid focus block",
    C: "Usable progress block",
    D: "Recovery needed",
    S: "Peak focus execution",
  };
  return labels[grade];
}

export function gradeToXpMultiplier(grade: SessionCompletionGrade): number {
  const multipliers: Record<SessionCompletionGrade, number> = {
    A: 1.2,
    B: 1,
    C: 0.85,
    D: 0.65,
    S: 1.35,
  };
  return multipliers[grade];
}

export function gradeToFocusDelta(
  grade: SessionCompletionGrade,
  strictMode: boolean,
): number {
  const base: Record<SessionCompletionGrade, number> = {
    A: 8,
    B: 4,
    C: 0,
    D: -6,
    S: 12,
  };
  return base[grade] + (strictMode ? 1 : 0);
}
