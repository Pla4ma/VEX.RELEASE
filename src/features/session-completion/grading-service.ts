import {
  SessionGradingInputSchema,
  SessionGradingResultSchema,
  type SessionGradingInput,
  type SessionGradingResult,
} from './grading-schemas';
import { clamp, scoreToGrade, gradeToLabel, gradeToXpMultiplier, gradeToFocusDelta } from './grading-helpers';
import { buildFactors } from './grading-factors';

export function calculateSessionGrade(
  rawInput: SessionGradingInput,
): SessionGradingResult {
  const input = SessionGradingInputSchema.parse(rawInput);
  if (input.isAbandoned) {
    return SessionGradingResultSchema.parse({
      abandonmentReason:
        'Session ended before a full completion result could be scored.',
      focusScoreImpactRecommendation: -8,
      kind: 'abandoned',
      userFacingReason:
        'Session was abandoned, so this result is tracked as recovery-needed.',
      xpQualityMultiplier: 0.4,
    });
  }

  const factors = buildFactors(input);
  let gradeScore = clamp(
    factors.reduce((sum, factor) => sum + factor.contribution, 0),
    0,
    100,
  );

  if (
    input.targetDurationSeconds <= 15 * 60 &&
    input.interruptionCount <= 1 &&
    input.pauseCount <= 1
  ) {
    gradeScore = Math.max(gradeScore, 82);
  }
  if (
    input.isRecoverySession &&
    input.completedDurationSeconds >= input.targetDurationSeconds * 0.65
  ) {
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
