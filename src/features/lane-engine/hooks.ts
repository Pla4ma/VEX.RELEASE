import { useMemo } from 'react';

import { resolveBehaviorLane, resolveInitialLane } from './service';
import type {
  LaneProfile,
  ResolveBehaviorLaneInput,
  ResolveInitialLaneInput,
} from './types';

export function useInitialLane(input: ResolveInitialLaneInput): LaneProfile {
  return useMemo(() => resolveInitialLane(input), [input]);
}

export function useBehaviorLane(input: ResolveBehaviorLaneInput): LaneProfile {
  return useMemo(() => resolveBehaviorLane(input), [input]);
}

export type { LaneProfile, ResolveInitialLaneInput } from './types';
export type Lane = 'student' | 'game_like' | 'deep_creative' | 'minimal_normal';
export type MotivationStyle = 'calm' | 'friendly' | 'coach_led' | 'game_like' | 'intense' | 'study_focused';
