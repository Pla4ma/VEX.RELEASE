import { LaneProfileSchema } from './schemas';
import { makeEvidence, type LaneScores } from './scoring';
import type {
  Lane,
  LaneEvidence,
  LaneProfile,
  ResolveBehaviorLaneInput,
} from './types';

export const ORDERED_LANES: Lane[] = [
  'student',
  'game_like',
  'deep_creative',
  'minimal_normal',
];

export function confidenceBand(
  confidence: number,
): LaneProfile['confidenceBand'] {
  if (confidence >= 0.7) {return 'high';}
  if (confidence >= 0.4) {return 'medium';}
  return 'low';
}

export function traitsForLane(lane: Lane): LaneProfile['traits'] {
  if (lane === 'student')
    {return {
      needsStructure: 0.9,
      wantsPlay: 0.2,
      needsContinuity: 0.6,
      wantsQuiet: 0.4,
    };}
  if (lane === 'game_like')
    {return {
      needsStructure: 0.6,
      wantsPlay: 0.9,
      needsContinuity: 0.5,
      wantsQuiet: 0.1,
    };}
  if (lane === 'deep_creative')
    {return {
      needsStructure: 0.5,
      wantsPlay: 0.2,
      needsContinuity: 0.9,
      wantsQuiet: 0.7,
    };}
  return {
    needsStructure: 0.5,
    wantsPlay: 0.1,
    needsContinuity: 0.4,
    wantsQuiet: 0.9,
  };
}

export function ranked(
  scores: LaneScores,
): Array<{ lane: Lane; score: number }> {
  return ORDERED_LANES.map((lane) => ({
    lane,
    score: Math.max(0, scores[lane]),
  })).sort((a, b) => b.score - a.score);
}

export function buildProfile(
  scores: LaneScores,
  evidence: LaneEvidence[],
  observedAt: number,
): LaneProfile {
  const sorted = ranked(scores);
  const top = sorted[0] ?? { lane: 'minimal_normal', score: 0 };
  const next = sorted[1] ?? { lane: 'minimal_normal', score: 0 };
  const total = sorted.reduce((sum, item) => sum + item.score, 0);
  const rawConfidence = total > 0 ? top.score / Math.max(total, 1) : 0.2;
  const secondaryLane =
    next.score > 0 && Math.abs(top.score - next.score) <= 0.1
      ? next.lane
      : null;
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

export function manualProfile(lane: Lane, observedAt: number): LaneProfile {
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

export function applyBehaviorScores(
  scores: LaneScores,
  evidence: LaneEvidence[],
  input: ResolveBehaviorLaneInput,
  observedAt: number,
): void {
  if (input.studyUsageRatio >= 0.35) {
    scores.student += 0.35;
    scores.deep_creative += 0.1;
    evidence.push(
      makeEvidence(
        'study_usage',
        String(input.studyUsageRatio),
        0.35,
        observedAt,
      ),
    );
  }
  if (input.deepCreativeUsageRatio >= 0.35) {
    scores.deep_creative += 0.4;
    evidence.push(
      makeEvidence(
        'creative_usage',
        String(input.deepCreativeUsageRatio),
        0.4,
        observedAt,
      ),
    );
  }
  if (input.bossEngagement === 'high') {
    scores.game_like += 0.35;
    scores.minimal_normal -= 0.2;
    evidence.push(makeEvidence('run_engagement', 'high', 0.35, observedAt));
  }
  if (input.bossDismissals >= 3) {
    scores.game_like -= 0.35;
    scores.minimal_normal += 0.25;
    evidence.push(
      makeEvidence('surface_signal', 'boss_dismissed', 0.25, observedAt),
    );
  }
  if (input.challengeClicks >= 2) {
    scores.student += 0.05;
    scores.game_like += 0.25;
    scores.deep_creative += 0.05;
  }
  if (input.notificationDismissals >= 3) {scores.minimal_normal += 0.2;}
}
