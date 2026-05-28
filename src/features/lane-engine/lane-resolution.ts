import {
  LaneProfileSchema,
  LaneReconsiderationInputSchema,
  MergeLaneProfilesInputSchema,
  ResolveBehaviorLaneInputSchema,
  ResolveInitialLaneInputSchema,
} from "./schemas";
import {
  addGoalScore,
  addStyleScore,
  createScores,
  makeEvidence,
} from "./scoring";
import type {
  LaneEvidence,
  LaneProfile,
  LaneReconsiderationInput,
  MergeLaneProfilesInput,
  ResolveBehaviorLaneInput,
  ResolveInitialLaneInput,
} from "./types";
import {
  buildProfile,
  manualProfile,
  applyBehaviorScores,
} from "./lane-engine-helpers";

export function resolveInitialLane(
  rawInput: ResolveInitialLaneInput,
): LaneProfile {
  const input = ResolveInitialLaneInputSchema.parse(rawInput);
  const observedAt = input.observedAt ?? Date.now();
  if (input.manualOverride)
    return manualProfile(input.manualOverride, observedAt);
  const scores = createScores();
  const evidence: LaneEvidence[] = [];
  addGoalScore(scores, input.primaryGoal);
  if (input.primaryGoal)
    evidence.push(
      makeEvidence("onboarding_goal", input.primaryGoal, 0.55, observedAt),
    );
  addStyleScore(scores, input.motivationStyle);
  if (input.motivationStyle)
    evidence.push(
      makeEvidence("motivation_style", input.motivationStyle, 0.6, observedAt),
    );
  if (input.sessionMode === "STUDY") scores.student += 0.25;
  if (input.sessionMode === "CREATIVE" || input.sessionMode === "DEEP_WORK")
    scores.deep_creative += 0.25;
  if (input.sessionMode)
    evidence.push(
      makeEvidence("session_mode", input.sessionMode, 0.25, observedAt),
    );
  return buildProfile(scores, evidence, observedAt);
}

export function resolveBehaviorLane(
  rawInput: ResolveBehaviorLaneInput,
): LaneProfile {
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
  return LaneProfileSchema.parse({ ...resolved, source: "behavior" });
}

export function mergeLaneProfiles(
  rawInput: MergeLaneProfilesInput,
): LaneProfile {
  const input = MergeLaneProfilesInputSchema.parse(rawInput);
  if (input.onboardingProfile.source === "manual_override")
    return input.onboardingProfile;
  if (input.completedSessions < 3) return input.onboardingProfile;
  return input.behaviorProfile.confidence > input.onboardingProfile.confidence
    ? input.behaviorProfile
    : input.onboardingProfile;
}

export function shouldReconsiderLane(
  rawInput: LaneReconsiderationInput,
): boolean {
  const input = LaneReconsiderationInputSchema.parse(rawInput);
  if (input.currentProfile.source === "manual_override") return false;
  if (input.completedSessions < 3) return false;
  return (
    input.latestProfile.primaryLane !== input.currentProfile.primaryLane &&
    input.latestProfile.confidence >= 0.7
  );
}

export function shouldSuggestLaneReconsideration(
  rawInput: LaneReconsiderationInput,
): boolean {
  const input = LaneReconsiderationInputSchema.parse(rawInput);
  if (input.completedSessions < 3) return false;
  return (
    input.latestProfile.primaryLane !== input.currentProfile.primaryLane &&
    input.latestProfile.confidence >= 0.7
  );
}
