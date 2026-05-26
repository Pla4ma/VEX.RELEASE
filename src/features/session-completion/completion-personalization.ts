import {
  CompletionPersonalizationInputSchema,
  CompletionPersonalizationSchema,
  type CompletionPersonalization,
  type CompletionPersonalizationInput,
  type CompletionPersonalizationResult,
} from "./schemas";
import type { Lane } from "../lane-engine/types";
import type { SessionSummary } from "../../session/types";
import { buildPostSessionNextAction } from "./post-session-next-action";
import type { PostSessionNextAction } from "./schemas";
import { buildLaneProfile } from "./completion-lane-profile";
import {
  REFLECTIONS,
  situationFor,
  displayFor,
  buildMemoryCandidates,
  buildProgressProof,
  buildUserFacingSummary,
  unlockFor,
} from "./completion-text";

export function buildCompletionPersonalization(
  rawInput: CompletionPersonalizationInput,
): CompletionPersonalization {
  const input = CompletionPersonalizationInputSchema.parse(rawInput);
  const situation = situationFor(input.summary, input.isComeback);
  const display = displayFor(input.lane, situation);
  return CompletionPersonalizationSchema.parse({
    ...display,
    lane: input.lane,
    memoryCandidates: buildMemoryCandidates(input, situation),
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
  lane: Lane;
  streakAction: "extended" | "maintained" | "broken" | "saved_by_insurance";
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
    lane,
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
  const display = displayFor(lane, situation);

  let nextAction: PostSessionNextAction | null = null;
  try {
    nextAction = buildPostSessionNextAction({ summary });
  } catch {
    // nextAction is optional — null means degraded systems hid the next move
  }

  return {
    laneProfile: buildLaneProfile(lane, situation, summary),
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
    reflectionQuestion: REFLECTIONS[lane][situation],
    memoryCandidates: buildMemoryCandidates(
      { ...personalizationInput, reflectionAnswer: reflectionAnswer ?? null },
      situation,
    ),
    unlockDecision: unlockFor(lane, hiddenFeatureKeys),
    nextAction,
    userFacingSummary: buildUserFacingSummary(lane, situation, display),
  };
}
