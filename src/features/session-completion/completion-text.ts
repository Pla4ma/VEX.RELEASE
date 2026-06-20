import type { CompletionReflectionInput } from './schemas';
import type {
  CompletionMemoryCandidate,
  CompletionPersonalizationInput,
  CompletionUnlockDecision,
  CompletionUserFacingSummary,
} from './schemas';
import type { Lane } from '../lane-engine/types';
import type { SessionSummary } from '../../session/types';

export type Situation = 'abandoned' | 'clean' | 'comeback' | 'partial';
export type Display = {
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
  if (summary.status === 'ABANDONED') {
    return 'abandoned';
  }
  if (summary.completionPercentage < 50) {
    return 'partial';
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
  const key = `${input.summary.sessionId}:${input.lane}:${situation}`;
  if (deletedMemoryIds?.includes(key)) {
    return [];
  }
  const baseText = `Lane ${input.lane} finished a ${situation} session.`;
  const text = input.reflectionAnswer
    ? `${baseText} ${input.reflectionAnswer}`
    : baseText;
  return [
    {
      confidence: 0.7,
      key,
      source: 'session_completion',
      text,
    },
  ];
}

const LANE_SURFACE_KEY: Record<Lane, string> = {
  student: 'study_os',
  game_like: 'run_board',
  deep_creative: 'project_thread',
  minimal_normal: 'today_strip',
};

export function unlockFor(
  lane: Lane,
  hiddenFeatureKeys: string[],
): CompletionUnlockDecision {
  const key = hiddenFeatureKeys[0] ?? LANE_SURFACE_KEY[lane];
  const isHidden = hiddenFeatureKeys.length > 0;
  return {
    isUnlocked: !isHidden,
    key,
    hidden: isHidden,
    reason: isHidden
      ? 'Keep building signal to unlock this surface.'
      : 'Your session activity unlocked the next surface.',
    status: isHidden ? 'blocked' : 'teased',
  };
}

export function buildProgressProof(
  input: CompletionPersonalizationInput,
  _situation: Situation,
  xpDelta: number,
  grade: string,
  streakDays: number = 0,
  streakAction: string = 'extended',
  focusScoreDelta: number = 0,
  isPersonalBest: boolean = false,
): { headline: string; items: string[]; xpDelta: number; grade: string; streakDays: number; streakAction: string; focusScoreDelta: number; isPersonalBest: boolean; effectiveMinutes: number; completionPercentage: number } {
  const effectiveMinutes = Math.round((input.summary.effectiveDuration ?? 0) / 60);
  return {
    headline: `Grade ${grade} secured`,
    items: [`${xpDelta} XP earned`],
    xpDelta,
    grade,
    streakDays,
    streakAction,
    focusScoreDelta,
    isPersonalBest,
    effectiveMinutes,
    completionPercentage: input.summary.completionPercentage ?? 0,
  };
}

export function buildUserFacingSummary(
  _lane: Lane,
  _situation: Situation,
  display: Display,
): CompletionUserFacingSummary {
  return {
    ...display,
    displayTitle: display.title,
  };
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
