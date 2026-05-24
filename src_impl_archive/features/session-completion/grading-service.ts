import {
  SessionGradingInputSchema,
  SessionGradingResultSchema,
  type SessionGradeFactor,
  type SessionGradingInput,
  type SessionGradingResult,
} from './grading-schemas';
import type { SessionCompletionGrade } from './schemas';

const FACTOR_WEIGHTS = {
  backgroundTime: 10,
  completionRatio: 30,
  effectiveFocusTime: 20,
  interruptionCount: 15,
  pauseCount: 15,
  sessionMode: 5,
  strictMode: 5,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function scoreToGrade(score: number): SessionCompletionGrade {
  if (score >= 93) {return 'S';}
  if (score >= 84) {return 'A';}
  if (score >= 72) {return 'B';}
  if (score >= 60) {return 'C';}
  return 'D';
}

function gradeToLabel(grade: SessionCompletionGrade): string {
  const labels: Record<SessionCompletionGrade, string> = {
    A: 'Excellent focus run',
    B: 'Solid focus block',
    C: 'Usable progress block',
    D: 'Recovery needed',
    S: 'Peak focus execution',
  };
  return labels[grade];
}

function gradeToXpMultiplier(grade: SessionCompletionGrade): number {
  const multipliers: Record<SessionCompletionGrade, number> = {
    A: 1.2,
    B: 1,
    C: 0.85,
    D: 0.65,
    S: 1.35,
  };
  return multipliers[grade];
}

function gradeToFocusDelta(grade: SessionCompletionGrade, strictMode: boolean): number {
  const base: Record<SessionCompletionGrade, number> = {
    A: 8,
    B: 4,
    C: 0,
    D: -6,
    S: 12,
  };
  return base[grade] + (strictMode ? 1 : 0);
}

function buildFactors(input: SessionGradingInput): SessionGradeFactor[] {
  const completionTarget = input.isRecoverySession ? 0.7 : 1;
  const completionRatio = clamp(
    input.completedDurationSeconds / input.targetDurationSeconds,
    0,
    1.15,
  );
  const effectiveRatio = clamp(
    input.effectiveFocusedSeconds / Math.max(input.completedDurationSeconds, 1),
    0,
    1,
  );
  const completionScore = clamp((completionRatio / completionTarget) * 100, 0, 100);
  const effectiveScore = clamp(effectiveRatio * 100, 0, 100);
  const pausePenalty = input.pauseCount * (input.isRecoverySession ? 4 : 6);
  const interruptionPenalty = input.interruptionCount * (input.isRecoverySession ? 6 : 10);
  const backgroundPenalty = clamp(
    (input.backgroundTimeSeconds / input.targetDurationSeconds) * 100,
    0,
    100,
  );
  const modeScore = input.mode === 'RECOVERY' ? 90 : input.mode === 'CHALLENGE' ? 75 : 82;
  const strictScore = input.strictMode ? 100 : 72;

  return [
    {
      contribution: (completionScore * FACTOR_WEIGHTS.completionRatio) / 100,
      id: 'completionRatio',
      label: 'Completion ratio',
      reason: completionRatio >= 1 ? 'Hit full target duration.' : 'Closed partial target duration.',
      score: completionScore,
      weight: FACTOR_WEIGHTS.completionRatio,
    },
    {
      contribution: (effectiveScore * FACTOR_WEIGHTS.effectiveFocusTime) / 100,
      id: 'effectiveFocusTime',
      label: 'Effective focus time',
      reason: effectiveScore >= 85 ? 'Focused time stayed high.' : 'Focus drifted during the block.',
      score: effectiveScore,
      weight: FACTOR_WEIGHTS.effectiveFocusTime,
    },
    {
      contribution: (Math.max(0, 100 - pausePenalty) * FACTOR_WEIGHTS.pauseCount) / 100,
      id: 'pauseCount',
      label: 'Pause count',
      reason: input.pauseCount === 0 ? 'No pauses taken.' : `${input.pauseCount} pauses reduced quality.`,
      score: Math.max(0, 100 - pausePenalty),
      weight: FACTOR_WEIGHTS.pauseCount,
    },
    {
      contribution:
        (Math.max(0, 100 - interruptionPenalty) * FACTOR_WEIGHTS.interruptionCount) / 100,
      id: 'interruptionCount',
      label: 'Interruption count',
      reason:
        input.interruptionCount === 0
          ? 'No interruptions detected.'
          : `${input.interruptionCount} interruptions impacted flow.`,
      score: Math.max(0, 100 - interruptionPenalty),
      weight: FACTOR_WEIGHTS.interruptionCount,
    },
    {
      contribution: (strictScore * FACTOR_WEIGHTS.strictMode) / 100,
      id: 'strictMode',
      label: 'Strict mode',
      reason: input.strictMode ? 'Strict mode improved quality confidence.' : 'Standard mode applied.',
      score: strictScore,
      weight: FACTOR_WEIGHTS.strictMode,
    },
    {
      contribution: (modeScore * FACTOR_WEIGHTS.sessionMode) / 100,
      id: 'sessionMode',
      label: 'Session mode',
      reason: input.isRecoverySession
        ? 'Recovery session judged against recovery goals.'
        : 'Mode weighting applied for difficulty.',
      score: modeScore,
      weight: FACTOR_WEIGHTS.sessionMode,
    },
    {
      contribution: (Math.max(0, 100 - backgroundPenalty) * FACTOR_WEIGHTS.backgroundTime) / 100,
      id: 'backgroundTime',
      label: 'Background time',
      reason: input.backgroundTimeSeconds === 0 ? 'Stayed present in-app.' : 'Background time reduced continuity.',
      score: Math.max(0, 100 - backgroundPenalty),
      weight: FACTOR_WEIGHTS.backgroundTime,
    },
  ];
}

export function calculateSessionGrade(rawInput: SessionGradingInput): SessionGradingResult {
  const input = SessionGradingInputSchema.parse(rawInput);
  if (input.isAbandoned) {
    return SessionGradingResultSchema.parse({
      abandonmentReason: 'Session ended before a full completion result could be scored.',
      focusScoreImpactRecommendation: -8,
      kind: 'abandoned',
      userFacingReason: 'Session was abandoned, so this result is tracked as recovery-needed.',
      xpQualityMultiplier: 0.4,
    });
  }

  const factors = buildFactors(input);
  let gradeScore = clamp(
    factors.reduce((sum, factor) => sum + factor.contribution, 0),
    0,
    100,
  );

  if (input.targetDurationSeconds <= 15 * 60 && input.interruptionCount <= 1 && input.pauseCount <= 1) {
    gradeScore = Math.max(gradeScore, 82);
  }
  if (input.isRecoverySession && input.completedDurationSeconds >= input.targetDurationSeconds * 0.65) {
    gradeScore = clamp(gradeScore + 8, 0, 100);
  }

  const roundedScore = Math.round(gradeScore);
  const grade = scoreToGrade(roundedScore);
  const sortedFactors = [...factors].sort((a, b) => b.score - a.score);
  const strongest = sortedFactors[0]!;
  const weakest = sortedFactors[sortedFactors.length - 1]!;
  const userFacingReason = `${strongest.label} held up well. ${weakest.label} was the main drag.`;

  return SessionGradingResultSchema.parse({
    factorBreakdown: factors,
    focusScoreImpactRecommendation: gradeToFocusDelta(grade, input.strictMode),
    grade,
    gradeLabel: gradeToLabel(grade),
    gradeScore: roundedScore,
    kind: 'completed',
    qualityScore: roundedScore,
    userFacingReason,
    xpQualityMultiplier: gradeToXpMultiplier(grade),
  });
}
