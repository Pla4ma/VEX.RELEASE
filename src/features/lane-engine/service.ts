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
import { addGoalScore, addStyleScore, createScores, makeEvidence, type LaneScores } from './scoring';
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
export { getLaneMechanicPolicy };
const ORDERED_LANES: Lane[] = ['student', 'game_like', 'deep_creative', 'minimal_normal'];
function confidenceBand(confidence: number): LaneProfile['confidenceBand'] {
  if (confidence >= 0.7) return 'high';
  if (confidence >= 0.4) return 'medium';
  return 'low';
}
function traitsForLane(lane: Lane): LaneProfile['traits'] {
  if (lane === 'student') return { needsStructure: 0.9, wantsPlay: 0.2, needsContinuity: 0.6, wantsQuiet: 0.4 };
  if (lane === 'game_like') return { needsStructure: 0.6, wantsPlay: 0.9, needsContinuity: 0.5, wantsQuiet: 0.1 };
  if (lane === 'deep_creative') return { needsStructure: 0.5, wantsPlay: 0.2, needsContinuity: 0.9, wantsQuiet: 0.7 };
  return { needsStructure: 0.5, wantsPlay: 0.1, needsContinuity: 0.4, wantsQuiet: 0.9 };
}
function ranked(scores: LaneScores): Array<{ lane: Lane; score: number }> {
  return ORDERED_LANES
    .map((lane) => ({ lane, score: Math.max(0, scores[lane]) }))
    .sort((a, b) => b.score - a.score);
}
function buildProfile(scores: LaneScores, evidence: LaneEvidence[], observedAt: number): LaneProfile {
  const sorted = ranked(scores);
  const top = sorted[0] ?? { lane: 'minimal_normal', score: 0 };
  const next = sorted[1] ?? { lane: 'minimal_normal', score: 0 };
  const total = sorted.reduce((sum, item) => sum + item.score, 0);
  const rawConfidence = total > 0 ? top.score / Math.max(total, 1) : 0.2;
  const secondaryLane = next.score > 0 && Math.abs(top.score - next.score) <= 0.1 ? next.lane : null;
  const source = evidence.length === 0 ? 'fallback' : 'onboarding';
  return LaneProfileSchema.parse({
    primaryLane: total > 0 ? top.lane : 'minimal_normal',
    secondaryLane,
    confidence: Math.min(1, rawConfidence),
    confidenceBand: confidenceBand(Math.min(1, rawConfidence)),
    source,
    evidence,
    traits: traitsForLane(total > 0 ? top.lane : 'minimal_normal'),
    resolvedAt: observedAt,
  });
}
function manualProfile(lane: Lane, observedAt: number): LaneProfile {
  return LaneProfileSchema.parse({
    primaryLane: lane,
    secondaryLane: null,
    confidence: 1,
    confidenceBand: 'high',
    source: 'manual_override',
    evidence: [makeEvidence('manual_override', lane, 1, observedAt)],
    traits: traitsForLane(lane),
    resolvedAt: observedAt,
  });
}

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

function applyBehaviorScores(scores: LaneScores, evidence: LaneEvidence[], input: ResolveBehaviorLaneInput, observedAt: number): void {
  if (input.studyUsageRatio >= 0.35) {
    scores.student += 0.35;
    scores.deep_creative += 0.1;
    evidence.push(makeEvidence('study_usage', String(input.studyUsageRatio), 0.35, observedAt));
  }
  if (input.deepCreativeUsageRatio >= 0.35) {
    scores.deep_creative += 0.4;
    evidence.push(makeEvidence('creative_usage', String(input.deepCreativeUsageRatio), 0.4, observedAt));
  }
  if (input.bossEngagement === 'high') {
    scores.game_like += 0.35;
    scores.minimal_normal -= 0.2;
    evidence.push(makeEvidence('boss_engagement', 'high', 0.35, observedAt));
  }
  if (input.bossDismissals >= 3) {
    scores.game_like -= 0.35;
    scores.minimal_normal += 0.25;
    evidence.push(makeEvidence('surface_signal', 'boss_dismissed', 0.25, observedAt));
  }
  if (input.challengeClicks >= 2) {
    scores.student += 0.05;
    scores.game_like += 0.25;
    scores.deep_creative += 0.05;
  }
  if (input.notificationDismissals >= 3) scores.minimal_normal += 0.2;
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
