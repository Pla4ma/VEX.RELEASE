import {
  LaneConfirmationSchema,
  LaneProfileSchema,
  CompletionEvidenceInputSchema,
  LANE_CONFIRMATION_COPY,
  LANE_USER_FACING_NAMES,
  type CompletionEvidenceInput,
} from "./schemas";
import { makeEvidence } from "./scoring";
import type {
  Lane,
  LaneConfirmation,
  LaneEvidence,
  LaneProfile,
  ResolveInitialLaneInput,
} from "./types";
import {
  confidenceBand,
  manualProfile,
} from "./lane-engine-helpers";
import { resolveInitialLane } from "./lane-resolution";

export type CompletionLaneSituation =
  | "clean"
  | "partial"
  | "abandoned"
  | "comeback";

export function resolveCompletionLaneProfile(input: {
  lane: Lane;
  situation: CompletionLaneSituation;
  observedAt?: number;
}): LaneProfile {
  const observedAt = input.observedAt ?? Date.now();
  const confidence = input.situation === "clean" ? 0.6 : 0.35;
  return LaneProfileSchema.parse({
    ...manualProfile(input.lane, observedAt),
    confidence,
    confidenceBand: confidenceBand(confidence),
    evidence: [
      makeEvidence(
        "session_mode",
        `completion:${input.situation}`,
        0.25,
        observedAt,
      ),
    ],
    source: "behavior",
  });
}

export function accumulateCompletionEvidence(
  rawInput: CompletionEvidenceInput,
): LaneEvidence[] {
  const input = CompletionEvidenceInputSchema.parse(rawInput);
  const evidence: LaneEvidence[] = [];
  const observedAt = Date.now();

  if (input.sessionMode === "STUDY") {
    evidence.push(makeEvidence("study_usage", "completion", 0.3, observedAt));
  } else if (
    input.sessionMode === "CREATIVE" ||
    input.sessionMode === "DEEP_WORK"
  ) {
    evidence.push(
      makeEvidence("creative_usage", "completion", 0.3, observedAt),
    );
  } else {
    evidence.push(
      makeEvidence(
        "session_mode",
        input.sessionMode ?? "FLOW",
        0.15,
        observedAt,
      ),
    );
  }

  if (input.completionPercentage >= 100) {
    evidence.push(
      makeEvidence("session_mode", "clean_finish", 0.2, observedAt),
    );
  }

  evidence.push({
    source: "session_mode",
    value: `grade:${input.grade}`,
    weight: Math.min(
      0.25,
      Math.max(0.05, (input.completionPercentage / 100) * 0.25),
    ),
    observedAt,
  });

  return evidence;
}

export function confirmInitialLane(
  rawInput: ResolveInitialLaneInput,
): LaneConfirmation {
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
