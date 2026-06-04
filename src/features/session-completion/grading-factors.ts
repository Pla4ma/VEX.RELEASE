import type { SessionGradingInput, SessionGradeFactor } from './grading-schemas';
import { clamp } from './grading-helpers';

function factor(
  id: SessionGradeFactor['id'],
  label: string,
  score: number,
  weight: number,
  reason: string,
): SessionGradeFactor {
  const normalized = clamp(score, 0, 100);
  return {
    contribution: (normalized * weight) / 100,
    id,
    label,
    reason,
    score: normalized,
    weight,
  };
}

export function buildFactors(input: SessionGradingInput): SessionGradeFactor[] {
  const completionRatio =
    input.completedDurationSeconds / input.targetDurationSeconds;
  const focusRatio =
    input.effectiveFocusedSeconds / input.targetDurationSeconds;
  const pausePenalty = input.pauseCount * 12;
  const interruptionPenalty = input.interruptionCount * 14;
  const backgroundPenalty = Math.min(30, input.backgroundTimeSeconds / 12);

  return [
    factor(
      'completionRatio',
      'Completion',
      completionRatio * 100,
      28,
      'Target time completed',
    ),
    factor(
      'effectiveFocusTime',
      'Focus time',
      focusRatio * 100,
      32,
      'Effective focus held',
    ),
    factor('pauseCount', 'Pause control', 100 - pausePenalty, 12, 'Pause drag'),
    factor(
      'interruptionCount',
      'Interruptions',
      100 - interruptionPenalty,
      14,
      'Interruptions limited',
    ),
    factor(
      'strictMode',
      'Strict mode',
      input.strictMode ? 100 : 84,
      6,
      'Commitment pressure',
    ),
    factor('sessionMode', 'Mode fit', 88, 4, 'Mode matched session'),
    factor(
      'backgroundTime',
      'Background time',
      100 - backgroundPenalty,
      4,
      'App stayed present',
    ),
  ];
}
