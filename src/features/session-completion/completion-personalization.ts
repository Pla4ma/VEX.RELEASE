import { captureSilentFailure } from '../../utils/silent-failure';

import {
  CompletionPersonalizationInputSchema,
  CompletionPersonalizationSchema,
  type CompletionPersonalization,
  type CompletionPersonalizationInput,
  type CompletionPersonalizationResult,
} from './schemas';
import { resolveCompletionLaneProfile } from '../lane-engine/service';
import type { Lane, LaneProfile } from '../lane-engine/types';
import type { SessionSummary } from '../../session/types';
import { buildPostSessionNextAction } from './post-session-next-action';
import type { PostSessionNextAction } from './schemas';
import {
  REFLECTIONS,
  situationFor,
  displayFor,
  buildCompletionLearning,
  buildMemoryCandidates,
  buildProgressProof,
  buildUserFacingSummary,
  unlockFor,
} from './completion-text';

export function buildCompletionPersonalization(
  rawInput: CompletionPersonalizationInput,
): CompletionPersonalization {
  const input = CompletionPersonalizationInputSchema.parse(rawInput);
  const situation = situationFor(input.summary, input.isComeback);
  const display = displayFor(input.lane, situation);
  return CompletionPersonalizationSchema.parse({
    ...display,
    displayBody: display.body,
    lane: input.lane,
    memoryCandidates: buildMemoryCandidates(input, situation, input.deletedMemoryIds),
    nextActionLabel: situation === 'clean' ? 'Start next session' : 'Continue building',
    reflectionQuestion: REFLECTIONS[input.lane][situation],
    unlockDecision: unlockFor(input.lane, input.hiddenFeatureKeys),
  });
}

export function buildCompletionPersonalizationResult(input: {
  deletedMemoryIds?: string[];
  focusScoreDelta: number;
  grade: string;
  hiddenFeatureKeys?: string[];
  isComeback?: boolean;
  isPersonalBest: boolean;
  lane?: Lane;
  laneProfile?: LaneProfile;
  streakAction: 'extended' | 'maintained' | 'broken' | 'saved_by_insurance';
  streakDays: number;
  summary: SessionSummary;
  xpDelta: number;
  reflectionAnswer?: string | null;
}): CompletionPersonalizationResult {
  const {
    deletedMemoryIds = [],
    focusScoreDelta,
    grade,
    hiddenFeatureKeys = [],
    isComeback = false,
    isPersonalBest,
    lane = 'minimal_normal',
    laneProfile,
    streakAction,
    streakDays,
    summary,
    xpDelta,
    reflectionAnswer,
  } = input;

  const personalizationInput: CompletionPersonalizationInput = {
    deletedMemoryIds,
    hiddenFeatureKeys,
    isComeback,
    lane,
    reflectionAnswer: reflectionAnswer ?? null,
    summary,
  };

  const situation = situationFor(summary, isComeback);
  const resolvedLaneProfile =
    laneProfile ?? resolveCompletionLaneProfile({ lane, situation });
  const resolvedLane = resolvedLaneProfile.primaryLane;
  personalizationInput.lane = resolvedLane;
  const display = displayFor(resolvedLane, situation);

  let nextAction: PostSessionNextAction | null = null;
  try {
    nextAction = buildPostSessionNextAction({ summary });
  } catch (error: unknown) {
    captureSilentFailure(error, { feature: 'session-completion', operation: 'personalization', type: 'ui' });
    // nextAction is optional — null means degraded systems hid the next move
  }

  return {
    laneProfile: resolvedLaneProfile,
    progressProof: buildProgressProof(
      personalizationInput,
      situation,
      xpDelta,
      grade,
      streakDays,
      streakAction,
      focusScoreDelta,
      isPersonalBest,
    ),
    reflectionQuestion: REFLECTIONS[resolvedLane][situation],
    memoryCandidates: buildMemoryCandidates(
      { ...personalizationInput, reflectionAnswer: reflectionAnswer ?? null },
      situation,
      deletedMemoryIds,
    ),
    unlockDecision: unlockFor(resolvedLane, hiddenFeatureKeys),
    nextAction,
    userFacingSummary: buildUserFacingSummary(resolvedLane, situation, display),
    completionLearning: buildCompletionLearning(
      personalizationInput,
      situation,
      resolvedLane,
      streakDays,
    ),
  };
}
