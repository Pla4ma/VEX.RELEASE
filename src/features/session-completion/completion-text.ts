import type { CompletionReflectionInput } from './schemas';
import type {
  CompletionMemoryCandidate,
  CompletionPersonalizationInput,
  CompletionUnlockDecision,
  CompletionUserFacingSummary,
} from './schemas';
import type { Lane } from '../lane-engine/types';
import type { SessionSummary } from '../../session/types';

type Situation = 'abandoned' | 'clean' | 'comeback' | 'partial';
type Display = {
  body: string;
  title: string;
  tone: 'calm' | 'coach' | 'study' | 'intense';
};

export const REFLECTIONS: Record<Lane, Record<Situation, string>> = {
  deep_creative: {
    comeback: 'What helped you restart today?',
    abandoned: 'What got in the way?',
    clean: 'What can you repeat next time?',
    partial: 'What made this block useful?',
  },
  game_like: {
    comeback: 'What move got you back in?',
    abandoned: 'What broke the run?',
    clean: 'What powered this win?',
    partial: 'What kept the run alive?',
  },
  minimal_normal: {
    comeback: 'What made returning possible?',
    abandoned: 'What interrupted the plan?',
    clean: 'What should stay the same?',
    partial: 'What worked in this session?',
  },
  student: {
    comeback: 'What helped you resume studying?',
    abandoned: 'What made studying stall?',
    clean: 'What study tactic worked best?',
    partial: 'What concept got clearer?',
  },
};

export function situationFor(summary: SessionSummary, isComeback: boolean): Situation {
  if (isComeback) {
    return 'comeback';
  }
  return summary.finalScore >= 85 ? 'clean' : 'partial';
}

export function displayFor(lane: Lane, situation: Situation): Display {
  const toneMap: Record<Situation, 'calm' | 'coach' | 'study' | 'intense'> = {
    comeback: 'coach',
    abandoned: 'calm',
    clean: 'study',
    partial: 'intense',
  };
  return {
    body: `${lane} session saved with ${situation} momentum.`,
    title: situation === 'clean' ? 'Clean work logged' : 'Session logged',
    tone: toneMap[situation],
  };
}

export function buildMemoryCandidates(
  input: CompletionPersonalizationInput,
  situation: Situation,
  deletedMemoryIds?: string[],
): CompletionMemoryCandidate[] {
  const key = `completion:${input.summary.sessionId}:${situation}`;
  if (deletedMemoryIds?.includes(key)) {
    return [];
  }
  return [
    {
      confidence: 0.7,
      key,
      text: `Lane ${input.lane} finished a ${situation} session.`,
    },
  ];
}

export function unlockFor(
  lane: Lane,
  hiddenFeatureKeys: string[],
): CompletionUnlockDecision {
  const key = hiddenFeatureKeys[0] ?? lane;
  return {
    isUnlocked: hiddenFeatureKeys.length === 0,
    key,
    reason:
      hiddenFeatureKeys.length === 0
        ? 'Your session activity unlocked the next surface.'
        : 'Keep building signal to unlock this surface.',
  };
}

export function buildProgressProof(
  _input: CompletionPersonalizationInput,
  _situation: Situation,
  xpDelta: number,
  grade: string,
  _streakDays?: number,
  _streakAction?: string,
  _focusScoreDelta?: number,
  _isPersonalBest?: boolean,
): { headline: string; items: string[] } {
  return {
    headline: `Grade ${grade} secured`,
    items: [`${xpDelta} XP earned`],
  };
}

export function buildUserFacingSummary(
  _lane: Lane,
  _situation: Situation,
  display: Display,
): CompletionUserFacingSummary {
  return display;
}

export function buildCompletionLearning(
  input: CompletionPersonalizationInput,
  situation: Situation,
  lane: Lane,
  streakDays: number,
): Record<string, string | number> {
  return {
    lane,
    sessionId: input.summary.sessionId,
    situation,
    streakDays,
  };
}

export function buildCompletionReflection(input: CompletionReflectionInput): string {
  const score = input.sessionSummary.finalScore;
  if (score >= 90) {
    return 'Clean session. VEX logged the win.';
  }
  return 'Session saved. Next block can tighten the score.';
}
