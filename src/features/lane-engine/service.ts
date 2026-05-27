import {
  LaneConfirmationSchema,
  LaneProfileSchema,
  LaneReconsiderationInputSchema,
  MergeLaneProfilesInputSchema,
  ResolveBehaviorLaneInputSchema,
  ResolveInitialLaneInputSchema,
  LANE_CONFIRMATION_COPY,
  LANE_USER_FACING_NAMES,
  CompletionEvidenceInputSchema,
  type CompletionEvidenceInput,
} from './schemas';
import { addGoalScore, addStyleScore, createScores, makeEvidence } from './scoring';
import { getLaneMechanicPolicy } from './policy';
import type {
  Lane,
  LaneConfirmation,
  LaneEvidence,
  LaneProfile,
  LaneReconsiderationInput,
  MergeLaneProfilesInput,
  ResolveBehaviorLaneInput,
  ResolveInitialLaneInput,
} from './types';
import {
  confidenceBand,
  traitsForLane,
  buildProfile,
  manualProfile,
  applyBehaviorScores,
} from './lane-engine-helpers';

export { getLaneMechanicPolicy };

export function resolveInitialLane(rawInput: ResolveInitialLaneInput): LaneProfile {
  const input = ResolveInitialLaneInputSchema.parse(rawInput);
  const observedAt = input.observedAt ?? Date.now();
  if (input.manualOverride) return manualProfile(input.manualOverride, observedAt);
  const scores = createScores();
  const evidence: LaneEvidence[] = [];
  addGoalScore(scores, input.primaryGoal);
  if (input.primaryGoal) evidence.push(makeEvidence('onboarding_goal', input.primaryGoal, 0.55, observedAt));
  addStyleScore(scores, input.motivationStyle);
  if (input.motivationStyle) evidence.push(makeEvidence('motivation_style', input.motivationStyle, 0.6, observedAt));
  if (input.sessionMode === 'STUDY') scores.student += 0.25;
  if (input.sessionMode === 'CREATIVE' || input.sessionMode === 'DEEP_WORK') scores.deep_creative += 0.25;
  if (input.sessionMode) evidence.push(makeEvidence('session_mode', input.sessionMode, 0.25, observedAt));
  return buildProfile(scores, evidence, observedAt);
}

export function resolveBehaviorLane(rawInput: ResolveBehaviorLaneInput): LaneProfile {
  const input = ResolveBehaviorLaneInputSchema.parse(rawInput);
  const profile = resolveInitialLane({
    primaryGoal: input.primaryGoal,
    motivationStyle: input.motivationStyle,
    sessionMode: input.sessionMode,
    manualOverride: input.manualOverride,
    observedAt: input.observedAt,
  });
  if (input.manualOverride || input.completedSessions < 3) return profile;
  const scores = createScores();
  const evidence = [...profile.evidence];
  addGoalScore(scores, input.primaryGoal);
  addStyleScore(scores, input.motivationStyle);
  applyBehaviorScores(scores, evidence, input, profile.resolvedAt);
  const resolved = buildProfile(scores, evidence, profile.resolvedAt);
  return LaneProfileSchema.parse({ ...resolved, source: 'behavior' });
}

export function mergeLaneProfiles(rawInput: MergeLaneProfilesInput): LaneProfile {
  const input = MergeLaneProfilesInputSchema.parse(rawInput);
  if (input.onboardingProfile.source === 'manual_override') return input.onboardingProfile;
  if (input.completedSessions < 3) return input.onboardingProfile;
  return input.behaviorProfile.confidence > input.onboardingProfile.confidence
    ? input.behaviorProfile
    : input.onboardingProfile;
}

export function shouldReconsiderLane(rawInput: LaneReconsiderationInput): boolean {
  const input = LaneReconsiderationInputSchema.parse(rawInput);
  if (input.currentProfile.source === 'manual_override') return false;
  if (input.completedSessions < 3) return false;
  return input.latestProfile.primaryLane !== input.currentProfile.primaryLane
    && input.latestProfile.confidence >= 0.7;
}

export function shouldSuggestLaneReconsideration(rawInput: LaneReconsiderationInput): boolean {
  const input = LaneReconsiderationInputSchema.parse(rawInput);
  if (input.completedSessions < 3) return false;
  return input.latestProfile.primaryLane !== input.currentProfile.primaryLane
    && input.latestProfile.confidence >= 0.7;
}

export type CompletionLaneSituation = 'clean' | 'partial' | 'abandoned' | 'comeback';

export function resolveCompletionLaneProfile(input: { lane: Lane; situation: CompletionLaneSituation; observedAt?: number }): LaneProfile {
  const observedAt = input.observedAt ?? Date.now();
  const confidence = input.situation === 'clean' ? 0.6 : 0.35;
  return LaneProfileSchema.parse({
    ...manualProfile(input.lane, observedAt),
    confidence, confidenceBand: confidenceBand(confidence),
    evidence: [makeEvidence('session_mode', `completion:${input.situation}`, 0.25, observedAt)],
    source: 'behavior',
  });
}

export function accumulateCompletionEvidence(rawInput: CompletionEvidenceInput): LaneEvidence[] {
  const input = CompletionEvidenceInputSchema.parse(rawInput);
  const evidence: LaneEvidence[] = [];
  const observedAt = Date.now();

  if (input.sessionMode === 'STUDY') {
    evidence.push(makeEvidence('study_usage', 'completion', 0.3, observedAt));
  } else if (input.sessionMode === 'CREATIVE' || input.sessionMode === 'DEEP_WORK') {
    evidence.push(makeEvidence('creative_usage', 'completion', 0.3, observedAt));
  } else {
    evidence.push(makeEvidence('session_mode', input.sessionMode ?? 'FLOW', 0.15, observedAt));
  }

  if (input.completionPercentage >= 100) {
    evidence.push(makeEvidence('session_mode', 'clean_finish', 0.2, observedAt));
  }

  evidence.push({
    source: 'session_mode',
    value: `grade:${input.grade}`,
    weight: Math.min(0.25, Math.max(0.05, (input.completionPercentage / 100) * 0.25)),
    observedAt,
  });

  return evidence;
}

export function confirmInitialLane(rawInput: ResolveInitialLaneInput): LaneConfirmation {
  const profile = resolveInitialLane(rawInput);
  const lane = profile.primaryLane;
  return LaneConfirmationSchema.parse({
    recommendedLane: lane,
    userFacingName: LANE_USER_FACING_NAMES[lane],
    reason: LANE_CONFIRMATION_COPY[lane],
    confidence: profile.confidence,
    canChangeLater: true,
  });
}
