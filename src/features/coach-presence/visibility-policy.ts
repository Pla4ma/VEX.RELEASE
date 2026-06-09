import type { Lane } from '../lane-engine/types';
import type { CoachVisibilityDecision, CoachVisibilityPolicy, CoachVisibilitySurface } from './schemas';

type VisibilityMap = Record<
  CoachVisibilitySurface,
  Record<Lane, CoachVisibilityDecision>
>;

const VISIBILITY_MAP: VisibilityMap = {
  ONBOARDING: {
    student: 'SUBTLE_ONE_LINE',
    game_like: 'SUBTLE_ONE_LINE',
    deep_creative: 'SUBTLE_ONE_LINE',
    minimal_normal: 'SUBTLE_ONE_LINE',
  },
  DAY_0_HOME: {
    student: 'VISIBLE',
    game_like: 'VISIBLE',
    deep_creative: 'VISIBLE',
    minimal_normal: 'VISIBLE',
  },
  SESSION_SETUP: {
    student: 'SUBTLE_ONE_LINE',
    game_like: 'SUBTLE_ONE_LINE',
    deep_creative: 'SUBTLE_ONE_LINE',
    minimal_normal: 'HIDDEN',
  },
  ACTIVE_SESSION: {
    student: 'HIDDEN',
    game_like: 'HIDDEN',
    deep_creative: 'HIDDEN',
    minimal_normal: 'HIDDEN',
  },
  PAUSE_INTERRUPTION: {
    student: 'SUBTLE_ONE_LINE',
    game_like: 'SUBTLE_ONE_LINE',
    deep_creative: 'SUBTLE_ONE_LINE',
    minimal_normal: 'SUBTLE_ONE_LINE',
  },
  COMPLETION: {
    student: 'VISIBLE',
    game_like: 'VISIBLE',
    deep_creative: 'VISIBLE',
    minimal_normal: 'VISIBLE',
  },
  RESCUE: {
    student: 'VISIBLE',
    game_like: 'VISIBLE',
    deep_creative: 'VISIBLE',
    minimal_normal: 'VISIBLE',
  },
  PREMIUM: {
    student: 'SUBTLE_ONE_LINE',
    game_like: 'SUBTLE_ONE_LINE',
    deep_creative: 'SUBTLE_ONE_LINE',
    minimal_normal: 'SUBTLE_ONE_LINE',
  },
  RETURN_HOME: {
    student: 'VISIBLE',
    game_like: 'VISIBLE',
    deep_creative: 'VISIBLE',
    minimal_normal: 'VISIBLE',
  },
} as const;

function reasonFor(
  surface: CoachVisibilitySurface,
  lane: Lane,
  _decision: CoachVisibilityDecision,
): string {
  if (surface === 'ACTIVE_SESSION') {
    return 'Active focus — no Coach spam.';
  }
  if (surface === 'SESSION_SETUP' && lane === 'minimal_normal') {
    return 'Clean Mode — quiet Coach. Setup is the signal.';
  }
  if (surface === 'SESSION_SETUP') {
    return `${laneLabel(lane)} Mode — precise guidance at setup only.`;
  }
  if (surface === 'ONBOARDING') {
    return 'Day 0 — minimal Coach. User is learning the app.';
  }
  if (surface === 'COMPLETION' || surface === 'RESCUE') {
    return `${surface === 'COMPLETION' ? 'Completion' : 'Rescue'} is key retention moment.`;
  }
  if (surface === 'PREMIUM') {
    return 'Premium shown after value proof. Subtle Coach only.';
  }
  if (surface === 'RETURN_HOME') {
    return 'Home return after session — Coach anchor moment.';
  }
  return 'Coach visible for guidance.';
}

function laneLabel(lane: Lane): string {
  const labels: Record<Lane, string> = {
    student: 'Study',
    game_like: 'Run',
    deep_creative: 'Project',
    minimal_normal: 'Clean',
  };
  return labels[lane];
}

export function decideCoachVisibility(input: {
  lane: Lane;
  surface: CoachVisibilitySurface;
}): CoachVisibilityPolicy {
  const decision = VISIBILITY_MAP[input.surface][input.lane];
  return {
    decision,
    lane: input.lane,
    maxMessageLength:
      decision === 'SUBTLE_ONE_LINE' ? 48 : decision === 'HIDDEN' ? 0 : 96,
    reason: reasonFor(input.surface, input.lane, decision),
    surface: input.surface,
  };
}
